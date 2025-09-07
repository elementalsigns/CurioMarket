#!/usr/bin/env tsx

/**
 * Application startup script
 * Ensures database is properly synced before starting the server
 */

import { syncDatabase } from './sync-database.js';

async function startup() {
  console.log('🚀 Starting Curio Market application...');
  
  try {
    // Always sync database on startup to ensure consistency
    console.log('🔄 Syncing database...');
    await syncDatabase();
    console.log('✅ Database sync completed');
    
    console.log('🎉 Startup completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Startup failed:', error);
    throw error;
  }
}

export { startup };