'use client';

import { memo } from 'react';

import Link from 'next/link';

import {
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
} from '@/constants/preciousdays';
import styles from '@/styles/components/charaList/row.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import { CharacterSummary } from '@/types/preciousdays/character';
import { getGLColor } from '@/utils/preciousdays/glColor';
import { scrambleText } from '@/utils/preciousdays/scrambleText';

// 属性に応じたクラス名を返すヘルパー
const getElementClass = (elementKey: string) => {
  switch (elementKey) {
    case 'earth':
      return styles.earth;
    case 'fire':
      return styles.fire;
    case 'water':
      return styles.water;
    case 'wind':
      return styles.wind;
    case 'dark':
      return styles.dark;
    case 'light':
      return styles.light;
    default:
      return '';
  }
};

export const CharacterRow = memo(({ characters }: { characters: CharacterSummary[] }) => {
  return (
    <div className={styles.listContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.colName}>NAME</div>
        <div className={styles.colPlayer}>PLAYER</div>
        <div className={styles.colSummary}>DATA</div>
        <div className={styles.colStats}>STATUS</div>
      </div>

      {characters.map((char) => {
        // 属性名取得 (char.element が undefined でも壊れない)
        const elementName = ELEMENT_DATA[char.element as ElementKey]?.name || char.element || '無';
        const elementStyleClass = getElementClass(char.element);
        const sp = char.characterType === 'master' ? (char.profileSpoilers ?? {}) : {};
        const gl = char.gl ?? 0;
        const discipleGLColor =
          char.characterType === 'disciple' && gl > 0 ? getGLColor(gl) : undefined;

        return (
          <Link className={styles.row} href={`/preciousdays/view/${char.id}`} key={char.id}>
            <div className={styles.colName}>
              {/* 名前がない場合は ID や '名称未設定' を出す */}
              <div className={styles.nameLink}>{char.characterName || '(名称未設定)'}</div>
            </div>

            <div className={styles.colPlayer}>{char.playerName || 'プレイヤー未設定'}</div>

            <div className={styles.colSummary}>
              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>役割</span>
                <span
                  className={
                    char.characterType === 'master' ? styles.masterType : styles.discipleType
                  }
                >
                  {char.characterType === 'master' ? '師匠' : '弟子'}
                </span>
              </div>

              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>種族</span>
                <span
                  className={sp.species ? baseStyles.spoiler : styles.itemValueWrapper}
                  title={sp.species ? '師匠によって秘匿されています' : undefined}
                >
                  {sp.species
                    ? scrambleText(
                        SPECIES_DATA[char.species as SpeciesKey]?.name || char.species || '未設定'
                      )
                    : SPECIES_DATA[char.species as SpeciesKey]?.name || char.species || '未設定'}
                </span>
              </div>

              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>ｽﾀｲﾙ</span>
                <span
                  className={sp.style ? baseStyles.spoiler : styles.itemValueWrapper}
                  title={sp.style ? '師匠によって秘匿されています' : undefined}
                >
                  {sp.style
                    ? scrambleText(
                        STYLE_DATA[char.style as StyleKey]?.name || char.style || '未設定'
                      )
                    : STYLE_DATA[char.style as StyleKey]?.name || char.style || '未設定'}
                </span>
              </div>

              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>属性</span>
                <span
                  className={
                    sp.element ? baseStyles.spoiler : `${styles.elementValue} ${elementStyleClass}`
                  }
                  title={sp.element ? '師匠によって秘匿されています' : undefined}
                >
                  {sp.element ? scrambleText(elementName) : elementName}
                </span>
              </div>
            </div>

            <div className={styles.colStats}>
              {char.characterType !== 'master' && (
                <>
                  <div className={`${styles.statBox} ${styles.hp}`}>
                    <span className={styles.statLabel}>HP</span>
                    <span className={styles.statValue}>{char.hp}</span>
                  </div>
                  <div className={`${styles.statBox} ${styles.mp}`}>
                    <span className={styles.statLabel}>MP</span>
                    <span className={styles.statValue}>{char.mp}</span>
                  </div>
                  <div className={`${styles.statBox} ${styles.wp}`}>
                    <span className={styles.statLabel}>WP</span>
                    <span className={styles.statValue}>{char.wp}</span>
                  </div>
                  <div
                    className={styles.statBox}
                    style={
                      discipleGLColor
                        ? {
                            color: discipleGLColor,
                            borderLeft: `2px solid ${discipleGLColor}55`,
                          }
                        : undefined
                    }
                  >
                    <span className={styles.statLabel}>GL</span>
                    <span className={styles.statValue}>{char.gl ?? 0}</span>
                  </div>
                </>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
});

CharacterRow.displayName = 'CharacterRow';
