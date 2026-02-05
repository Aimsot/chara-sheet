'use client';

import { useState, Suspense, useEffect } from 'react';

import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
import Loading from '@/components/ui/Loading';
import { INITIAL_CHARACTER } from '@/constants/dummy';
import {
  ABILITY_KEYS,
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
} from '@/constants/preciousdays';
import { Character } from '@/types/preciousdays/character';
import { generateUUID } from '@/utils/uuid';

import { saveCharacterAction } from '../actions';

interface EditFormProps {
  initialData: Character | null;
  characterKey?: string;
  isClone?: boolean;
}

function EditFormContent({ initialData, characterKey, isClone }: EditFormProps) {
  const router = useRouter();

  // --- 1. 初期化：URLのkeyを最優先してIDの汚染を防ぐ ---
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
      // ファイル内データが UUID になっていても URL の key で上書きして修正する
      return { ...initialData, id: characterKey || initialData.id };
    }
    return { ...INITIAL_CHARACTER, id: '' };
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!characterKey && !isClone;

  // --- 2. Ctrl+S ショートカット ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 能力値計算ロジック (変更なし) ---
  const updateAbilities = (updates: Partial<Character>) => {
    const nextChar = { ...char, ...updates };
    if (!nextChar.species || !nextChar.style || !nextChar.element) {
      setChar(nextChar);
      return;
    }
    const baseMap = SPECIES_DATA[nextChar.species as SpeciesKey].abilities;
    const styleBonusMap = STYLE_DATA[nextChar.style as StyleKey].bonuses;
    const elementBonusMap = ELEMENT_DATA[nextChar.element as ElementKey].bonuses;

    const newAbilities = { ...nextChar.abilities };
    ABILITY_KEYS.forEach((key) => {
      const base = baseMap[key];
      const bonus = nextChar.abilities[key].bonus;
      const other = nextChar.abilities[key].otherModifier || 0;
      newAbilities[key] = {
        bonus,
        otherModifier: other,
        total:
          Math.floor((base + bonus) / 3) +
          ((styleBonusMap as any)[key] || 0) +
          ((elementBonusMap as any)[key] || 0) +
          other,
      };
    });
    setChar({ ...nextChar, abilities: newAbilities });
  };

  // --- 3. 保存処理：保存後に閲覧ページへ遷移させる ---
  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const playerName = formData.get('playerName') as string;

    // プレイヤー名のみ必須
    if (!playerName) return alert('プレイヤー名を入力してください');

    const inputPassword = formData.get('password') as string;
    const finalPassword = inputPassword || char.password || '';

    setIsSubmitting(true);

    try {
      // 保存直前に ID を確定させる（既存があれば維持、なければ新規発行）
      const finalId = char.id || generateUUID();

      const finalCharData: Character = {
        ...char,
        id: finalId,
        characterName: (formData.get('characterName') as string) || '（名称未設定）',
        playerName: playerName,
        password: finalPassword,
        // FormDataから各項目を同期（以下、既存の appearance 等の構築ロジックを継続）
        appearance: {
          ...char.appearance,
          age: (formData.get('age') as string) || char.appearance?.age,
          gender: (formData.get('gender') as string) || char.appearance?.gender,
        },
      };

      // 画像処理
      if (selectedFile) {
        const compressedFile = await imageCompression(selectedFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 380,
          fileType: 'image/webp',
        });
        finalCharData.image = await new Promise((res) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => res(reader.result as string);
        });
      }

      // API実行
      const result = await saveCharacterAction(finalCharData);

      if (!result.success) throw new Error('保存に失敗しました');

      alert('保存が完了しました！');

      router.push(`/preciousdays/view/${result.id}`);
    } catch (error) {
      console.error('Save Error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!char.id || !window.confirm('このキャラクターを完全に削除しますか？')) return;
    try {
      const res = await fetch('/api/delete_character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: char.id }),
      });
      if (res.ok) router.push('/preciousdays');
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <div className='theme-silver'>
      <CharacterSheetTemplate
        char={char}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        isLoading={false}
        isSubmitting={isSubmitting}
        mode={isEditMode ? 'edit' : 'create'}
        previewUrl={previewUrl}
        setChar={setChar}
        setPreviewUrl={setPreviewUrl}
        setSelectedFile={setSelectedFile}
        updateAbilities={updateAbilities}
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
