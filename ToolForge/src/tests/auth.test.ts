import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('ToolForge Auth & Role Security Protocol', () => {
  const SECRET = 'toolforge_dev_jwt_secret_titan_2026';

  it('hashes passwords with bcrypt salt properly', () => {
    const rawPass = 'SuperPassword2026!';
    const hash = bcrypt.hashSync(rawPass, 10);

    expect(hash).not.toBe(rawPass);
    expect(bcrypt.compareSync(rawPass, hash)).toBe(true);
    expect(bcrypt.compareSync('WrongPassword', hash)).toBe(false);
  });

  it('signs and verifies JWT tokens with correct user role payload', () => {
    const payload = {
      id: 'usr_test_001',
      email: 'tester@toolforge.test',
      role: 'customer',
      name: 'Example Tester'
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, SECRET) as typeof payload;
    expect(decoded.id).toBe('usr_test_001');
    expect(decoded.role).toBe('customer');
    expect(decoded.name).toBe('Example Tester');
  });

  it('rejects tampered or forged JWT tokens', () => {
    const payload = { id: 'usr_fake', role: 'admin' };
    const fakeToken = jwt.sign(payload, 'wrong_secret_key');

    expect(() => {
      jwt.verify(fakeToken, SECRET);
    }).toThrow();
  });
});
