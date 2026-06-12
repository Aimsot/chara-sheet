'use client';
import { memo, useMemo, useState } from 'react';

import { DiamondPlus, ChevronLeft, ChevronRight, ArrowBigLeftDash, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
} from '@/constants/preciousdays';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { CharacterSummary } from '@/types/preciousdays/character';

import { CharacterRow } from '../CharacterRow';
import { ActionButton } from '../ui/ActionButton';
import Loading from '../ui/Loading';

const PAGE_SIZE = 10;

export const BackToSystemSelect = memo(() => {
  const router = useRouter();
  return (
    <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`}>
      <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
        <ActionButton
          className={layoutStyles.mt2}
          icon={<ArrowBigLeftDash size={16} />}
          label='システム選択に戻る'
          onClick={() => router.push('/')}
          style={{ width: '100%', marginBottom: '30px' }}
          variant='outline'
        />
      </div>
    </div>
  );
});
BackToSystemSelect.displayName = 'BackToSystemSelect';

export default function CharacterListClient({
  allCharacters,
}: {
  allCharacters: CharacterSummary[];
}) {
  const router = useRouter();
  const characters = useMemo(
    () => (Array.isArray(allCharacters) ? allCharacters : []),
    [allCharacters]
  );

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => {
      const speciesName = SPECIES_DATA[c.species as SpeciesKey]?.name || c.species || '';
      const styleName = STYLE_DATA[c.style as StyleKey]?.name || c.style || '';
      const elementName = ELEMENT_DATA[c.element as ElementKey]?.name || c.element || '';
      const typeName = c.characterType === 'master' ? '師匠' : '弟子';
      return [c.characterName, c.playerName, speciesName, styleName, elementName, typeName].some(
        (v) => v?.toLowerCase().includes(q)
      );
    });
  }, [characters, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className={layoutStyles.container}>
      <BackToSystemSelect />
      {!characters ? (
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

          {/* 検索欄 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '420px',
              margin: '0 auto 16px',
              padding: '6px 12px',
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
            }}
          >
            <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='名前・PL名・種族・スタイル・属性で検索'
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
              type='search'
              value={query}
            />
            {query && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                {filtered.length}件
              </span>
            )}
          </div>

          {/* <DebugUploader /> // デバッグ用 */}
          <main id='CharacterList' style={{ marginBottom: '30px' }}>
            {pageItems.length === 0 ? (
              <div
                style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}
              >
                該当するキャラクターが見つかりませんでした
              </div>
            ) : (
              <CharacterRow characters={pageItems} />
            )}
          </main>

          {totalPages > 1 && (
            <div className={layoutStyles.flexCenter} style={{ gap: '20px', marginBottom: '30px' }}>
              <button
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ opacity: safePage <= 1 ? 0.5 : 1, cursor: 'pointer' }}
              >
                <ChevronLeft size={24} />
              </button>
              <span>
                {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ opacity: safePage >= totalPages ? 0.5 : 1, cursor: 'pointer' }}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      )}

      <BackToSystemSelect />
    </div>
  );
}
