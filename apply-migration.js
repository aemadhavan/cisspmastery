const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✓ Connected to Xata\n');

        // Read the migration file
        const migrationSQL = fs.readFileSync('drizzle/migrations/0000_secret_nightcrawler.sql', 'utf8');

        console.log('Applying migration 0000_secret_nightcrawler.sql...\n');

        // Split by statement breakpoint and execute each statement
        const statements = migrationSQL
            .split('-->statement-breakpoint')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip comments
            if (statement.startsWith('--') || statement.startsWith('/*')) {
                continue;
            }

            try {
                await client.query(statement);
                successCount++;

                // Log progress for major operations
                if (statement.includes('CREATE TYPE')) {
                    const match = statement.match(/CREATE TYPE "public"\."(\w+)"/);
                    if (match) console.log(`  ✓ Created enum: ${match[1]}`);
                } else if (statement.includes('CREATE TABLE')) {
                    const match = statement.match(/CREATE TABLE "(\w+)"/);
                    if (match) console.log(`  ✓ Created table: ${match[1]}`);
                } else if (statement.includes('CREATE INDEX')) {
                    const match = statement.match(/CREATE INDEX "(\w+)"/);
                    if (match) console.log(`  ✓ Created index: ${match[1]}`);
                }
            } catch (error) {
                // Check if it's a "already exists" error (42P07 for tables, 42710 for types, etc.)
                if (error.code === '42P07' || error.code === '42710' || error.code === '42P16') {
                    skipCount++;
                    // Silently skip - object already exists
                } else {
                    errorCount++;
                    console.log(`  ✗ Error in statement ${i + 1}:`, error.message);
                }
            }
        }

        console.log(`\n=== Migration Summary ===`);
        console.log(`  ✓ Executed: ${successCount}`);
        console.log(`  ⊘ Skipped (already exists): ${skipCount}`);
        console.log(`  ✗ Errors: ${errorCount}`);

        if (errorCount === 0) {
            console.log('\n✅ Migration applied successfully!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Migration completed with some errors');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
