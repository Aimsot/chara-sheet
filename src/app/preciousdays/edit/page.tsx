// src/app/preciousdays/edit/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import EditForm from './EditForm';

async function getCharacter(key: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/load_character?key=${key}`, {
    next: { tags: ['characters', `character-${key}`] },
    cache: 'force-cache',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  let initialData = null;

  if (key) {
    const cookieStore = await cookies();
    const allowedCookie = cookieStore.get(`edit_allowed_${key}`);

    if (!allowedCookie || allowedCookie.value !== 'true') {
      redirect('/preciousdays');
    }

    initialData = await getCharacter(key);
  }

  return <EditForm characterKey={key} initialData={initialData} />;
}
