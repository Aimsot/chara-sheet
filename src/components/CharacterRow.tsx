'use client';

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
import { Character } from '@/types/preciousdays/character';

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

export const CharacterRow = ({ characters }: { characters: Character[] }) => {
  return (
    <div className={styles.listContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.colName}>NAME</div>
        <div className={styles.colPlayer}>PLAYER</div>
        <div className={styles.colSummary}>DATA</div>
        <div className={styles.colStats}>STATUS</div>
      </div>

      {characters.map((char) => {
        // --- 安全な計算処理 ---
        // char.abilities がない場合でも 0 として計算されるようにガード
        const styleKey = (char.style as StyleKey) || '';
        const hpTotal = (STYLE_DATA[styleKey].hp.base || 0) + (char.hp?.modifier || 0);
        const mpTotal = (STYLE_DATA[styleKey].mp.base || 0) + (char.mp?.modifier || 0);
        const wpTotal =
          (char.abilities?.passion?.total || 0) +
          (char.abilities?.affection?.total || 0) +
          (char.wp?.modifier || 0);

        // 属性名取得 (char.element が undefined でも壊れない)
        const elementName = ELEMENT_DATA[char.element as ElementKey]?.name || char.element || '無';
        const elementStyleClass = getElementClass(char.element);

        return (
          <Link className={styles.row} href={`/preciousdays/view/${char.id}`} key={char.id}>
            <div className={styles.colName}>
              {/* 名前がない場合は ID や '名称未設定' を出す */}
              <div className={styles.nameLink}>{char.characterName || '(名称未設定)'}</div>
            </div>

            <div className={styles.colPlayer}>{char.playerName || 'プレイヤー未設定'}</div>

            <div className={styles.colSummary}>
              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>種族</span>
                <span className={styles.itemValueWrapper}>
                  {SPECIES_DATA[char.species as SpeciesKey]?.name || char.species || '未設定'}
                </span>
              </div>

              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>型</span>
                <span className={styles.itemValueWrapper}>
                  {STYLE_DATA[char.style as StyleKey]?.name || char.style || '未設定'}
                </span>
              </div>

              <div className={styles.stackedItem}>
                <span className={styles.itemLabel}>属性</span>
                <span className={`${styles.elementValue} ${elementStyleClass}`}>{elementName}</span>
              </div>
            </div>

            <div className={styles.colStats}>
              {/* HP/MP も ?. を使って安全に参照 */}
              <div className={`${styles.statBox} ${styles.hp}`}>
                <span className={styles.statLabel}>HP</span>
                <span className={styles.statValue}>{hpTotal ?? 0}</span>
              </div>
              <div className={`${styles.statBox} ${styles.mp}`}>
                <span className={styles.statLabel}>MP</span>
                <span className={styles.statValue}>{mpTotal ?? 0}</span>
              </div>
              <div className={`${styles.statBox} ${styles.wp}`}>
                <span className={styles.statLabel}>WP</span>
                <span className={styles.statValue}>{wpTotal}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
