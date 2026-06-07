import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
const key = new TextEncoder().encode(SECRET_KEY);

export class AuthService {
  static async signToken(payload: any) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key);
  }

  static async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, key);
      return payload;
    } catch (err) {
      return null;
    }
  }

  static async getSession() {
    const token = (await cookies()).get('session')?.value;
    if (!token) return null;
    return await this.verifyToken(token);
  }

  static async login(account: string, password: string) {
    // We use (prisma as any).user because the Prisma Client might not be perfectly generated yet due to dev server locks
    const user = await (prisma as any).user.findUnique({
      where: { account }
    });

    if (!user || !user.isActive) {
      throw new Error('登入失敗：帳號不存在或已停用');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('登入失敗：密碼錯誤');
    }

    const userData = {
      id: user.id,
      account: user.account,
      role: user.role === 'ADMIN' ? 'admin' : user.role === 'QA_MANAGER' ? 'qa_manager' : 'engineer',
      name: user.name
    };

    await this.createSession(userData);
    return userData;
  }

  static async createSession(user: { id: string, account: string, role: string, name: string }) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = await this.signToken({ user, expires });

    (await cookies()).set('session', token, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    // Temporarily sync role cookie for frontend backwards compatibility
    (await cookies()).set('role', user.role, {
      expires,
      path: '/'
    });
  }

  static async destroySession() {
    (await cookies()).delete('session');
    (await cookies()).delete('role');
  }
}
