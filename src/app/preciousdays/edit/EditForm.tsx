'use client';

import { useState, Suspense } from 'react';

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

// Props の型定義
interface EditFormProps {
  initialData: Character | null;
  characterKey?: string;
  isClone?: boolean;
}

function EditFormContent({ initialData, characterKey, isClone }: EditFormProps) {
  const router = useRouter();

  // --- State の初期化 ---
  // サーバーから届いたデータを初期値にする。データがなければ新規作成用（INITIAL_CHARACTER）を使う。
  const [char, setChar] = useState<Character>(() => {
    if (initialData) {
      if (isClone) {
        // 複製モードの場合はIDを新しくし、名前に (コピー) を付与
        return {
          ...initialData,
          id: generateUUID(),
          password: '',
          characterName: `${initialData.characterName} (コピー)`,
        };
      }
      return initialData;
    }
    return { ...INITIAL_CHARACTER, id: generateUUID() };
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!characterKey && !isClone;

  // サーバー側で取得済みのため、isLoading は不要（または false 固定）
  const isLoading = false;

  // --- 能力値更新ヘルパー (変更なし) ---
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
      const styleBonus = (styleBonusMap as any)[key] || 0;
      const elementBonus = (elementBonusMap as any)[key] || 0;

      const basicTotal = base + bonus;
      newAbilities[key] = {
        bonus,
        otherModifier: other,
        total: Math.floor(basicTotal / 3) + styleBonus + elementBonus + other,
      };
    });
    setChar({ ...nextChar, abilities: newAbilities });
  };

  // --- 保存処理 (handleSubmit) ---
  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // ... (画像圧縮やバリデーション等の既存ロジック ... 省略)

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/save_character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(char), // ステートをそのまま送る
      });

      if (!res.ok) throw new Error('保存に失敗しました');

      alert('保存が完了しました！');
      // 保存後は編集画面へ遷移（ここで Server Component が再 fetch し、キャッシュが更新される）
      router.push(`/preciousdays/edit?key=${char.id}`);
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 削除処理 (handleDelete) ---
  const handleDelete = async () => {
    if (!char.id) return;
    if (!window.confirm('削除しますか？')) return;

    try {
      const res = await fetch('/api/delete_character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: char.id }),
      });
      if (!res.ok) throw new Error('削除失敗');
      router.push('/preciousdays');
    } catch (error) {
      alert('エラーが発生しました');
    }
  };

  return (
    <div className='theme-silver'>
      <CharacterSheetTemplate
        char={char}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
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

// 親コンポーネント
export default function EditForm({
  initialData,
  characterKey,
  isClone,
}: {
  initialData: Character | null;
  characterKey?: string;
  isClone?: boolean;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <EditFormContent characterKey={characterKey} initialData={initialData} isClone={isClone} />
    </Suspense>
  );
}
