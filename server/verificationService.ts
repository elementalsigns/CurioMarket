import { db } from "./db";
import { 
  users, 
  verificationRequests, 
  identityVerificationSessions,
  sellerReviewQueue,
  verificationAuditLog,
  sellers,
  type User,
  type VerificationRequest,
  type InsertVerificationRequest,
  type IdentityVerificationSession,
  type SellerReviewQueueItem
} from "@shared/schema";
import { eq, and, lt, gt, desc, asc } from "drizzle-orm";
import crypto from "crypto";

export class VerificationService {
  
  // Email verification
  async initiateEmailVerification(userId: string): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(verificationRequests).values({
      userId,
      type: 'email',
      verificationCode: code,
      codeExpiresAt: expiresAt,
      expiresAt,
    });

    await this.logVerificationAction(userId, 'email_verification_initiated', userId);

    return { code, expiresAt };
  }

  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    const request = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.type, 'email'),
        eq(verificationRequests.verificationCode, code),
        eq(verificationRequests.status, 'pending'),
        gt(verificationRequests.codeExpiresAt, new Date())
      ),
    });

    if (!request) {
      await this.incrementVerificationAttempt(userId, 'email');
      await this.logVerificationAction(userId, 'email_verification_failed', userId);
      return false;
    }

    // Mark as verified
    await db.update(verificationRequests)
      .set({ 
        status: 'verified',
        reviewedAt: new Date() 
      })
      .where(eq(verificationRequests.id, request.id));

    await db.update(users)
      .set({ 
        emailVerified: true,
        verificationLevel: 1 
      })
      .where(eq(users.id, userId));

    await this.logVerificationAction(userId, 'email_verified', userId);
    return true;
  }

  // Phone verification
  async initiatePhoneVerification(userId: string, phoneNumber: string): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateVerificationCode(6); // 6-digit SMS code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(verificationRequests).values({
      userId,
      type: 'phone',
      data: { phoneNumber },
      verificationCode: code,
      codeExpiresAt: expiresAt,
      expiresAt,
    });

    // Update user phone number
    await db.update(users)
      .set({ phoneNumber })
      .where(eq(users.id, userId));

    await this.logVerificationAction(userId, 'phone_verification_initiated', userId, { phoneNumber });

    // In a real app, send SMS here via Twilio, AWS SNS, etc.
    console.log(`SMS code for ${phoneNumber}: ${code}`);

    return { code, expiresAt };
  }

  async verifyPhoneCode(userId: string, code: string): Promise<boolean> {
    const request = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.type, 'phone'),
        eq(verificationRequests.verificationCode, code),
        eq(verificationRequests.status, 'pending'),
        gt(verificationRequests.codeExpiresAt, new Date())
      ),
    });

    if (!request) {
      await this.incrementVerificationAttempt(userId, 'phone');
      await this.logVerificationAction(userId, 'phone_verification_failed', userId);
      return false;
    }

    // Mark as verified
    await db.update(verificationRequests)
      .set({ 
        status: 'verified',
        reviewedAt: new Date() 
      })
      .where(eq(verificationRequests.id, request.id));

    await db.update(users)
      .set({ 
        phoneVerified: true,
        verificationLevel: 2
      })
      .where(eq(users.id, userId));

    await this.logVerificationAction(userId, 'phone_verified', userId);
    return true;
  }

  // Identity verification (using Stripe Identity or similar)
  async initiateIdentityVerification(userId: string): Promise<{ sessionUrl?: string; sessionId: string }> {
    // Create identity verification session
    const session = await db.insert(identityVerificationSessions).values({
      userId,
      status: 'processing',
    }).returning();

    const sessionId = session[0].id;

    // In a real app, create Stripe Identity session here
    // const stripeSession = await stripe.identity.verificationSessions.create({
    //   type: 'document',
    //   return_url: `${process.env.BASE_URL}/verification/identity/complete`,
    //   metadata: { userId, sessionId }
    // });

    await this.logVerificationAction(userId, 'identity_verification_initiated', userId);

    return { 
      sessionId,
      sessionUrl: undefined // Would be stripeSession.url in real implementation
    };
  }

  // Address verification
  async initiateAddressVerification(userId: string, addressData: any): Promise<{ requestId: string }> {
    const request = await db.insert(verificationRequests).values({
      userId,
      type: 'address',
      data: addressData,
    }).returning();

    await db.update(users)
      .set({ 
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: addressData.country || 'US'
      })
      .where(eq(users.id, userId));

    await this.logVerificationAction(userId, 'address_verification_submitted', userId, addressData);

    return { requestId: request[0].id };
  }

  // Business verification for sellers
  async initiateSellerVerification(sellerId: string, businessData: any): Promise<{ queueId: string }> {
    // Add to seller review queue
    const queueItem = await db.insert(sellerReviewQueue).values({
      sellerId,
      queueType: 'initial',
      priority: this.calculateVerificationPriority(businessData),
      riskFactors: this.assessRiskFactors(businessData),
      submittedDocuments: businessData.documents || [],
    }).returning();

    // Update seller with business information
    await db.update(sellers)
      .set({
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        taxId: businessData.taxId ? this.encryptSensitiveData(businessData.taxId) : undefined,
        businessLicense: businessData.businessLicense,
        businessAddress: businessData.businessAddress,
        businessPhone: businessData.businessPhone,
        businessEmail: businessData.businessEmail,
        verificationStatus: 'pending'
      })
      .where(eq(sellers.id, sellerId));

    // Create verification request
    await db.insert(verificationRequests).values({
      userId: businessData.userId, // Get from seller lookup
      type: 'business',
      data: businessData,
      documents: businessData.documents || [],
    });

    await this.logVerificationAction(businessData.userId, 'seller_verification_submitted', businessData.userId, businessData);

    return { queueId: queueItem[0].id };
  }

  // Admin review functions
  async getVerificationQueue(status: string = 'pending', priority?: number): Promise<SellerReviewQueueItem[]> {
    const conditions = [eq(sellerReviewQueue.status, status)];
    
    if (priority) {
      conditions.push(eq(sellerReviewQueue.priority, priority));
    }

    return db.select()
      .from(sellerReviewQueue)
      .where(and(...conditions))
      .orderBy(asc(sellerReviewQueue.priority), asc(sellerReviewQueue.createdAt));
  }

  async approveSellerVerification(queueId: string, adminId: string, notes?: string): Promise<void> {
    const queueItem = await db.query.sellerReviewQueue.findFirst({
      where: eq(sellerReviewQueue.id, queueId),
    });

    if (!queueItem) throw new Error('Queue item not found');

    // Update queue item
    await db.update(sellerReviewQueue)
      .set({
        status: 'completed',
        decision: 'approved',
        reviewNotes: notes,
        reviewedAt: new Date(),
        assignedTo: adminId
      })
      .where(eq(sellerReviewQueue.id, queueId));

    // Update seller
    await db.update(sellers)
      .set({
        verificationStatus: 'approved',
        businessVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId
      })
      .where(eq(sellers.id, queueItem.sellerId));

    // Update user verification level
    const seller = await db.query.sellers.findFirst({
      where: eq(sellers.id, queueItem.sellerId),
      with: { user: true }
    });

    if (seller) {
      await db.update(users)
        .set({ verificationLevel: 4 })
        .where(eq(users.id, seller.userId));

      await this.logVerificationAction(seller.userId, 'seller_verification_approved', adminId, { notes });
    }
  }

  async rejectSellerVerification(queueId: string, adminId: string, reason: string): Promise<void> {
    const queueItem = await db.query.sellerReviewQueue.findFirst({
      where: eq(sellerReviewQueue.id, queueId),
    });

    if (!queueItem) throw new Error('Queue item not found');

    // Update queue item
    await db.update(sellerReviewQueue)
      .set({
        status: 'completed',
        decision: 'rejected',
        decisionReason: reason,
        reviewedAt: new Date(),
        assignedTo: adminId
      })
      .where(eq(sellerReviewQueue.id, queueId));

    // Update seller
    await db.update(sellers)
      .set({
        verificationStatus: 'rejected',
        rejectionReason: reason
      })
      .where(eq(sellers.id, queueItem.sellerId));

    const seller = await db.query.sellers.findFirst({
      where: eq(sellers.id, queueItem.sellerId),
      with: { user: true }
    });

    if (seller) {
      await this.logVerificationAction(seller.userId, 'seller_verification_rejected', adminId, { reason });
    }
  }

  // Risk assessment
  private assessRiskFactors(businessData: any): string[] {
    const risks: string[] = [];

    // Check for common risk indicators
    if (!businessData.businessLicense) risks.push('no_business_license');
    if (!businessData.taxId) risks.push('no_tax_id');
    if (businessData.businessType === 'sole_proprietor') risks.push('sole_proprietor');
    if (!businessData.businessAddress) risks.push('no_business_address');
    if (!businessData.businessPhone) risks.push('no_business_phone');

    // Add more sophisticated risk checks here
    return risks;
  }

  private calculateVerificationPriority(businessData: any): number {
    let priority = 5; // Default priority

    // Higher priority (lower number) for complete applications
    if (businessData.businessLicense) priority -= 1;
    if (businessData.taxId) priority -= 1;
    if (businessData.businessAddress) priority -= 1;

    // Lower priority (higher number) for risk factors
    const risks = this.assessRiskFactors(businessData);
    priority += risks.length;

    return Math.max(1, Math.min(10, priority));
  }

  // Utility functions
  private generateVerificationCode(length: number = 8): string {
    return crypto.randomBytes(length / 2).toString('hex').toUpperCase();
  }

  private encryptSensitiveData(data: string): string {
    // In a real app, use proper encryption
    // For now, just hash it (one-way)
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async incrementVerificationAttempt(userId: string, type: 'email' | 'phone' | 'identity' | 'address' | 'business' | 'tax_id'): Promise<void> {
    // Get current attempts count first
    const currentRequest = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.type, type),
        eq(verificationRequests.status, 'pending')
      ),
    });

    if (currentRequest) {
      await db.update(verificationRequests)
        .set({ 
          attempts: (currentRequest.attempts || 0) + 1
        })
        .where(eq(verificationRequests.id, currentRequest.id));
    }
  }

  private async logVerificationAction(
    userId: string, 
    action: string, 
    actionBy: string, 
    details?: any
  ): Promise<void> {
    await db.insert(verificationAuditLog).values({
      userId,
      action,
      actionBy,
      details: details ? JSON.stringify(details) : undefined,
      ipAddress: '0.0.0.0', // Would get from request
      userAgent: 'system'
    });
  }

  // Get verification status for user
  async getUserVerificationStatus(userId: string): Promise<{
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
    addressVerified: boolean;
    verificationLevel: number;
    pendingRequests: VerificationRequest[];
  }> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new Error('User not found');

    const pendingRequests = await db.query.verificationRequests.findMany({
      where: and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.status, 'pending')
      ),
    });

    return {
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      identityVerified: user.identityVerified || false,
      addressVerified: user.addressVerified || false,
      verificationLevel: user.verificationLevel || 0,
      pendingRequests
    };
  }
}

export const verificationService = new VerificationService();