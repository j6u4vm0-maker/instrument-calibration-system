import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getAllUsers() {
    // We use (prisma as any).user if types are stale, but standard is prisma.user
    const users = await (prisma as any).user.findMany({
      select: {
        id: true,
        account: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return users;
  }

  static async createUser(data: any) {
    const existing = await (prisma as any).user.findUnique({ where: { account: data.account } });
    if (existing) throw new Error('Account already exists');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    return (prisma as any).user.create({
      data: {
        account: data.account,
        name: data.name,
        role: data.role,
        isActive: data.isActive ?? true,
        passwordHash
      }
    });
  }

  static async updateUser(id: string, data: any) {
    const updateData: any = {
      name: data.name,
      role: data.role,
      isActive: data.isActive
    };

    if (data.password && data.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
    }

    if (data.account) {
      const existing = await (prisma as any).user.findUnique({ where: { account: data.account } });
      if (existing && existing.id !== id) throw new Error('Account already exists');
      updateData.account = data.account;
    }

    return (prisma as any).user.update({
      where: { id },
      data: updateData
    });
  }

  static async deleteUser(id: string) {
    return (prisma as any).user.delete({
      where: { id }
    });
  }
}
