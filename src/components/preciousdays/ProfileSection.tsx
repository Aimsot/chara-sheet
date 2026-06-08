import { memo, useState } from 'react';

import Image from 'next/image';

import {
  ELEMENT_COLORS,
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
} from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import imageStyles from '@/styles/components/charaSheet/image.module.scss'; // 画像アップロード用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface ProfileProps {
  characterName: string | undefined;
  playerName: string | undefined;
  masterName: string | undefined;
  species: string;
  characterStyle: string;
  element: string;
  experience: number | undefined;
  updateAbilities: (updates: Partial<Character>) => void;
  updateBaseField: (field: keyof Character, value: any) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  isReadOnly?: boolean;
}

export const ProfileSection: React.FC<ProfileProps> = memo(
  ({
    characterName,
    playerName,
    masterName,
    species,
    characterStyle,
    element,
    experience,
    updateAbilities,
    updateBaseField,
    previewUrl,
    setPreviewUrl,
    setSelectedFile,
    isReadOnly,
  }) => {
    const handleImageChange = (file: File) => {
      if (!file) return;
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const [isOpen, setIsOpen] = useState(true);

    return (
      <section className={`${cardStyles.base} ${layoutStyles.span12}`}>
        {/* アコーディオンヘッダー */}
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>基本プロフィール</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={baseStyles.splitLayout}>
            {/* --- 左側: 画像アップロードエリア --- */}
            <div
              className={`${imageStyles.uploadBox} ${isReadOnly ? imageStyles.isReadOnly : ''}`}
              onDragOver={(e) => !isReadOnly && e.preventDefault()}
              onDrop={(e) => {
                if (isReadOnly) return;
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith('image/')) {
                  handleImageChange(file);
                }
              }}
            >
              <label className={`${imageStyles.label} ${isReadOnly ? imageStyles.isReadOnly : ''}`}>
                {previewUrl ? (
                  <Image
                    alt='Character'
                    className={imageStyles.preview}
                    fill // これで width/height の指定が不要になります
                    src={previewUrl}
                    style={{
                      objectFit: 'contain', // 枠内に収める（全体を見せたい場合）
                      objectPosition: 'top center',
                    }}
                  />
                ) : (
                  !isReadOnly && (
                    <div className={imageStyles.placeholder}>
                      <span>画像をクリックして追加</span>
                      <span>またはここにドラッグ</span>
                    </div>
                  )
                )}

                {!isReadOnly && (
                  <input
                    accept='image/*'
                    className={imageStyles.hiddenInput}
                    onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                    type='file'
                  />
                )}
              </label>
            </div>

            {/* --- 右側: 入力フォームエリア (baseStyles.stack で縦積み) --- */}
            <div className={baseStyles.stack}>
              <div className={layoutStyles.grid}>
                {/* キャラクター名 */}
                <div className={`${layoutStyles.span12} ${formStyles.fieldGroup}`}>
                  <label>キャラクター名</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {characterName}
                    </div>
                  ) : (
                    <input
                      className={formStyles.input}
                      inputMode='text'
                      onChange={(e) => updateBaseField('characterName', e.target.value)}
                      type='text'
                      value={characterName ?? ''}
                    />
                  )}
                </div>

                {/* プレイヤー名 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>プレイヤー名（必須）</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {playerName}
                    </div>
                  ) : (
                    <input
                      className={formStyles.input}
                      inputMode='text'
                      onChange={(e) => updateBaseField('playerName', e.target.value)}
                      type='text'
                      value={playerName ?? ''}
                    />
                  )}
                </div>

                {/* 師匠名 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>師匠名</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {masterName}
                    </div>
                  ) : (
                    <input
                      className={formStyles.input}
                      inputMode='text'
                      onChange={(e) => updateBaseField('masterName', e.target.value)}
                      type='text'
                      value={masterName ?? ''}
                    />
                  )}
                </div>

                {/* 種族 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>種族</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {SPECIES_DATA[species as SpeciesKey]?.name || species}
                    </div>
                  ) : (
                    <select
                      className={formStyles.select}
                      onChange={(e) => updateAbilities({ species: e.target.value as SpeciesKey })}
                      value={species}
                    >
                      {Object.entries(SPECIES_DATA).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* スタイル */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>スタイル</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {STYLE_DATA[characterStyle as StyleKey]?.name || characterStyle}
                    </div>
                  ) : (
                    <select
                      className={formStyles.select}
                      onChange={(e) => updateAbilities({ style: e.target.value as StyleKey })}
                      value={characterStyle}
                    >
                      {Object.entries(STYLE_DATA).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 属性 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>属性</label>
                  {isReadOnly ? (
                    <div
                      className={baseStyles.readOnlyField}
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: ELEMENT_COLORS[element] || 'var(--text-primary)',
                        textShadow: ELEMENT_COLORS[element]
                          ? `0 0 8px ${ELEMENT_COLORS[element]}88`
                          : 'none',
                      }}
                    >
                      {ELEMENT_DATA[element as ElementKey]?.name || element}
                    </div>
                  ) : (
                    <select
                      className={formStyles.select}
                      onChange={(e) => updateAbilities({ element: e.target.value as ElementKey })}
                      style={{ color: ELEMENT_COLORS[element] || 'inherit' }}
                      value={element}
                    >
                      {Object.entries(ELEMENT_DATA).map(([k, v]) => (
                        <option key={k} style={{ color: ELEMENT_COLORS[k] || 'inherit' }} value={k}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 経験点 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label htmlFor='experience'>経験点</label>
                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField} style={{ fontSize: '0.9rem' }}>
                      {experience}
                    </div>
                  ) : (
                    <input
                      autoComplete='off'
                      className={formStyles.input}
                      inputMode='numeric'
                      name='experience'
                      onChange={(e) => updateBaseField('experience', e.target.value)}
                      pattern='[0-9]*'
                      placeholder='0'
                      type='text'
                      value={experience ?? ''}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
ProfileSection.displayName = 'ProfileSection';
