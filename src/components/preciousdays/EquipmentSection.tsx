import React, { memo, useCallback, useMemo, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import { SPECIES_DATA, SpeciesKey } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

import WeightSection from './WeightSection';

interface EquipmentSectionProps {
  equipment: Character['equipment'];
  items: Character['items'];
  abilities: Character['abilities'];
  species: string;
  isReadOnly?: boolean;
  handleEquipmentUpdate: (slotKey: string, field: string, value: any) => void;
}

const SLOTS: { key: keyof Character['equipment']; label: string }[] = [
  { key: 'rHand', label: '右手' },
  { key: 'lHand', label: '左手' },
  { key: 'head', label: '頭部' },
  { key: 'body', label: '胴部' },
  { key: 'accessory', label: '補助防具' },
  { key: 'guardian', label: '守護魔術' },
];

// 9列の装備用グリッド設定
const equipGridStyle = {
  display: 'grid',
  gridTemplateColumns: '80px 1.5fr 110px 110px 70px 100px 110px 110px 2fr',
  columnGap: '12px',
  minWidth: '1200px',
};

const EquipmentHeader = ({ isFooter }: { isFooter?: boolean }) => {
  return (
    <div className={tableStyles.headerRow} style={equipGridStyle}>
      <div className={tableStyles.labelCell}>{!isFooter ? '部位' : ''}</div>
      <div className={tableStyles.cell}>{!isFooter ? '名称' : ''}</div>
      <div className={tableStyles.cell}>重量</div>
      <div className={tableStyles.cell}>命中</div>
      <div className={tableStyles.cell}>ダメージ</div>
      <div className={tableStyles.cell}>射程</div>
      <div className={tableStyles.cell}>回避</div>
      <div className={tableStyles.cell}>防御</div>
      <div className={tableStyles.cell}>備考</div>
    </div>
  );
};

// ▼ 1. 装備1行分を独立コンポーネント化 (memo化)
const EquipmentRow = memo(
  ({
    slotKey,
    label,
    item,
    isReadOnly,
    onUpdate,
    style,
  }: {
    slotKey: string;
    label: string;
    item: any;
    isReadOnly?: boolean;
    onUpdate: (slotKey: string, field: string, value: any) => void;
    style: React.CSSProperties;
  }) => {
    // --- テキスト入力の高速化 (State Mirroringパターン) ---
    // Propsの値を追跡するためのstate
    const [prevName, setPrevName] = useState(item.name || '');
    const [prevDamage, setPrevDamage] = useState(item.damage || '');
    const [prevNotes, setPrevNotes] = useState(item.notes || '');

    // 表示用のローカルstate
    const [localName, setLocalName] = useState(item.name || '');
    const [localDamage, setLocalDamage] = useState(item.damage || '');
    const [localNotes, setLocalNotes] = useState(item.notes || '');

    // レンダリング中にPropsの変更を検知して同期する (useEffectを使わない最適解)
    if ((item.name || '') !== prevName) {
      setPrevName(item.name || '');
      setLocalName(item.name || '');
    }
    if ((item.damage || '') !== prevDamage) {
      setPrevDamage(item.damage || '');
      setLocalDamage(item.damage || '');
    }
    if ((item.notes || '') !== prevNotes) {
      setPrevNotes(item.notes || '');
      setLocalNotes(item.notes || '');
    }

    // ハンドラー: フォーカスが外れた時のみ更新
    const handleNameBlur = () => {
      if (localName !== (item.name || '')) onUpdate(slotKey, 'name', localName);
    };
    const handleDamageBlur = () => {
      if (localDamage !== (item.damage || '')) onUpdate(slotKey, 'damage', localDamage);
    };
    const handleNotesBlur = () => {
      if (localNotes !== (item.notes || '')) onUpdate(slotKey, 'notes', localNotes);
    };

    // --- 数値・選択肢のハンドラ (固定化) ---
    const updateNum = useCallback(
      (field: string, val: number) => {
        onUpdate(slotKey, field, val);
      },
      [slotKey, onUpdate]
    );

    const updateField = useCallback(
      (field: string, val: any) => {
        onUpdate(slotKey, field, val);
      },
      [slotKey, onUpdate]
    );

    return (
      <div className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`} style={style}>
        <div className={tableStyles.labelCell}>{label}</div>

        {/* 名称 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.name || ''
          ) : (
            <input
              className={formStyles.input}
              inputMode='text'
              onBlur={handleNameBlur}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder={`${label}なし`}
              type='text'
              value={localName}
            />
          )}
        </div>

        {/* 重量 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.weight
          ) : (
            <div className={formStyles.stepperSmall}>
              <button
                onClick={() => updateNum('weight', (Number(item.weight) || 0) - 1)}
                type='button'
              >
                -{' '}
              </button>
              <NumberInput onChange={(v) => updateNum('weight', v)} value={item.weight} />
              <button
                onClick={() => updateNum('weight', (Number(item.weight) || 0) + 1)}
                type='button'
              >
                +{' '}
              </button>
            </div>
          )}
        </div>

        {/* 命中 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.hitMod
          ) : (
            <div className={formStyles.stepperSmall}>
              <button
                onClick={() => updateNum('hitMod', (Number(item.hitMod) || 0) - 1)}
                type='button'
              >
                -
              </button>
              <NumberInput onChange={(v) => updateNum('hitMod', v)} value={item.hitMod} />
              <button
                onClick={() => updateNum('hitMod', (Number(item.hitMod) || 0) + 1)}
                type='button'
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* ダメージ (テキスト入力扱い) */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.damage
          ) : (
            <input
              className={formStyles.input}
              onBlur={handleDamageBlur}
              onChange={(e) => setLocalDamage(e.target.value)}
              type='text'
              value={localDamage}
            />
          )}
        </div>

        {/* 射程 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.range || ''
          ) : (
            <select
              className={formStyles.select}
              onChange={(e) => updateField('range', e.target.value)}
              value={item.range}
            >
              <option value=''>ー</option>
              <option value='至近'>至近</option>
              <option value='近'>近</option>
              <option value='中'>中</option>
            </select>
          )}
        </div>

        {/* 回避 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.dodgeMod
          ) : (
            <div className={formStyles.stepperSmall}>
              <button
                onClick={() => updateNum('dodgeMod', (Number(item.dodgeMod) || 0) - 1)}
                type='button'
              >
                -{' '}
              </button>
              <NumberInput onChange={(v) => updateNum('dodgeMod', v)} value={item.dodgeMod} />
              <button
                onClick={() => updateNum('dodgeMod', (Number(item.dodgeMod) || 0) + 1)}
                type='button'
              >
                +{' '}
              </button>
            </div>
          )}
        </div>

        {/* 防御 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.defenseMod
          ) : (
            <div className={formStyles.stepperSmall}>
              <button
                onClick={() => updateNum('defenseMod', (Number(item.defenseMod) || 0) - 1)}
                type='button'
              >
                -{' '}
              </button>
              <NumberInput onChange={(v) => updateNum('defenseMod', v)} value={item.defenseMod} />
              <button
                onClick={() => updateNum('defenseMod', (Number(item.defenseMod) || 0) + 1)}
                type='button'
              >
                +{' '}
              </button>
            </div>
          )}
        </div>

        {/* 備考 (テキストエリア) */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.notes || ''
          ) : (
            <textarea
              className={formStyles.textareaTable}
              inputMode='text'
              onBlur={handleNotesBlur}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder='備考'
              value={localNotes}
            />
          )}
        </div>
      </div>
    );
  }
);
EquipmentRow.displayName = 'EquipmentRow';

export const EquipmentSection: React.FC<EquipmentSectionProps> = memo(
  ({ equipment, items, abilities, species, handleEquipmentUpdate, isReadOnly }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    const totals = useMemo(() => {
      const initialEquip = {
        weight: 0,
        hitMod: 0,
        dodgeMod: 0,
        defenseMod: 0,
        magicDefense: 0,
      };

      const equipStats = Object.values(equipment || {}).reduce(
        (acc, item) => ({
          weight: acc.weight + (Number(item.weight) || 0),
          hitMod: acc.hitMod + (Number(item.hitMod) || 0),
          dodgeMod: acc.dodgeMod + (Number(item.dodgeMod) || 0),
          defenseMod: acc.defenseMod + (Number(item.defenseMod) || 0),
          magicDefense: acc.magicDefense + (Number(item.magicDefense) || 0),
        }),
        initialEquip
      );

      const itemsWeight =
        items?.reduce((acc, item) => {
          return acc + (Number(item.weight) || 0) * (Number(item.quantity) || 0);
        }, 0) || 0;

      const totalWeight = equipStats.weight + itemsWeight;

      const speciesBase = SPECIES_DATA[species as SpeciesKey]?.abilities.physical || 0;
      const bonus = abilities.physical.bonus || 0;
      const weightLimit = speciesBase + bonus;

      return {
        ...equipStats,
        totalWeight,
        weightLimit,
        isOver: totalWeight > weightLimit,
      };
    }, [equipment, items, species, abilities.physical]);

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>装備品</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <WeightSection
              abilities={abilities}
              equipment={equipment}
              items={items}
              species={species}
            />
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable}`}
              style={{ minWidth: equipGridStyle.minWidth }}
            >
              {/* ヘッダー行 */}
              <EquipmentHeader />

              {/* 各装備行 (EquipmentRowを使用) */}
              {SLOTS.map(({ key, label }) => (
                <EquipmentRow
                  isReadOnly={isReadOnly}
                  item={equipment[key]}
                  key={key}
                  label={label}
                  onUpdate={handleEquipmentUpdate}
                  slotKey={key}
                  style={equipGridStyle}
                />
              ))}

              {/* 合計行 */}
              <div
                className={tableStyles.row}
                style={{
                  ...equipGridStyle,
                  backgroundColor: 'var(--accent-dark)',
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                <div className={tableStyles.labelCell} style={{ color: '#fff' }}>
                  合計
                </div>
                <div className={tableStyles.cell}></div>
                <div className={tableStyles.cell}>{totals.weight}</div>
                <div className={tableStyles.cell}>{totals.hitMod}</div>
                <div className={tableStyles.cell}></div>
                <div className={tableStyles.cell}></div>
                <div className={tableStyles.cell}>{totals.dodgeMod}</div>
                <div className={tableStyles.cell}>{totals.defenseMod}</div>
                <div className={tableStyles.cell}></div>
              </div>
              {/* ヘッダー行 (フッター) */}
              <EquipmentHeader isFooter={true} />
            </div>
          </div>
        </div>
      </section>
    );
  }
);

EquipmentSection.displayName = 'EquipmentSection';
export default EquipmentSection;
