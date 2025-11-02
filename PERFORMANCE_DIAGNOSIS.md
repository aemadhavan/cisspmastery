import { NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

/**
 * Test Cache Endpoint
 * GET /api/test-cache
 *
 * Tests cache operations directly
 */
export async function GET() {
  const results = {
    enabled: cache.isEnabled(),
    tests: [] as Array<{ operation: string; success: boolean; value?: any; error?: string }>,
  };

  try {
    // Test 1: SET
    const testKey = `test_${Date.now()}`;
    const testValue = { message: 'Hello from cache!', timestamp: Date.now() };

    const setResult = await cache.set(testKey, testValue, { ttl: 60 });
    results.tests.push({
      operation: 'SET',
      success: setResult,
      value: testValue,
    });

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test 2: GET
    const getValue = await cache.get(testKey);
    results.tests.push({
      operation: 'GET',
      success: getValue !== null,
      value: getValue,
    });

    // Test 3: Verify match
    const valuesMatch = JSON.stringify(getValue) === JSON.stringify(testValue);
    results.tests.push({
      operation: 'VERIFY MATCH',
      success: valuesMatch,
      value: { expected: testValue, received: getValue },
    });

    // Test 4: DELETE
    const delResult = await cache.del(testKey);
    results.tests.push({
      operation: 'DELETE',
      success: delResult,
    });

    // Test 5: GET after delete (should be null)
    const getAfterDel = await cache.get(testKey);
    results.tests.push({
      operation: 'GET AFTER DELETE',
      success: getAfterDel === null,
      value: getAfterDel,
    });

    return NextResponse.json({
      overall: 'Tests completed',
      ...results,
    });
  } catch (error) {
    return NextResponse.json({
      overall: 'Tests failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...results,
    }, { status: 500 });
  }
}
