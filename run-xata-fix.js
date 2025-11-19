const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function runXataFix() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✓ Connected to Xata\n');

        // Read and execute the SQL script
        const sql = fs.readFileSync('xata-fix-enums.sql', 'utf8');

        console.log('Executing Xata-compatible enum fix...\n');
        await client.query(sql);
        console.log('✓ SQL script executed successfully\n');

        // Verify the result
        console.log('=== Final Enum State ===');
        const result = await client.query(`
      SELECT typname FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public' AND t.typtype = 'e'
      ORDER BY typname;
    `);

        const expected = ['mastery_status', 'payment_status', 'plan_type', 'subscription_status', 'user_role'];
        let success = true;

        result.rows.forEach(row => {
            const isExpected = expected.includes(row.typname);
            const marker = isExpected ? '✓' : '✗';
            console.log(`  ${marker} ${row.typname}`);
            if (!isExpected) success = false;
        });

        if (success && result.rows.length === expected.length) {
            console.log('\n✅ SUCCESS! All orphaned enums removed, schema is clean!');
            process.exit(0);
        } else if (success) {
            console.log('\n⚠️  Orphaned enums removed but some expected enums missing');
            process.exit(1);
        } else {
            console.log('\n❌ Orphaned enums still exist');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runXataFix();
