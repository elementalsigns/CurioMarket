import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, ShieldCheck, Activity, Bell, Database, Mail, Eye, CheckCircle, XCircle, Clock, Loader2, Save } from "lucide-react";
import { format } from "date-fns";

interface VerificationRequest {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  data: any;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
  admin?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface PlatformSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedRoles: string[];
  };
  features: {
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
    enableReviews: boolean;
    enableMessages: boolean;
    autoApproveListings: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
  };
  email: {
    fromAddress: string;
    fromName: string;
    enableNotifications: boolean;
    enableOrderEmails: boolean;
    enableMarketingEmails: boolean;
  };
}

interface VerificationResponse {
  requests: VerificationRequest[];
  total: number;
  page: number;
  totalPages: number;
}

interface AuditResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const verificationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
};

const verificationTypeColors = {
  email: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  phone: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  identity: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
  business: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
};

export function SystemManagement() {
  const [verificationPage, setVerificationPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const { toast } = useToast();

  // Fetch verification requests
  const { data: verificationData, isLoading: verificationLoading } = useQuery<VerificationResponse>({
    queryKey: ['/api/admin/verification-queue', { page: verificationPage, limit: 10 }],
    staleTime: 30000,
  });

  // Fetch audit logs
  const { data: auditData, isLoading: auditLoading } = useQuery<AuditResponse>({
    queryKey: ['/api/admin/activity', { page: auditPage, limit: 20 }],
    staleTime: 30000,
  });

  // Fetch platform settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery<PlatformSettings>({
    queryKey: ['/api/admin/settings'],
    staleTime: 300000, // 5 minutes
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: PlatformSettings) => {
      const response = await apiRequest('PUT', '/api/admin/settings', settings);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Updated",
        description: "Platform settings have been successfully updated.",
      });
      setSettingsChanged(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Process verification mutation
  const processVerificationMutation = useMutation({
    mutationFn: async ({ requestId, action, notes }: { requestId: string; action: 'approve' | 'reject'; notes?: string }) => {
      const response = await apiRequest('POST', `/api/admin/verification/${requestId}/${action}`, { notes });
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-queue'] });
      toast({
        title: "Verification Processed",
        description: `Verification request has been ${variables.action}d.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Process Failed",
        description: error.message || "Failed to process verification",
        variant: "destructive",
      });
    },
  });

  const handleSettingsUpdate = () => {
    if (settingsData) {
      updateSettingsMutation.mutate(settingsData);
    }
  };

  const handleVerificationAction = (requestId: string, action: 'approve' | 'reject') => {
    processVerificationMutation.mutate({ requestId, action });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verification" data-testid="tab-verification">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Verification Queue
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Platform Settings
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Verification Queue
              </CardTitle>
              <CardDescription>
                Review and process user verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading verification requests...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationData?.requests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-verification-${request.id}`}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{getUserDisplayName(request.user)}</p>
                              <p className="text-xs text-muted-foreground">{request.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={verificationTypeColors[request.type as keyof typeof verificationTypeColors] || verificationTypeColors.email}>
                              {request.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={verificationStatusColors[request.status]}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.submittedAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerificationAction(request.id, 'approve')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerificationAction(request.id, 'reject')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                  data-testid={`button-reject-${request.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No verification requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {verificationData && verificationData.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {verificationData.page} of {verificationData.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVerificationPage(verificationPage - 1)}
                          disabled={verificationPage <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVerificationPage(verificationPage + 1)}
                          disabled={verificationPage >= verificationData.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading platform settings...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {settingsChanged && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        You have unsaved changes to platform settings.
                      </p>
                      <Button
                        size="sm"
                        onClick={handleSettingsUpdate}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-save-settings"
                      >
                        {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                  <CardDescription>Control platform availability and maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-enabled">Enable Maintenance Mode</Label>
                    <Switch
                      id="maintenance-enabled"
                      checked={settingsData?.maintenance.enabled || false}
                      onCheckedChange={(checked) => {
                        if (settingsData) {
                          settingsData.maintenance.enabled = checked;
                          setSettingsChanged(true);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance-message"
                      placeholder="Message to display during maintenance..."
                      value={settingsData?.maintenance.message || ''}
                      onChange={(e) => {
                        if (settingsData) {
                          settingsData.maintenance.message = e.target.value;
                          setSettingsChanged(true);
                        }
                      }}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                  <CardDescription>Enable or disable platform features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-registrations">Allow New Registrations</Label>
                      <Switch
                        id="allow-registrations"
                        checked={settingsData?.features.allowRegistrations || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.features.allowRegistrations = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-email-verification">Require Email Verification</Label>
                      <Switch
                        id="require-email-verification"
                        checked={settingsData?.features.requireEmailVerification || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.features.requireEmailVerification = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-reviews">Enable Reviews</Label>
                      <Switch
                        id="enable-reviews"
                        checked={settingsData?.features.enableReviews || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.features.enableReviews = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-messages">Enable Messages</Label>
                      <Switch
                        id="enable-messages"
                        checked={settingsData?.features.enableMessages || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.features.enableMessages = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-approve-listings">Auto-Approve Listings</Label>
                      <Switch
                        id="auto-approve-listings"
                        checked={settingsData?.features.autoApproveListings || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.features.autoApproveListings = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure platform security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        min="5"
                        max="480"
                        value={settingsData?.security.sessionTimeout || 60}
                        onChange={(e) => {
                          if (settingsData) {
                            settingsData.security.sessionTimeout = parseInt(e.target.value) || 60;
                            setSettingsChanged(true);
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input
                        id="max-login-attempts"
                        type="number"
                        min="3"
                        max="10"
                        value={settingsData?.security.maxLoginAttempts || 5}
                        onChange={(e) => {
                          if (settingsData) {
                            settingsData.security.maxLoginAttempts = parseInt(e.target.value) || 5;
                            setSettingsChanged(true);
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password-min-length">Minimum Password Length</Label>
                      <Input
                        id="password-min-length"
                        type="number"
                        min="6"
                        max="32"
                        value={settingsData?.security.passwordMinLength || 8}
                        onChange={(e) => {
                          if (settingsData) {
                            settingsData.security.passwordMinLength = parseInt(e.target.value) || 8;
                            setSettingsChanged(true);
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-6">
                      <Label htmlFor="require-2fa">Require Two-Factor Auth</Label>
                      <Switch
                        id="require-2fa"
                        checked={settingsData?.security.requireTwoFactor || false}
                        onCheckedChange={(checked) => {
                          if (settingsData) {
                            settingsData.security.requireTwoFactor = checked;
                            setSettingsChanged(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure email notifications and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-address">From Email Address</Label>
                      <Input
                        id="from-address"
                        type="email"
                        value={settingsData?.email.fromAddress || ''}
                        onChange={(e) => {
                          if (settingsData) {
                            settingsData.email.fromAddress = e.target.value;
                            setSettingsChanged(true);
                          }
                        }}
                        className="mt-2"
                        placeholder="noreply@curiosities.market"
                      />
                    </div>
                    <div>
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={settingsData?.email.fromName || ''}
                        onChange={(e) => {
                          if (settingsData) {
                            settingsData.email.fromName = e.target.value;
                            setSettingsChanged(true);
                          }
                        }}
                        className="mt-2"
                        placeholder="Curio Market"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Email Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-notifications">General Notifications</Label>
                        <Switch
                          id="enable-notifications"
                          checked={settingsData?.email.enableNotifications || false}
                          onCheckedChange={(checked) => {
                            if (settingsData) {
                              settingsData.email.enableNotifications = checked;
                              setSettingsChanged(true);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-order-emails">Order Confirmation Emails</Label>
                        <Switch
                          id="enable-order-emails"
                          checked={settingsData?.email.enableOrderEmails || false}
                          onCheckedChange={(checked) => {
                            if (settingsData) {
                              settingsData.email.enableOrderEmails = checked;
                              setSettingsChanged(true);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-marketing-emails">Marketing Emails</Label>
                        <Switch
                          id="enable-marketing-emails"
                          checked={settingsData?.email.enableMarketingEmails || false}
                          onCheckedChange={(checked) => {
                            if (settingsData) {
                              settingsData.email.enableMarketingEmails = checked;
                              setSettingsChanged(true);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Admin Activity Logs
              </CardTitle>
              <CardDescription>
                Track all administrative actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading activity logs...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditData?.logs.map((log) => (
                        <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {getUserDisplayName(log.admin)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{log.targetType}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.targetId.slice(-8)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {log.details}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{formatDate(log.timestamp)}</span>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No activity logs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {auditData && auditData.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {auditData.page} of {auditData.totalPages} ({auditData.total} total logs)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAuditPage(auditPage - 1)}
                          disabled={auditPage <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAuditPage(auditPage + 1)}
                          disabled={auditPage >= auditData.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}