import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createServer } from 'vite';

let server, RegisterPage, authApi;
before(async () => {
  server = await createServer({ configFile: 'vite.config.js', server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, entries: [] } });
  RegisterPage = (await server.ssrLoadModule('/src/home/pages/RegisterPage.jsx')).default;
  authApi = (await server.ssrLoadModule('/src/home/api/authApi.js')).authApi;
});
after(async () => { await server?.close(); });

const values = { username: 'buyer', fullName: 'Buyer', address: 'Address', phoneNumber: '0123456789',
  email: 'buyer@example.invalid', password: 'test-password', confirmPassword: 'test-password' };

async function submit(view, reset) {
  const FormDataOriginal = globalThis.FormData;
  globalThis.FormData = class { entries() { return Object.entries(values); } };
  try {
    await act(async () => view.root.findByType('form').props.onSubmit({ preventDefault() {}, currentTarget: { reset } }));
  } finally { globalThis.FormData = FormDataOriginal; }
}

test('conflict displays the server explanation and resends only after the user clicks', async () => {
  const register = authApi.register, resend = authApi.resendVerification;
  let sends = 0;
  authApi.register = async () => { throw Object.assign(new Error('Email hoặc tên đăng nhập đã được sử dụng'), { code: 'REGISTRATION_CONFLICT' }); };
  authApi.resendVerification = async payload => { assert.deepEqual(payload, { email: values.email }); sends++; return { message: 'Kiểm tra email xác nhận' }; };
  let view; act(() => { view = create(React.createElement(RegisterPage)); });
  try {
    await submit(view, () => { throw new Error('Failed registration must preserve the form'); });
    assert.ok(JSON.stringify(view.toJSON()).includes('Email hoặc tên đăng nhập đã được sử dụng'));
    assert.equal(sends, 0);
    const button = view.root.findAllByType('button').find(button => button.props.onClick && button.children.includes('Gửi lại email xác nhận'));
    assert.ok(button); await act(async () => button.props.onClick());
    assert.equal(sends, 1); assert.ok(JSON.stringify(view.toJSON()).includes('Kiểm tra email xác nhận'));
  } finally { act(() => view.unmount()); authApi.register = register; authApi.resendVerification = resend; }
});

test('a created account with failed email delivery shows the backend message and recovery action', async () => {
  const register = authApi.register;
  authApi.register = async () => ({ message: 'Tài khoản đã tạo nhưng chưa gửi được email', verificationEmailSent: false });
  let resets = 0, view; act(() => { view = create(React.createElement(RegisterPage)); });
  try {
    await submit(view, () => resets++);
    assert.equal(resets, 1);
    assert.ok(JSON.stringify(view.toJSON()).includes('Tài khoản đã tạo nhưng chưa gửi được email'));
    assert.ok(view.root.findAllByType('button').some(button => button.children.includes('Gửi lại email xác nhận')));
  } finally { act(() => view.unmount()); authApi.register = register; }
});
