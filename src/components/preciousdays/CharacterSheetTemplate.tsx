import React from 'react';

import { ArrowBigLeftDash } from 'lucide-react';

import AbilitySection from '@/components/preciousdays/AbilitySection';
import { AppearanceSection } from '@/components/preciousdays/AppearanceSection';
import CombatSection from '@/components/preciousdays/CombatSection';
import EquipmentSection from '@/components/preciousdays/EquipmentSection';
import { ItemSection } from '@/components/preciousdays/ItemSection';
import LifepathSection from '@/components/preciousdays/LifepathSection';
import { ProfileSection } from '@/components/preciousdays/ProfileSection';
import { SidebarSection } from '@/components/preciousdays/SidebarSection';
import { SkillSection } from '@/components/preciousdays/SkillSection';
import Loading from '@/components/ui/Loading';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import titleStyles from '@/styles/components/titles.module.scss';
import { Character } from '@/types/preciousdays/character';

import { ActionButton } from '../ui/ActionButton';

import ResourceSection from './ResourceSection';

interface TemplateProps {
  char: any;
  isLoading?: boolean;
  mode: 'create' | 'edit' | 'view';
  previewUrl: string | null;
  setPreviewUrl?: (url: string | null) => void;
  setSelectedFile?: (file: File | null) => void;
  setChar: (char: any) => void;
  updateAbilities: (updates: Partial<Character>) => void;
  handleSubmit?: (e: React.BaseSyntheticEvent) => void;
  handleDelete?: () => Promise<void>;
  isSubmitting?: boolean;
}

const CharacterSheetTemplate: React.FC<TemplateProps> = ({
  char,
  isLoading = false,
  mode,
  previewUrl,
  setPreviewUrl = () => {},
  setSelectedFile = () => {},
  setChar,
  updateAbilities,
  handleSubmit,
  handleDelete,
  isSubmitting = false,
}) => {
  const isReadOnly = mode === 'view';
  const charKey = char?.key || char?.id; // 新規作成判定用など

  // タイトルの決定
  const getTitle = () => {
    if (mode === 'view') return '閲覧画面';
    return charKey ? 'キャラクター編集画面' : 'キャラクター新規作成画面';
  };
  // 外枠のタグを動的に決定（編集ならform, 閲覧ならdiv）
  const ContainerTag = isReadOnly ? 'div' : 'form';
  // formの場合のみ必要なprops
  const containerProps = isReadOnly
    ? {}
    : {
        onSubmit: handleSubmit,
        style: { minHeight: '100vh', paddingBottom: '4rem' }, // Edit時のスタイル
      };

  return (
    <div className={layoutStyles.container}>
      <header className={titleStyles.decoratedHeader}>
        <h1>
          <span className={titleStyles.mainTitle}>プレシャスデイズ</span>
          <span className={titleStyles.subTitle}>{getTitle()}</span>
        </h1>
      </header>

      {/* 上部・戻るボタン */}
      <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`}>
        <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
          <ActionButton
            className={layoutStyles.mt2}
            href='/preciousdays'
            icon={<ArrowBigLeftDash size={16} />}
            label='一覧に戻る'
            style={{ width: '100%', marginBottom: '30px' }}
            variant='outline'
          />
        </div>
      </div>

      {isLoading || !char ? (
        <Loading />
      ) : (
        <ContainerTag className={layoutStyles.grid} {...containerProps}>
          {/* === メインカラム (左側) === */}
          <div className={`${layoutStyles.span8} ${baseStyles.stack}`}>
            {/* プロフィール & 画像 */}
            <ProfileSection
              char={char}
              isReadOnly={isReadOnly}
              previewUrl={previewUrl}
              setChar={setChar}
              setPreviewUrl={setPreviewUrl}
              setSelectedFile={setSelectedFile}
              updateAbilities={updateAbilities}
            />

            {/* HP/MP/WP/GLなど (リソース) */}
            <ResourceSection char={char} isReadOnly={isReadOnly} setChar={setChar} />

            {/* 外見・ライフパス (2カラム表示) */}
            <div className={layoutStyles.grid}>
              <div className={layoutStyles.span6}>
                <AppearanceSection char={char} isReadOnly={isReadOnly} />
              </div>
              <div className={layoutStyles.span6} style={{ minWidth: 0 }}>
                <LifepathSection char={char} isReadOnly={isReadOnly} setChar={setChar} />
              </div>
            </div>

            {/* 能力値 */}
            <AbilitySection char={char} isReadOnly={isReadOnly} updateAbilities={updateAbilities} />

            {/* 戦闘値 */}
            <CombatSection char={char} isReadOnly={isReadOnly} setChar={setChar} />

            {/* 所持品 */}
            <ItemSection char={char} isReadOnly={isReadOnly} setChar={setChar} />
          </div>

          {/* === サイドバー (右側) === */}
          {/* モバイルでは orderLast で最後に表示 */}
          <SidebarSection
            char={char}
            charKey={charKey}
            className={baseStyles.mobileOrderLast}
            handleDelete={handleDelete}
            isReadOnly={isReadOnly}
            isSubmitting={isSubmitting}
          />

          {/* === 下段セクション === */}
          <div
            className={`${layoutStyles.span12} ${baseStyles.stack}`}
            style={{ marginTop: '32px' }}
          >
            <EquipmentSection char={char} isReadOnly={isReadOnly} setChar={setChar} />
            <SkillSection char={char} isReadOnly={isReadOnly} setChar={setChar} />
          </div>
        </ContainerTag>
      )}

      {/* 下部・戻るボタン */}
      <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`}>
        <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
          <ActionButton
            className={layoutStyles.mt2}
            href='/preciousdays'
            icon={<ArrowBigLeftDash size={16} />}
            label='一覧に戻る'
            style={{ width: '100%', marginBottom: '30px' }}
            variant='outline'
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetTemplate;
