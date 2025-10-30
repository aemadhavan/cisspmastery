import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function patchDecksTable() {
  console.log('🔧 Patching decks table with is_published column...\n');

  try {
    // Add is_published column to decks if it doesn't exist
    await db.execute(sql`
      ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
    `);

    console.log('✅ Patch migration completed successfully!');
    console.log('🎉 The decks table now has the is_published column\n');

    // Verify the column was added
    const result = await db.execute(sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'decks' AND column_name = 'is_published';
    `);

    console.log('Verification:', result);

  } catch (error) {
    console.error('\n❌ Error during patch migration:', error);
    process.exit(1);
  }

  process.exit(0);
}

patchDecksTable();
