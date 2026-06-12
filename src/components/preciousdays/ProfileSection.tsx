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
import { scrambleText } from '@/utils/preciousdays/scrambleText';

type ProfileSpoilerKey = 'species' | 'style' | 'element';

interface ProfileProps {
  characterName: string | undefined;
  playerName: string | undefined;
  masterName: string | undefined;
  discipleName: string | undefined;
  characterType: 'disciple' | 'master' | undefined;
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
  profileSpoilers?: { species?: boolean; style?: boolean; element?: boolean };
  onSpoilerChange?: (field: ProfileSpoilerKey, value: boolean) => void;
}

export const ProfileSection: React.FC<ProfileProps> = memo(
  ({
    characterName,
    playerName,
    masterName,
    discipleName,
    characterType,
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
    profileSpoilers,
    onSpoilerChange,
  }) => {
    const isMaster = characterType === 'master';
    const handleImageChange = (file: File) => {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('画像ファイルは5MB以下にしてください');
        return;
      }
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
                      objectFit: 'cover',
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
                    <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
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
                    <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
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

                {/* 師匠名 / 弟子名（種別により切替） */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>{isMaster ? '弟子名' : '師匠名'}</label>
                  {isReadOnly ? (
                    <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                      {isMaster ? discipleName : masterName}
                    </div>
                  ) : (
                    <input
                      className={formStyles.input}
                      inputMode='text'
                      onChange={(e) =>
                        updateBaseField(isMaster ? 'discipleName' : 'masterName', e.target.value)
                      }
                      type='text'
                      value={(isMaster ? discipleName : masterName) ?? ''}
                    />
                  )}
                </div>

                {/* 種族 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>種族</label>
                  {isReadOnly ? (
                    profileSpoilers?.species ? (
                      <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                        <span className={baseStyles.spoiler} title='師匠によって秘匿されています'>
                          {scrambleText(SPECIES_DATA[species as SpeciesKey]?.name || species)}
                        </span>
                      </div>
                    ) : (
                      <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                        {SPECIES_DATA[species as SpeciesKey]?.name || species}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateAbilities({ species: e.target.value as SpeciesKey })}
                        style={{ flex: 1 }}
                        value={species}
                      >
                        {Object.entries(SPECIES_DATA).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      {isMaster && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            秘匿
                          </span>
                          <input
                            checked={profileSpoilers?.species ?? false}
                            onChange={(e) => onSpoilerChange?.('species', e.target.checked)}
                            type='checkbox'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* スタイル */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>スタイル</label>
                  {isReadOnly ? (
                    profileSpoilers?.style ? (
                      <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                        <span className={baseStyles.spoiler} title='師匠によって秘匿されています'>
                          {scrambleText(
                            STYLE_DATA[characterStyle as StyleKey]?.name || characterStyle
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                        {STYLE_DATA[characterStyle as StyleKey]?.name || characterStyle}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateAbilities({ style: e.target.value as StyleKey })}
                        style={{ flex: 1 }}
                        value={characterStyle}
                      >
                        {Object.entries(STYLE_DATA).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      {isMaster && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            秘匿
                          </span>
                          <input
                            checked={profileSpoilers?.style ?? false}
                            onChange={(e) => onSpoilerChange?.('style', e.target.checked)}
                            type='checkbox'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 属性 */}
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                  <label>属性</label>
                  {isReadOnly ? (
                    profileSpoilers?.element ? (
                      <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                        <span className={baseStyles.spoiler} title='師匠によって秘匿されています'>
                          {scrambleText(ELEMENT_DATA[element as ElementKey]?.name || element)}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}
                        style={{
                          fontWeight: 'bold',
                          color: ELEMENT_COLORS[element] || 'var(--text-primary)',
                          textShadow: ELEMENT_COLORS[element]
                            ? `0 0 8px ${ELEMENT_COLORS[element]}88`
                            : 'none',
                        }}
                      >
                        {ELEMENT_DATA[element as ElementKey]?.name || element}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateAbilities({ element: e.target.value as ElementKey })}
                        style={{ flex: 1, color: ELEMENT_COLORS[element] || 'inherit' }}
                        value={element}
                      >
                        {Object.entries(ELEMENT_DATA).map(([k, v]) => (
                          <option
                            key={k}
                            style={{ color: ELEMENT_COLORS[k] || 'inherit' }}
                            value={k}
                          >
                            {v.name}
                          </option>
                        ))}
                      </select>
                      {isMaster && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            秘匿
                          </span>
                          <input
                            checked={profileSpoilers?.element ?? false}
                            onChange={(e) => onSpoilerChange?.('element', e.target.checked)}
                            type='checkbox'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 経験点合計（弟子のみ） */}
                {!isMaster && (
                  <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                    <label>経験点（合計）</label>
                    <div className={`${baseStyles.readOnlyField} ${formStyles.readonlyValue}`}>
                      {experience ?? 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isReadOnly && !isMaster && (
            <div className={formStyles.notes} style={{ marginBottom: 0 }}>
              <p>
                経験点は各シナリオの獲得分を{' '}
                <a
                  href='#memory-section'
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById('memory-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ color: 'var(--accent-color)' }}
                >
                  メモリー
                </a>{' '}
                に記録できます。
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }
);
ProfileSection.displayName = 'ProfileSection';
