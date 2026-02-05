'use client';

import { useState, useEffect, Suspense } from 'react';

import imageCompression from 'browser-image-compression';
import { useRouter, useSearchParams } from 'next/navigation';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
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
function EditFormContent() {
  const searchParams = useSearchParams();
  const charKey = searchParams.get('key');
  const cloneKey = searchParams.get('clone');
  const router = useRouter();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [char, setChar] = useState<Character>(INITIAL_CHARACTER);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!charKey;

  // 初期データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 編集(key) または 複製(clone) のIDがあればデータを取得しにいく
      const targetId = charKey || cloneKey;

      if (targetId) {
        try {
          const res = await fetch('/api/load_characters');
          if (!res.ok) throw new Error('読み込み失敗');

          const allChars: Character[] = await res.json();
          const found = allChars.find((c) => c.id === targetId);

          if (found) {
            if (charKey) {
              // A. 通常の編集モード
              setChar(found);
            } else {
              // B. 複製モード (新規作成扱い)
              setChar({
                ...found,
                id: generateUUID(),
                password: '',
                characterName: `${found.characterName} (コピー)`,
              });
            }
            if (found.image) setPreviewUrl(found.image);
          } else {
            console.warn('データが見つかりません');
          }
        } catch (err) {
          console.error('データ取得エラー:', err);
        }
      } else {
        setChar({ ...INITIAL_CHARACTER, id: '' });
      }

      setIsLoading(false);
    };
    loadData();
  }, [charKey, cloneKey]); // cloneKeyも依存配列に追加

  // --- 能力値更新用ヘルパー ---
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

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const characterName = formData.get('characterName') as string;
    const playerName = formData.get('playerName') as string;

    if (!characterName) return alert('キャラクター名を入力してください');
    if (!playerName) return alert('プレイヤー名を入力してください');

    const inputPassword = formData.get('password') as string;
    const finalPassword = inputPassword || char.password || '';

    // --- パスワードのバリデーション (整理版) ---
    if (finalPassword) {
      if (finalPassword.length < 4) {
        return alert('パスワードを設定する場合は、4文字以上で入力してください');
      }
      if (char.password && inputPassword && inputPassword !== char.password) {
        const isConfirmed = window.confirm(
          `【パスワード変更の確認】\n\n新しいパスワード: 「 ${inputPassword} 」に変更されます。\nよろしいでしょうか？`
        );
        if (!isConfirmed) return;
      }
    } else {
      const isConfirmed = window.confirm(
        '【注意】パスワードが設定されていません。\n\nパスワード無しで保存すると、誰でも編集できるようになります。\n\n保存しますか？'
      );
      if (!isConfirmed) return;
    }
    setIsSubmitting(true);

    try {
      const finalCharData: Character = {
        ...char,
        id: char.id || generateUUID(),
        characterName: characterName,
        playerName: (formData.get('playerName') as string) || char.playerName,
        masterName: (formData.get('masterName') as string) || char.masterName,

        // プロフィール系
        species: (formData.get('species') as string) || char.species,
        style: (formData.get('style') as string) || char.style,
        element: (formData.get('element') as string) || char.element,
        experience: Number(formData.get('experience')) || char.experience || 0,

        // 外見系
        appearance: {
          ...char.appearance,
          age: (formData.get('age') as string) || char.appearance?.age,
          gender: (formData.get('gender') as string) || char.appearance?.gender,
          height: (formData.get('height') as string) || char.appearance?.height,
          weight: (formData.get('weight') as string) || char.appearance?.weight,
          eyeColor: (formData.get('eyeColor') as string) || char.appearance?.eyeColor,
          hairColor: (formData.get('hairColor') as string) || char.appearance?.hairColor,
          skinColor: (formData.get('skinColor') as string) || char.appearance?.skinColor,
        },

        // ライフパス系
        origin: (formData.get('origin') as string) || char.origin,
        secret: (formData.get('secret') as string) || char.secret,
        future: (formData.get('future') as string) || char.future,

        // その他
        password: finalPassword,
      };

      // 3. 画像処理
      if (selectedFile) {
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 380,
          useWebWorker: true,
          fileType: 'image/webp',
        };
        const compressedFile = await imageCompression(selectedFile, options);
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => resolve(reader.result as string);
        });
        finalCharData.image = base64;
      }

      // 4. ID生成
      if (!finalCharData.id) {
        finalCharData.id = generateUUID();
      }

      // 5. 保存実行
      const res = await fetch('/api/save_character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalCharData),
      });

      if (!res.ok) throw new Error('保存に失敗しました');

      alert('保存が完了しました！');
      router.push(`/preciousdays/edit?key=${finalCharData.id}`);
    } catch (error) {
      console.error('Save Error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!char.id) return;

    const isConfirmed = window.confirm('このキャラクターを完全に削除します。よろしいですか？');
    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/delete_character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: char.id }),
      });

      if (!res.ok) throw new Error('削除に失敗しました');

      alert('削除しました。');
      router.push('/preciousdays'); // 一覧に戻る
    } catch (error) {
      console.error(error);
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

export default function EditForm() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EditFormContent />
    </Suspense>
  );
}
