'use client';
import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
import { Character } from '@/types/preciousdays/character';

export default function CharacterViewPage() {
  const params = useParams();
  // params.id は配列の可能性もあるので、安全に文字列にする
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // ★変更点1: フックを使わず、ここで state を定義します
  const [char, setChar] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 閲覧モードなので何もしない関数
  const noOp = () => {};

  useEffect(() => {
    if (!id) return;

    fetch(`/api/load_character/${id}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          console.error(data.error);
          alert('キャラクターが見つかりませんでした');
        } else {
          const charData = data as Character;
          setChar(charData);
          // 画像があればセット
          if (charData.image) {
            setPreviewUrl(charData.image);
          }
        }
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => {
        // ★変更点2: 成功しても失敗してもローディング終了
        setIsLoading(false);
      });
  }, [id]);

  return (
    <CharacterSheetTemplate
      char={char}
      isLoading={isLoading}
      mode='view'
      previewUrl={previewUrl}
      setChar={noOp}
      setPreviewUrl={noOp}
      setSelectedFile={noOp}
      updateAbilities={noOp}
    />
  );
}
