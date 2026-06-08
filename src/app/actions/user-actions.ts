'use server';

import { UserService } from '@/services/user-service';
import { AuthService } from '@/services/auth-service';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await AuthService.getSession();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== 'admin') {
    throw new Error('甈?銝雲 (Unauthorized)');
  }
  return user;
}

export async function getUsersAction() {
  try {
    await checkAdmin();
    const users = await UserService.getAllUsers();
    return { data: users };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createUserAction(formData: FormData) {
  try {
    await checkAdmin();
    const data = {
      account: formData.get('account') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
      isActive: formData.get('isActive') === 'true'
    };
    await UserService.createUser(data);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    await checkAdmin();
    const data = {
      account: formData.get('account') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
      isActive: formData.get('isActive') === 'true'
    };
    await UserService.updateUser(id, data);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const currentUser = await checkAdmin();
    if (currentUser.id === id) {
      throw new Error('銝?芷?芸楛?董??');
    }
    await UserService.deleteUser(id);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

