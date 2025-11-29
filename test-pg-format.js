const format = require('pg-format');

const enumName = 'test_status';
const sql = format('DROP TYPE IF EXISTS public.%I CASCADE;', enumName);

console.log('Generated SQL:', sql);

// pg-format might not quote safe identifiers
if (sql === 'DROP TYPE IF EXISTS public.test_status CASCADE;' || sql === 'DROP TYPE IF EXISTS public."test_status" CASCADE;') {
    console.log('✓ Verification passed: SQL is correctly formatted for safe identifier.');
} else {
    console.error('✗ Verification failed: SQL is incorrect for safe identifier.');
    console.log('Got:', sql);
    process.exit(1);
}

const maliciousEnumName = 'test_status"; DROP TABLE users; --';
const safeSql = format('DROP TYPE IF EXISTS public.%I CASCADE;', maliciousEnumName);
console.log('Generated Safe SQL:', safeSql);

// For malicious input, it MUST be quoted and escaped
// Expected: "test_status""; DROP TABLE users; --"
// The double quote inside should be escaped by doubling it.
const expectedIdentifier = '"test_status""; DROP TABLE users; --"';
const expectedSql = `DROP TYPE IF EXISTS public.${expectedIdentifier} CASCADE;`;

if (safeSql === expectedSql) {
    console.log('✓ Verification passed: Malicious input is correctly escaped.');
} else {
    console.error('✗ Verification failed: Malicious input is not correctly escaped.');
    console.log('Expected:', expectedSql);
    console.log('Got:     ', safeSql);
    process.exit(1);
}
