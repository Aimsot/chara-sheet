'use client';
import { memo } from 'react';

import { DiamondPlus, ChevronLeft, ChevronRight, ArrowBigLeftDash } from 'lucide-react';
import { useRouter } from 'next/navigation';

import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { CharacterSummary } from '@/types/preciousdays/character';

import { CharacterRow } from '../CharacterRow';
import { ActionButton } from '../ui/ActionButton';
import Loading from '../ui/Loading';

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
  initialCharacters,
  currentPage,
  totalPages,
}: {
  initialCharacters: CharacterSummary[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const characters = Array.isArray(initialCharacters) ? initialCharacters : [];

  const handlePageChange = (newPage: number) => {
    router.push(`/preciousdays?page=${newPage}#CharacterList`);
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
          {/* <DebugUploader /> // デバッグ用 */}
          <main id='CharacterList' style={{ marginBottom: '30px' }}>
            <CharacterRow characters={characters} />
          </main>
          {totalPages > 1 && (
            <div className={layoutStyles.flexCenter} style={{ gap: '20px', marginBottom: '30px' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ opacity: currentPage <= 1 ? 0.5 : 1, cursor: 'pointer' }}
              >
                <ChevronLeft size={24} />
              </button>

              <span>
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{ opacity: currentPage >= totalPages ? 0.5 : 1, cursor: 'pointer' }}
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
