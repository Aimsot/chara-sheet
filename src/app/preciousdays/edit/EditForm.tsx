'use client';

import { useState, Suspense, useEffect, useMemo } from 'react';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
import Loading from '@/components/ui/Loading';
import { INITIAL_CHARACTER } from '@/constants/preciousdays';
import { useCharacterActions } from '@/hooks/preciousdays/useCharacterActions';
import { Character } from '@/types/preciousdays/character';

interface EditFormProps {
  initialData: Character | null;
  characterKey?: string;
  isClone?: boolean;
}

function EditFormContent({ initialData, characterKey, isClone }: EditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!characterKey && !isClone;

  const [char, setChar] = useState<Character>(() => {
    if (initialData) {
      if (isClone)
        return {
          ...initialData,
          id: '',
          password: '',
          characterName: `${initialData.characterName} (コピー)`,
        };
      return { ...initialData, id: characterKey || initialData.id };
    }
    return { ...INITIAL_CHARACTER, id: '' };
  });

  const isDirty = useMemo(() => {
    const baseData = initialData || INITIAL_CHARACTER;
    return JSON.stringify(char) !== JSON.stringify(baseData);
  }, [char, initialData]);

  // アクションの呼び出し
  const actions = useCharacterActions(char, setChar, selectedFile, setIsSubmitting);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting || !isDirty) return;
      e.preventDefault();
    };

    const handlePopState = () => {
      if (isSubmitting || !isDirty) return;

      if (!window.confirm('編集中ですが、保存せずに移動してもよろしいですか？')) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (isDirty && !isSubmitting) {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, isSubmitting]);

  // スクロール位置の復元専用
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem('preciousDaysScrollPos');
    if (!savedScrollPos) return;

    let frameId: number;

    const performScroll = () => {
      frameId = requestAnimationFrame(() => {
        window.scrollTo({
          top: parseInt(savedScrollPos, 10),
          behavior: 'smooth',
        });
        sessionStorage.removeItem('preciousDaysScrollPos');
      });
    };

    const timer = setTimeout(performScroll, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Ctrl + S で保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter送信防止
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT') e.preventDefault();
      }

      // Ctrl+S 上書き
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
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
        isDirty={isDirty}
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

/**
 * 外部から呼ばれるエントリポイント
 * ここで Suspense を適用することでビルドエラーを確実に防ぐ
 */
export default function EditForm(props: EditFormProps) {
  return (
    <Suspense fallback={<Loading />}>
      <EditFormContent {...props} />
    </Suspense>
  );
}
