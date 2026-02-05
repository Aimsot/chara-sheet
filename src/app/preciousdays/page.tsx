'use client';

import { Suspense, useEffect, useState } from 'react';

import { DiamondPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CharacterRow } from '@/components/CharacterRow';
import { ActionButton } from '@/components/ui/ActionButton';
import Loading from '@/components/ui/Loading';
import listLayout from '@/styles/components/charaList/layout.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import titleStyles from '@/styles/components/titles.module.scss';

function CharacterList() {
  const router = useRouter();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phase 1で作った全件取得API
    fetch('/api/load_characters')
      .then((res) => res.json())
      .then((data) => {
        // もしエラーが返ってきたら空配列にする
        setCharacters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={layoutStyles.container}>
      <header className={titleStyles.decoratedHeader}>
        <h1>
          <span className={titleStyles.mainTitle}>プレシャスデイズ</span>
          <span className={titleStyles.subTitle}>キャラクター一覧</span>
        </h1>
      </header>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className={layoutStyles.flexCenter} style={{ marginBottom: '30px' }}>
            <ActionButton
              icon={<DiamondPlus size={16} />}
              label='新規キャラクター作成'
              onClick={() => router.push('/preciousdays/edit')}
              variant='magic'
            />
          </div>
          {/* <DebugUploader /> // 逆順でサンプルキャラをアップロードするコンポーネント */}
          <div className={listLayout.container}>
            <main>
              <CharacterRow characters={characters} />
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default function PreciousDaysPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharacterList />
    </Suspense>
  );
}
