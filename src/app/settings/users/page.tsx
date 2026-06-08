import { getUsersAction } from '@/app/actions/user-actions';
import { UserManagementClient } from './UserManagementClient';
import { AuthService } from '@/services/auth-service';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await AuthService.getSession();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== 'admin') {
    redirect('/'); // Only admins can access
  }

  const result = await getUsersAction();
  const users = result.data || [];

  return <UserManagementClient initialUsers={users} currentUser={user} />;
}
