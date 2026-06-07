'use server';

import { AuthService } from '@/services/auth-service';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const account = formData.get('account') as string;
  const password = formData.get('password') as string;

  if (!account || !password) {
    return { error: '請輸入帳號與密碼' };
  }

  try {
    await AuthService.login(account, password);
  } catch (error: any) {
    return { error: error.message || '登入失敗' };
  }

  redirect('/');
}

export async function logoutAction() {
  await AuthService.destroySession();
  redirect('/login');
}
