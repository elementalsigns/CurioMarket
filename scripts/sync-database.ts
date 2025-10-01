#!/usr/bin/env tsx

import { db } from '../server/db.js';
import { categories, listings, sellers, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Database sync script to ensure development and production have the same data
 * This resolves the issue where category corrections made development and production diverge
 */

async function syncDatabase() {
  console.log('🔄 Starting database sync...');
  
  try {
    // Check current environment
    const isDevelopment = process.env.NODE_ENV !== 'production';
    console.log(`📍 Environment: ${isDevelopment ? 'Development' : 'Production'}`);

    // Get current categories
    const currentCategories = await db.select().from(categories);
    console.log(`📂 Found ${currentCategories.length} categories`);
    
    // Get current listings 
    const currentListings = await db.select().from(listings);
    console.log(`📦 Found ${currentListings.length} listings`);

    // Ensure all required categories exist (these were the ones causing issues)
    const requiredCategories = [
      { id: 'cat1', name: 'Wet Specimens', slug: 'wet-specimens', description: 'Preserved biological specimens in fluid' },
      { id: 'cat2', name: 'Taxidermy', slug: 'taxidermy', description: 'Preserved animal specimens' },
      { id: 'cat3', name: 'Bones & Skulls', slug: 'bones-skulls', description: 'Skeletal remains and specimens' },
      { id: 'cat4', name: 'Occult', slug: 'occult', description: 'Dark and mystical artwork' },
      { id: 'cat5', name: 'Medical Art', slug: 'medical-art', description: 'Antique medical instruments and specimens' },
      { name: 'Murderabilia', slug: 'murderabilia', description: 'Historical crime-related collectibles and artifacts' },
      { name: 'Crystals', slug: 'crystals', description: 'Natural crystals, minerals, and gemstones' },
      { name: 'Jewelry', slug: 'jewelry', description: 'Gothic and occult jewelry pieces' },
      { name: 'Wall Art', slug: 'wall-art', description: 'Dark and mystical artwork for walls' },
      { name: 'Candles', slug: 'candles', description: 'Gothic and occult candles for rituals and ambiance' },
      { name: 'Funeral', slug: 'funeral', description: 'Funeral and mortuary-related items and memorabilia' },
      { name: 'Antique', slug: 'antique', description: 'Authentic antique pieces and historical artifacts' },
      { name: 'Vintage', slug: 'vintage', description: 'Vintage items from past eras and decades' },
      { name: 'Wholesale', slug: 'wholesale', description: 'Bulk orders and wholesale quantities for resellers', icon: '📦' },
      { name: 'Divination', slug: 'divination', description: 'Divination tools, tarot cards, runes, and mystical instruments' }
    ];

    console.log('🔧 Ensuring all required categories exist...');
    
    for (const categoryData of requiredCategories) {
      const existingCategory = currentCategories.find(c => c.slug === categoryData.slug);
      
      if (!existingCategory) {
        console.log(`➕ Adding missing category: ${categoryData.name}`);
        await db.insert(categories).values({
          id: categoryData.id || undefined, // Use provided ID or let DB generate
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon || null
        }).onConflictDoNothing();
      } else {
        console.log(`✅ Category exists: ${categoryData.name}`);
      }
    }

    // Verify sync completed
    const finalCategories = await db.select().from(categories);
    console.log(`✅ Database sync completed! Total categories: ${finalCategories.length}`);
    
    // List all categories for verification
    console.log('\n📋 All categories:');
    finalCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
}

// This script is only used as an import by startup.ts, never run directly
// Removed process.exit() calls to prevent deployment issues

export { syncDatabase };