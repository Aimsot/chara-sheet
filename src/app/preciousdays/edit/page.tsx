import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import EditForm from './EditForm';

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (key) {
    const cookieStore = await cookies();
    const allowedCookie = cookieStore.get(`edit_allowed_${key}`);

    if (!allowedCookie || allowedCookie.value !== 'true') {
      console.log(`Access Denied for key: ${key}. Redirecting...`);
      redirect('/preciousdays');
    }
  }

  return <EditForm />;
}
