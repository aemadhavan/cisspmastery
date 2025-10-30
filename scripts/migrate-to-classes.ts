import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Starting database migration to Classes → Decks → Cards model...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration script loaded from migration.sql');
    console.log('⏳ Executing migration...\n');

    // Execute the migration
    const result = await sql.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Migration Results:');
    console.log('   - Classes table created');
    console.log('   - Class progress table created');
    console.log('   - Decks updated to reference classes');
    console.log('   - Old domains and topics tables removed');
    console.log('   - Performance indexes created\n');

    // Verify the migration
    console.log('🔍 Verifying migration...\n');

    const classesCount = await sql.query('SELECT COUNT(*) as count FROM classes');
    const decksCount = await sql.query('SELECT COUNT(*) as count FROM decks');
    const flashcardsCount = await sql.query('SELECT COUNT(*) as count FROM flashcards');

    console.log('📈 Database Status:');
    console.log(`   - Classes: ${classesCount.rows[0].count}`);
    console.log(`   - Decks: ${decksCount.rows[0].count}`);
    console.log(`   - Flashcards: ${flashcardsCount.rows[0].count}`);

    // Check if all decks have class_id
    const decksWithoutClass = await sql.query(
      'SELECT COUNT(*) as count FROM decks WHERE class_id IS NULL'
    );

    if (parseInt(decksWithoutClass.rows[0].count) > 0) {
      console.warn(`\n⚠️  Warning: ${decksWithoutClass.rows[0].count} decks without class_id`);
    } else {
      console.log('\n✅ All decks successfully linked to classes');
    }

    console.log('\n🎉 Migration complete! Your database is now using the Brainscape model.\n');

  } catch (error: any) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
    console.error('\n💡 Tip: Restore from backup if needed');
    process.exit(1);
  }
}

// Run the migration
runMigration();
