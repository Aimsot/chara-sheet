import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCharacterById } from '@/lib/preciousdays/data';

import EditForm from './EditForm';

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; clone?: string }>;
}) {
  const { key, clone } = await searchParams;
  const targetId = key || clone;

  let initialData = null;

  if (targetId) {
    initialData = await getCharacterById(targetId);

    if (!initialData) {
      redirect('/preciousdays');
    }

    if (key) {
      if (initialData.password && initialData.password !== '') {
        const cookieStore = await cookies();
        const allowedCookie = cookieStore.get(`edit_allowed_${key}`);

        if (!allowedCookie || allowedCookie.value !== 'true') {
          redirect('/preciousdays');
        }
      }
    }
  }

  return <EditForm characterKey={key} initialData={initialData} isClone={!!clone} />;
}
