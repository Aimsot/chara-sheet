/* src/components/preciousdays/CharacterSheetTemplate.tsx */
import React, { useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { ArrowBigLeftDash, ClipboardCopy, Eye, LoaderCircle, Lock, Pen, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AbilitySection } from '@/components/preciousdays/AbilitySection';
import { AppearanceSection } from '@/components/preciousdays/AppearanceSection';
import { CombatSection } from '@/components/preciousdays/CombatSection';
import EnchantmentSection from '@/components/preciousdays/EnchantmentSection';
import EquipmentSection from '@/components/preciousdays/EquipmentSection';
import GrowthTableSection from '@/components/preciousdays/GrowthTableSection';
import { ItemSection } from '@/components/preciousdays/ItemSection';
import { LifepathSection } from '@/components/preciousdays/LifepathSection';
import { MemorySection } from '@/components/preciousdays/MemorySection';
import { NoteSection } from '@/components/preciousdays/NoteSection';
import { ProfileSection } from '@/components/preciousdays/ProfileSection';
import { SidebarSection } from '@/components/preciousdays/SidebarSection';
import { SkillSection } from '@/components/preciousdays/SkillSection';
import WeightSection from '@/components/preciousdays/WeightSection';
import Loading from '@/components/ui/Loading';
import btnStyles from '@/styles/components/buttons.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character, Enchantment, Item, Memory, Skill } from '@/types/preciousdays/character';
import { buildCcfoliaCharacter } from '@/utils/preciousdays/buildCcfoliaCharacter';

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
  isDirty?: boolean;
}

interface EditActions {
  updateAbilities: (updates: Partial<Character>) => void;
  updateAppearance: (field: string, value: string) => void;
  updateBaseField: (field: keyof Character, value: any) => void;
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  handleDelete: () => Promise<void>;
  handleAbilitiesBonusChange: (key: string, val: number, setError: any) => void;
  handleAbilitiesOtherModifierChange: (key: string, val: number) => void;
  handleAbilitiesGrowthChange: (key: string, val: number, setError: any) => void;
  handleSkillsAdd: () => void;
  handleSkillsRemove: (index: number) => void;
  handleSkillsUpdate: (index: number, field: keyof Skill, value: any) => void;
  handleItemsAdd: () => void;
  handleItemsRemove: (index: number) => void;
  handleItemsUpdate: (index: number, field: keyof Item, value: any) => void;
  handleMemoriesAdd: () => void;
  handleMemoriesRemove: (index: number) => void;
  handleMemoriesUpdate: (index: number, field: keyof Memory, value: any) => void;
  handleEnchantmentsAdd: () => void;
  handleEnchantmentsRemove: (index: number) => void;
  handleEnchantmentsUpdate: (index: number, field: keyof Enchantment, value: any) => void;
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
    isLoading,
    mode,
    previewUrl,
    setPreviewUrl,
    setSelectedFile,
    setChar,
    isSubmitting = false,
    isDirty,
    updateAbilities = () => {},
    updateAppearance = () => {},
    updateBaseField = () => {},
    handleSubmit,
    handleDelete = async () => {},
    handleAbilitiesBonusChange = () => {},
    handleAbilitiesOtherModifierChange = () => {},
    handleAbilitiesGrowthChange = () => {},
    handleSkillsAdd = () => {},
    handleSkillsRemove = () => {},
    handleSkillsUpdate = () => {},
    handleItemsAdd = () => {},
    handleItemsRemove = () => {},
    handleItemsUpdate = () => {},
    handleMemoriesAdd = () => {},
    handleMemoriesRemove = () => {},
    handleMemoriesUpdate = () => {},
    handleEnchantmentsAdd = () => {},
    handleEnchantmentsRemove = () => {},
    handleEnchantmentsUpdate = () => {},
    handleCombatModifierChange = () => {},
    handleEquipmentUpdate = () => {},
    handleResourceUpdate = () => {},
    handleGLUpdate = () => {},
  } = props;

  const isReadOnly = mode === 'view';
  const router = useRouter();
  const totalExperience = (char.memories || []).reduce(
    (sum, m) => sum + (Number(m.experience) || 0),
    0
  );
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [ccfoliaCopied, setCcfoliaCopied] = useState(false);
  const [viewAutoResize, setViewAutoResize] = useState(false);
  const autoResize = isReadOnly ? viewAutoResize : (char.autoResizeTextarea ?? false);

  const handleCopyCcfolia = async () => {
    try {
      const json = buildCcfoliaCharacter(char);
      await navigator.clipboard.writeText(json);
      setCcfoliaCopied(true);
      setTimeout(() => setCcfoliaCopied(false), 2000);
    } catch {
      alert('クリップボードへのコピーに失敗しました');
    }
  };
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollToAuth = () => {
    const el = document.getElementById('signin-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const signinRef = (node: HTMLDivElement | null) => {
    // 前の監視をリセット
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsAuthVisible(entry.isIntersecting);
        },
        {
          threshold: 1,
          root: null,
          rootMargin: '0px',
        }
      );
      observer.observe(node);
      observerRef.current = observer;
    }
  };

  return (
    <div className={layoutStyles.container}>
      <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`}>
        <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
          <ActionButton
            className={layoutStyles.mt2}
            icon={<ArrowBigLeftDash size={16} />}
            label='一覧に戻る'
            onClick={() => {
              if (isSubmitting) return;
              if (isDirty) {
                const ok = window.confirm('編集中ですが、保存せずに一覧に戻ってもよろしいですか？');
                if (!ok) return;
              }
              router.push('/preciousdays');
            }}
            style={{ width: '100%', marginBottom: '30px' }}
            variant='outline'
          />
        </div>
      </div>
      {/* スマホ用：画面右上固定ボタンユニット */}
      <div className={baseStyles.mobileFixedActions}>
        {/* 閲覧ボタン */}
        {mode === 'edit' && (
          <ActionButton
            className={`${layoutStyles.mt2} ${baseStyles.compactBtn}`}
            disabled={isSubmitting}
            icon={<Eye size={12} />}
            label='閲覧'
            onClick={() => {
              if (isSubmitting) return;
              if (isDirty) {
                const ok = window.confirm(
                  '編集中ですが、保存せずに閲覧ページに戻ってもよろしいですか？'
                );
                if (!ok) return;
              }
              router.push(`/preciousdays/view/${char.id}`);
            }}
            style={{ width: '100%' }}
            variant='midnight'
          />
        )}
        {/* 編集ボタン */}
        {mode === 'view' && !char.password && (
          <ActionButton
            className={`${layoutStyles.mt2} ${baseStyles.compactBtn}`}
            disabled={isSubmitting}
            icon={<Pen size={12} />}
            label='編集'
            onClick={() => {
              router.push(`/preciousdays/edit?key=${char.id}`);
            }}
            style={{ width: '100%' }}
            variant='midnight'
          />
        )}
        {/* 出力ボタン（閲覧モード） */}
        {mode === 'view' && (
          <>
            <ActionButton
              className={`${layoutStyles.mt2} ${baseStyles.compactBtn}`}
              data-tooltip-id='ccfolia-tooltip'
              icon={<ClipboardCopy size={12} />}
              label={ccfoliaCopied ? 'コピー済' : '出力'}
              onClick={handleCopyCcfolia}
              style={{ width: '100%' }}
              variant={ccfoliaCopied ? 'solid' : 'midnight'}
            />
            <Tooltip content='ココフォリア用にコマをコピー' id='ccfolia-tooltip' place='bottom' />
          </>
        )}
        {mode === 'view' && char.password && !isAuthVisible && (
          <ActionButton
            className={`${layoutStyles.mt2} ${baseStyles.compactBtn}`}
            disabled={isSubmitting}
            icon={<Lock size={12} />}
            label='認証'
            onClick={scrollToAuth} // ← 関数に変更
            variant='midnight'
          />
        )}
        {/* 保存ボタン */}
        {mode !== 'view' && (
          <ActionButton
            className={`${layoutStyles.mt2} ${baseStyles.compactBtn}`}
            disabled={isSubmitting || !isDirty}
            form='char-form'
            icon={
              isSubmitting ? (
                <LoaderCircle className={btnStyles.spinner} size={8} />
              ) : (
                <Save size={12} />
              )
            }
            label={isSubmitting ? '' : mode !== 'create' ? '保存' : '登録'}
            style={{ width: '100%' }}
            submit={true}
            variant={isDirty ? 'primary' : 'disabled'}
          />
        )}
      </div>
      {isLoading || !char ? (
        <Loading />
      ) : (
        <form
          className={layoutStyles.grid}
          id='char-form'
          onSubmit={isReadOnly ? undefined : handleSubmit}
        >
          <div className={`${layoutStyles.span8} ${baseStyles.stack}`}>
            <ProfileSection
              characterName={char.characterName}
              characterStyle={char.style}
              element={char.element}
              experience={totalExperience}
              isReadOnly={isReadOnly}
              masterName={char.masterName}
              playerName={char.playerName}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              setSelectedFile={setSelectedFile}
              species={char.species}
              updateAbilities={updateAbilities}
              updateBaseField={updateBaseField}
            />

            <GrowthTableSection
              experience={totalExperience}
              gl={char.gl}
              items={char.items}
              style={char.style}
            />

            <ResourceSection
              abilities={char.abilities}
              element={char.element}
              experience={totalExperience}
              gl={char.gl}
              handleGLUpdate={handleGLUpdate}
              handleResourceUpdate={handleResourceUpdate}
              hp={char.hp}
              isReadOnly={isReadOnly}
              mp={char.mp}
              style={char.style}
              wp={char.wp}
            />

            <div className={layoutStyles.grid}>
              <div className={layoutStyles.span6}>
                <AppearanceSection
                  appearance={char.appearance}
                  isReadOnly={isReadOnly}
                  updateAppearance={updateAppearance}
                />
              </div>
              <div className={layoutStyles.span6} style={{ minWidth: 0 }}>
                <LifepathSection
                  future={char.future}
                  isReadOnly={isReadOnly}
                  origin={char.origin}
                  secret={char.secret}
                  updateBaseField={updateBaseField}
                />
              </div>
            </div>

            <AbilitySection
              abilities={char.abilities}
              element={char.element}
              gl={char.gl}
              handleAbilitiesBonusChange={handleAbilitiesBonusChange}
              handleAbilitiesGrowthChange={handleAbilitiesGrowthChange}
              handleAbilitiesOtherModifierChange={handleAbilitiesOtherModifierChange}
              isReadOnly={isReadOnly}
              species={char.species}
              style={char.style}
              updateAbilities={updateAbilities}
            />

            <CombatSection
              abilities={char.abilities}
              combatValues={char.combatValues}
              equipment={char.equipment}
              handleCombatModifierChange={handleCombatModifierChange}
              isReadOnly={isReadOnly}
              specialChecks={char.specialChecks}
              style={char.style}
            />
          </div>

          <SidebarSection
            autoResize={isReadOnly ? viewAutoResize : undefined}
            char={char}
            className={`${layoutStyles.span4} ${baseStyles.mobileOrderLast}`}
            handleDelete={handleDelete}
            id={char.id}
            isCopyProhibited={char.isCopyProhibited}
            isDirty={isDirty}
            isReadOnly={isReadOnly}
            isSubmitting={isSubmitting}
            mode={mode}
            onAutoResizeChange={isReadOnly ? (v) => setViewAutoResize(v) : undefined}
            password={char.password}
            setChar={setChar}
            signinRef={signinRef}
          />

          <div
            className={`${layoutStyles.span12} ${baseStyles.stack}`}
            style={{ marginTop: '32px' }}
          >
            <EquipmentSection
              abilities={char.abilities}
              autoResize={autoResize}
              equipment={char.equipment}
              handleEquipmentUpdate={handleEquipmentUpdate}
              isReadOnly={isReadOnly}
              items={char.items}
              species={char.species}
            />
            <ItemSection
              autoResize={autoResize}
              handleItemsAdd={handleItemsAdd}
              handleItemsRemove={handleItemsRemove}
              handleItemsUpdate={handleItemsUpdate}
              isReadOnly={isReadOnly}
              items={char.items}
            />
            <WeightSection
              abilities={char.abilities}
              equipment={char.equipment}
              items={char.items}
              species={char.species}
            />
            <EnchantmentSection
              autoResize={autoResize}
              enchantments={
                char.enchantments?.length
                  ? char.enchantments
                  : [{ id: 'e1', name: '', gl: 0, effect: '' }]
              }
              handleEnchantmentsAdd={handleEnchantmentsAdd}
              handleEnchantmentsRemove={handleEnchantmentsRemove}
              handleEnchantmentsUpdate={handleEnchantmentsUpdate}
              isReadOnly={isReadOnly}
            />
            <SkillSection
              autoResize={autoResize}
              handleSkillsAdd={handleSkillsAdd}
              handleSkillsRemove={handleSkillsRemove}
              handleSkillsUpdate={handleSkillsUpdate}
              isReadOnly={isReadOnly}
              skills={char.skills}
            />
            <NoteSection
              autoResize={autoResize}
              isReadOnly={isReadOnly}
              note={char.note ?? ''}
              secretNote={char.secretNote ?? ''}
              updateNote={(val) => updateBaseField('note', val)}
              updateSecretNote={(val) => updateBaseField('secretNote', val)}
            />
            <div id='memory-section'>
              <MemorySection
                autoResize={autoResize}
                handleMemoriesAdd={handleMemoriesAdd}
                handleMemoriesRemove={handleMemoriesRemove}
                handleMemoriesUpdate={handleMemoriesUpdate}
                isReadOnly={isReadOnly}
                memories={char.memories}
              />
            </div>
          </div>
        </form>
      )}
      {/* ページ下部：一覧に戻るボタン */}
      {!isLoading && char && (
        <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`} style={{ marginTop: '16px' }}>
          <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
            <ActionButton
              icon={<ArrowBigLeftDash size={16} />}
              label='一覧に戻る'
              onClick={() => {
                if (isSubmitting) return;
                if (isDirty) {
                  const ok = window.confirm(
                    '編集中ですが、保存せずに一覧に戻ってもよろしいですか？'
                  );
                  if (!ok) return;
                }
                router.push('/preciousdays');
              }}
              style={{ width: '100%' }}
              variant='outline'
            />
          </div>
        </div>
      )}
    </div>
  );
};

CharacterSheetTemplate.displayName = 'CharacterSheetTemplate';
export default CharacterSheetTemplate;
