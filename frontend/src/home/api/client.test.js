import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from './client.js';

test('API errors retain their conflict code, status and validation details', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return new Response(JSON.stringify({ message: 'Registration conflict', code: 'REGISTRATION_CONFLICT', errors: ['email: invalid'] }), { status: 409 });
  };
  try {
    await assert.rejects(apiRequest('/auth/register', { authenticated: false }), error => {
      assert.equal(error.message, 'Registration conflict'); assert.equal(error.code, 'REGISTRATION_CONFLICT');
      assert.equal(error.status, 409); assert.deepEqual(error.details, ['email: invalid']); return true;
    });
  } finally { globalThis.fetch = original; }
});

test('network errors show an understandable connection message', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  try {
    await assert.rejects(apiRequest('/auth/register', { authenticated: false }), /Không thể kết nối máy chủ/);
  } finally { globalThis.fetch = original; }
});
