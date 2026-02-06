/* src/components/preciousdays/CharacterSheetTemplate.tsx */
import React from 'react';

import { ArrowBigLeftDash } from 'lucide-react';

import { AbilitySection } from '@/components/preciousdays/AbilitySection';
import { AppearanceSection } from '@/components/preciousdays/AppearanceSection';
import { CombatSection } from '@/components/preciousdays/CombatSection';
import EquipmentSection from '@/components/preciousdays/EquipmentSection';
import { ItemSection } from '@/components/preciousdays/ItemSection';
import { LifepathSection } from '@/components/preciousdays/LifepathSection';
import { ProfileSection } from '@/components/preciousdays/ProfileSection';
import { SidebarSection } from '@/components/preciousdays/SidebarSection';
import { SkillSection } from '@/components/preciousdays/SkillSection';
import Loading from '@/components/ui/Loading';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import titleStyles from '@/styles/components/titles.module.scss';
import { Character, Item, Skill } from '@/types/preciousdays/character';

import { ActionButton } from '../ui/ActionButton';

import ResourceSection from './ResourceSection';

type TemplateMode = 'create' | 'edit' | 'view';

// 全モード共通のProps
interface BaseTemplateProps {
  char: Character;
  isLoading: boolean;
  mode: TemplateMode;
  previewUrl: string | null;
  setChar: React.Dispatch<React.SetStateAction<Character>>;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  isSubmitting?: boolean;
}

// 編集・作成時のみ「必須」となるアクション群
interface EditActions {
  updateAbilities: (updates: Partial<Character>) => void;
  updateAppearance: (field: string, value: string) => void;
  updateBaseField: (field: keyof Character, value: any) => void;
  // React.FormEvent ではなく React.SubmitEvent を使用
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  handleDelete: () => Promise<void>;
  handleAbilitiesBonusChange: (key: string, val: number, setError: any) => void;
  handleAbilitiesOtherModifierChange: (key: string, val: number) => void;
  handleSkillsAdd: () => void;
  handleSkillsRemove: (index: number) => void;
  handleSkillsUpdate: (index: number, field: keyof Skill, value: any) => void;
  handleItemsAdd: () => void;
  handleItemsRemove: (index: number) => void;
  handleItemsUpdate: (index: number, field: keyof Item, value: any) => void;
  handleCombatModifierChange: (
    target: 'combatValues' | 'specialChecks',
    key: string,
    newValue: number
  ) => void;
  handleEquipmentUpdate: (slotKey: string, field: string, value: any) => void;
  handleResourceUpdate: (key: 'hp' | 'mp' | 'wp', val: number) => void;
  handleGLUpdate: (val: number) => void;
}

// モードに応じたPropsの結合
type TemplateProps = BaseTemplateProps &
  (({ mode: 'create' | 'edit' } & EditActions) | ({ mode: 'view' } & Partial<EditActions>)); // view時はアクションを任意にする

const CharacterSheetTemplate: React.FC<TemplateProps> = (props) => {
  const {
    char,
    isLoading = false,
    mode,
    previewUrl,
    setPreviewUrl,
    setSelectedFile,
    setChar,
    isSubmitting = false,
    // 以下、EditActions から抽出（view時はundefinedの可能性がある）
    updateAbilities = () => {},
    updateAppearance = () => {},
    updateBaseField = () => {},
    handleSubmit,
    handleDelete = async () => {},
    handleAbilitiesBonusChange = () => {},
    handleAbilitiesOtherModifierChange = () => {},
    handleSkillsAdd = () => {},
    handleSkillsRemove = () => {},
    handleSkillsUpdate = () => {},
    handleItemsAdd = () => {},
    handleItemsRemove = () => {},
    handleItemsUpdate = () => {},
    handleCombatModifierChange = () => {},
    handleEquipmentUpdate = () => {},
    handleResourceUpdate = () => {},
    handleGLUpdate = () => {},
  } = props;

  const isReadOnly = mode === 'view';
  const charKey = char?.id;

  const getTitle = () => {
    if (mode === 'view') return '閲覧画面';
    return charKey ? 'キャラクター編集画面' : 'キャラクター新規作成画面';
  };

  const containerProps = isReadOnly
    ? {}
    : {
        // handleSubmit を型安全に呼び出す
        onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => handleSubmit?.(e),
        style: { minHeight: '100vh', paddingBottom: '4rem' },
      };

  return (
    <div className={layoutStyles.container}>
      <header className={titleStyles.decoratedHeader}>
        <h1>
          <span className={titleStyles.mainTitle}>プレシャスデイズ</span>
          <span className={titleStyles.subTitle}>{getTitle()}</span>
        </h1>
      </header>

      {/* 共通の戻るボタンなどは省略せずに維持 */}
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
        <form className={layoutStyles.grid} {...containerProps}>
          <div className={`${layoutStyles.span8} ${baseStyles.stack}`}>
            <ProfileSection
              char={char}
              isReadOnly={isReadOnly}
              previewUrl={previewUrl}
              setChar={setChar}
              setPreviewUrl={setPreviewUrl}
              setSelectedFile={setSelectedFile}
              updateAbilities={updateAbilities}
              updateBaseField={updateBaseField}
            />

            <ResourceSection
              char={char}
              handleGLUpdate={handleGLUpdate}
              handleResourceUpdate={handleResourceUpdate}
              isReadOnly={isReadOnly}
            />

            <div className={layoutStyles.grid}>
              <div className={layoutStyles.span6}>
                <AppearanceSection
                  char={char}
                  isReadOnly={isReadOnly}
                  updateAppearance={updateAppearance}
                />
              </div>
              <div className={layoutStyles.span6} style={{ minWidth: 0 }}>
                <LifepathSection
                  char={char}
                  isReadOnly={isReadOnly}
                  updateBaseField={updateBaseField}
                />
              </div>
            </div>

            <AbilitySection
              char={char}
              handleAbilitiesBonusChange={handleAbilitiesBonusChange}
              handleAbilitiesOtherModifierChange={handleAbilitiesOtherModifierChange}
              isReadOnly={isReadOnly}
              updateAbilities={updateAbilities}
            />

            <CombatSection
              char={char}
              handleCombatModifierChange={handleCombatModifierChange}
              isReadOnly={isReadOnly}
            />

            <ItemSection
              char={char}
              handleItemsAdd={handleItemsAdd}
              handleItemsRemove={handleItemsRemove}
              handleItemsUpdate={handleItemsUpdate}
              isReadOnly={isReadOnly}
            />
          </div>

          <SidebarSection
            char={char}
            charKey={charKey}
            className={layoutStyles.span4}
            handleDelete={handleDelete}
            isReadOnly={isReadOnly}
            isSubmitting={isSubmitting}
            mode={mode}
            setChar={setChar}
          />

          <div
            className={`${layoutStyles.span12} ${baseStyles.stack}`}
            style={{ marginTop: '32px' }}
          >
            <EquipmentSection
              char={char}
              handleEquipmentUpdate={handleEquipmentUpdate}
              isReadOnly={isReadOnly}
            />
            <SkillSection
              char={char}
              handleSkillsAdd={handleSkillsAdd}
              handleSkillsRemove={handleSkillsRemove}
              handleSkillsUpdate={handleSkillsUpdate}
              isReadOnly={isReadOnly}
            />
          </div>
        </form>
      )}
      {/* 戻るボタン下部省略 */}
    </div>
  );
};

CharacterSheetTemplate.displayName = 'CharacterSheetTemplate';
export default CharacterSheetTemplate;
