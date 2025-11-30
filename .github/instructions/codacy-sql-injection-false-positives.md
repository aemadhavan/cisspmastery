# Codacy SQL Injection False Positives

## Pattern Information
- **Pattern**: Avoid SQL Injection by Preventing Untrusted Input Concatenation in Raw SQL Queries
- **Source**: Semgrep
- **Severity**: Critical
- **Category**: Security

## Why This is Flagged
Semgrep detects when variables are concatenated or used in SQL queries without parameterization, which could lead to SQL injection vulnerabilities if the variables contain untrusted user input.

## False Positive Cases

### Migration Scripts (`apply-migration.js`)

**Lines 47 and 63** are flagged as SQL injection risks, but this is a **false positive** because:

1. **Trusted Source**: The SQL content comes from Drizzle ORM-generated migration files, not user input
2. **Path Validation**: The migration file path is hardcoded and validated (lines 19-29)
3. **No User Input**: The `migrationSQL` variable contains SQL from a trusted file in the migrations directory
4. **Design Intent**: Migration scripts must execute raw SQL statements to modify database schema

### Why Parameterized Queries Don't Apply

Parameterized queries are the correct solution for **dynamic data** (e.g., user-provided values in WHERE clauses). However, they **cannot** be used for:

- DDL statements (CREATE TABLE, ALTER TABLE, DROP TYPE, etc.)
- Schema migrations
- Dynamic SQL structure (table names, column names, etc.)

Migration scripts inherently require executing raw SQL for schema changes.

## Resolution Options

### Option 1: Disable Pattern in Codacy UI (Recommended)

Since this is a migration script with validated, trusted SQL:

1. Go to Codacy → Code Patterns
2. Find "Avoid SQL Injection by Preventing Untrusted Input Concatenation in Raw SQL Queries"
3. Click "Disable pattern" for this specific file or globally

### Option 2: Add to `.codacy.yml` Exclusions

```yaml
exclude_paths:
  - 'apply-migration.js'
  - 'scripts/fix-migrations.js'
  - 'scripts/deep-cleanup.js'
  - 'scripts/investigate-enums.js'
```

### Option 3: Inline Suppression Comments

The existing `nosemgrep` comments (lines 46, 61) should work, but Semgrep may require the exact rule ID. Try these formats:

```javascript
// nosemgrep: javascript.lang.security.audit.sqli.node-sqli.node-sqli
const statements = migrationSQL.split('--statement-breakpoint')
```

Or use Codacy's format:

```javascript
// codacy-disable-next-line
const statements = migrationSQL.split('--statement-breakpoint')
```

## Security Justification

This code is **secure** because:

1. ✅ **No user input**: SQL comes from version-controlled migration files
2. ✅ **Path validation**: File path is validated to be within migrations directory
3. ✅ **Hardcoded filename**: Migration file name is hardcoded, not dynamic
4. ✅ **Trusted source**: Drizzle ORM generates these files
5. ✅ **Necessary for functionality**: Schema migrations require DDL execution

## Recommendation

**Mark as false positive** and disable this pattern for migration scripts. The security controls in place (path validation, hardcoded filenames, trusted source) adequately protect against SQL injection in this context.

## Related Files

- `apply-migration.js` (lines 47, 63)
- `scripts/fix-migrations.js`
- `scripts/deep-cleanup.js`
- `scripts/investigate-enums.js`
