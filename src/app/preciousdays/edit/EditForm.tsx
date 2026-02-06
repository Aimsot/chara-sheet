'use client';

import { useState, Suspense, useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
import Loading from '@/components/ui/Loading';
import { INITIAL_CHARACTER } from '@/constants/dummy';
import { useCharacterActions } from '@/hooks/preciousdays/useCharacterActions';
import { Character } from '@/types/preciousdays/character';

interface EditFormProps {
  initialData: Character | null;
  characterKey?: string;
  isClone?: boolean;
}

function EditFormContent({ initialData, characterKey, isClone }: EditFormProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!characterKey && !isClone;

  const [char, setChar] = useState<Character>(() => {
    if (initialData) {
      if (isClone) {
        return {
          ...initialData,
          id: '',
          password: '',
          characterName: `${initialData.characterName} (コピー)`,
        };
      }
      return { ...initialData, id: characterKey || initialData.id };
    }
    return { ...INITIAL_CHARACTER, id: '' };
  });
  const isDirty = useMemo(() => {
    const baseData = initialData || INITIAL_CHARACTER;
    return JSON.stringify(char) !== JSON.stringify(baseData);
  }, [char, initialData]);

  const actions = useCharacterActions(char, setChar, selectedFile, setIsSubmitting, router);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Ctrl+S ショートカット & Enter送信防止
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT') {
          e.preventDefault();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // type="submit" ボタンを探してクリックを発火させる
        const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) submitBtn.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className='theme-silver'>
      <CharacterSheetTemplate
        char={char}
        isLoading={false}
        isSubmitting={isSubmitting}
        mode={isEditMode ? 'edit' : 'create'}
        previewUrl={previewUrl}
        setChar={setChar}
        setPreviewUrl={setPreviewUrl}
        setSelectedFile={setSelectedFile}
        {...actions}
      />
    </div>
  );
}

export default function EditForm(props: EditFormProps) {
  return (
    <Suspense fallback={<Loading />}>
      <EditFormContent {...props} />
    </Suspense>
  );
}
