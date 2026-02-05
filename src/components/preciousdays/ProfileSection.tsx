import { useState } from 'react';

import Image from 'next/image';

import { SPECIES_DATA, SpeciesKey } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import imageStyles from '@/styles/components/charaSheet/image.module.scss'; // 画像アップロード用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface ProfileProps {
  char: Character;
  setChar: (char: Character) => void;
  updateAbilities: (updates: Partial<Character>) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  isReadOnly?: boolean;
}

export const ProfileSection: React.FC<ProfileProps> = ({
  char,
  updateAbilities,
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
        className={cardStyles.accordionHeader}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <h2 className={cardStyles.title}>基本プロフィール</h2>
        <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
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
                  <div className={baseStyles.readOnlyField}>{char.characterName}</div>
                ) : (
                  <input
                    className={formStyles.input}
                    defaultValue={char.characterName ?? ''}
                    name='characterName'
                    type='text'
                  />
                )}
              </div>

              {/* プレイヤー名 */}
              <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                <label>プレイヤー名</label>
                {isReadOnly ? (
                  <div className={baseStyles.readOnlyField}>{char.playerName}</div>
                ) : (
                  <input
                    className={formStyles.input}
                    defaultValue={char.playerName ?? ''}
                    name='playerName'
                    type='text'
                  />
                )}
              </div>

              {/* 師匠 */}
              <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                <label>師匠</label>
                {isReadOnly ? (
                  <div className={baseStyles.readOnlyField}>{char.masterName}</div>
                ) : (
                  <input
                    className={formStyles.input}
                    defaultValue={char.masterName ?? ''}
                    name='masterName'
                    type='text'
                  />
                )}
              </div>

              {/* 種族 (セレクトボックス) */}
              <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`}>
                <label>種族</label>
                {isReadOnly ? (
                  <div className={baseStyles.readOnlyField}>
                    {/* SPECIES_DATA から日本語名を引いてくる */}
                    {SPECIES_DATA[char.species as SpeciesKey]?.name || char.species}
                  </div>
                ) : (
                  <select
                    className={formStyles.select}
                    onChange={(e) => updateAbilities({ species: e.target.value as SpeciesKey })}
                    value={char.species}
                  >
                    {Object.entries(SPECIES_DATA).map(([k, v]) => (
                      <option key={k} value={k}>
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
                  <div className={baseStyles.readOnlyField}>{char.experience}</div>
                ) : (
                  <input
                    autoComplete='off'
                    className={formStyles.input}
                    defaultValue={char.experience ?? 0}
                    inputMode='numeric'
                    name='experience'
                    pattern='[0-9]*'
                    type='text'
                  />
                )}
              </div>
            </div>
          </div>
          {/* End of Right Side */}
        </div>
      </div>
    </section>
  );
};
