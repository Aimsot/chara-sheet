import React, { memo, useCallback, useMemo, useState } from 'react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { ComboBox } from '@/components/ui/ComboBox';
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
  autoResize?: boolean;
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

const equipGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '80px minmax(0, 200px) 110px 110px 70px 100px 110px 110px 1fr',
  columnGap: '12px',
  minWidth: '1000px',
};

const EquipmentHeader = () => (
  <div className={tableStyles.headerRow} style={equipGridStyle}>
    <div className={tableStyles.labelCell}>部位</div>
    <div className={tableStyles.cell}>名称</div>
    <div className={tableStyles.cell}>重量</div>
    <div className={tableStyles.cell}>命中修正</div>
    <div className={tableStyles.cell}>ダメージ</div>
    <div className={tableStyles.cell}>射程</div>
    <div className={tableStyles.cell}>回避値</div>
    <div className={tableStyles.cell}>防御値</div>
    <div></div>
  </div>
);

// 7列（部位を除く）のメインコンテンツグリッド
const equipInnerGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 200px) 110px 110px 70px 100px 110px 110px 1fr',
  columnGap: '12px',
  alignItems: 'center',
  minHeight: '36px',
  padding: '4px 0',
};

const EquipmentRow = memo(
  ({
    slotKey,
    label,
    item,
    isReadOnly,
    autoResize,
    onUpdate,
  }: {
    slotKey: string;
    label: string;
    item: any;
    isReadOnly?: boolean;
    autoResize?: boolean;
    onUpdate: (slotKey: string, field: string, value: any) => void;
  }) => {
    const [prevName, setPrevName] = useState(item.name || '');
    const [prevDamage, setPrevDamage] = useState(item.damage || '');
    const [prevNotes, setPrevNotes] = useState(item.notes || '');
    const [prevPage, setPrevPage] = useState(item.page || '');
    const [localName, setLocalName] = useState(item.name || '');
    const [localDamage, setLocalDamage] = useState(item.damage || '');
    const [localNotes, setLocalNotes] = useState(item.notes || '');
    const [localPage, setLocalPage] = useState(item.page || '');

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
    if ((item.page || '') !== prevPage) {
      setPrevPage(item.page || '');
      setLocalPage(item.page || '');
    }

    const updateNum = useCallback(
      (field: string, val: number) => onUpdate(slotKey, field, val),
      [slotKey, onUpdate]
    );
    const updateField = useCallback(
      (field: string, val: any) => onUpdate(slotKey, field, val),
      [slotKey, onUpdate]
    );

    const showNotesRow = !isReadOnly || !!item.notes;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
          columnGap: '12px',
          borderBottom: '1px solid var(--card-border)',
          minWidth: equipGridStyle.minWidth,
        }}
      >
        {/* 部位: 備考行がある場合は2行にまたがる */}
        <div
          className={tableStyles.labelCell}
          style={{
            gridColumn: '1',
            gridRow: showNotesRow ? '1 / 3' : '1',
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid var(--card-border)',
          }}
        >
          {label}
        </div>

        {/* メイン行（7列） */}
        <div style={{ gridColumn: '2', gridRow: '1', ...equipInnerGridStyle }}>
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.name || ''
            ) : (
              <input
                className={formStyles.input}
                inputMode='text'
                onChange={(e) => {
                  setLocalName(e.target.value);
                  onUpdate(slotKey, 'name', e.target.value);
                }}
                placeholder={`${label}なし`}
                type='text'
                value={localName}
              />
            )}
          </div>
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.weight
            ) : (
              <div className={formStyles.stepperSmall}>
                <button
                  onClick={() => updateNum('weight', (Number(item.weight) || 0) - 1)}
                  type='button'
                >
                  -
                </button>
                <NumberInput onChange={(v) => updateNum('weight', v)} value={item.weight} />
                <button
                  onClick={() => updateNum('weight', (Number(item.weight) || 0) + 1)}
                  type='button'
                >
                  +
                </button>
              </div>
            )}
          </div>
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
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.damage
            ) : (
              <input
                className={formStyles.input}
                onChange={(e) => {
                  setLocalDamage(e.target.value);
                  onUpdate(slotKey, 'damage', e.target.value);
                }}
                type='text'
                value={localDamage}
              />
            )}
          </div>
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.range || ''
            ) : (
              <ComboBox
                className={formStyles.input}
                defaultValue={item.range ?? ''}
                onCommit={(val) => updateField('range', val)}
                options={['―', '至近', '近', '中', '遠']}
                placeholder='射程'
              />
            )}
          </div>
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.dodgeMod
            ) : (
              <div className={formStyles.stepperSmall}>
                <button
                  onClick={() => updateNum('dodgeMod', (Number(item.dodgeMod) || 0) - 1)}
                  type='button'
                >
                  -
                </button>
                <NumberInput onChange={(v) => updateNum('dodgeMod', v)} value={item.dodgeMod} />
                <button
                  onClick={() => updateNum('dodgeMod', (Number(item.dodgeMod) || 0) + 1)}
                  type='button'
                >
                  +
                </button>
              </div>
            )}
          </div>
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              item.defenseMod
            ) : (
              <div className={formStyles.stepperSmall}>
                <button
                  onClick={() => updateNum('defenseMod', (Number(item.defenseMod) || 0) - 1)}
                  type='button'
                >
                  -
                </button>
                <NumberInput onChange={(v) => updateNum('defenseMod', v)} value={item.defenseMod} />
                <button
                  onClick={() => updateNum('defenseMod', (Number(item.defenseMod) || 0) + 1)}
                  type='button'
                >
                  +
                </button>
              </div>
            )}
          </div>
          <div></div>
        </div>

        {/* 備考+ページ 2行目（編集時は常時、閲覧時は内容あるときのみ） */}
        {showNotesRow && (
          <div
            style={{
              gridColumn: '2',
              gridRow: '2',
              display: 'grid',
              gridTemplateColumns: '1fr 120px',
              columnGap: '12px',
              padding: '3px 2px 5px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* 備考 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                  paddingTop: '6px',
                  flexShrink: 0,
                }}
              >
                備考
              </span>
              {isReadOnly ? (
                <div
                  style={{
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                    color: '#fff',
                    padding: '2px 0',
                  }}
                >
                  {item.notes}
                </div>
              ) : (
                <AutoResizeTextarea
                  autoResize={autoResize}
                  className={formStyles.textareaTable}
                  inputMode='text'
                  onChange={(e) => {
                    setLocalNotes(e.target.value);
                    onUpdate(slotKey, 'notes', e.target.value);
                  }}
                  placeholder='備考'
                  rows={1}
                  style={{ flex: 1 }}
                  value={localNotes}
                />
              )}
            </div>
            {/* ページ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                  paddingTop: '6px',
                  flexShrink: 0,
                }}
              >
                ページ
              </span>
              {isReadOnly ? (
                <span style={{ fontSize: '0.75rem' }}>{item.page || ''}</span>
              ) : (
                <input
                  className={formStyles.input}
                  inputMode='text'
                  onChange={(e) => {
                    setLocalPage(e.target.value);
                    onUpdate(slotKey, 'page', e.target.value);
                  }}
                  placeholder='p.'
                  style={{ flex: 1, paddingRight: '8px' }}
                  type='text'
                  value={localPage}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
EquipmentRow.displayName = 'EquipmentRow';

export const EquipmentSection: React.FC<EquipmentSectionProps> = memo(
  ({ equipment, items, abilities, species, handleEquipmentUpdate, isReadOnly, autoResize }) => {
    const [isOpen, setIsOpen] = useState(true);

    const totals = useMemo(() => {
      const init = { weight: 0, hitMod: 0, dodgeMod: 0, defenseMod: 0, magicDefense: 0 };
      const equipStats = Object.values(equipment || {}).reduce(
        (acc, item) => ({
          weight: acc.weight + (Number(item.weight) || 0),
          hitMod: acc.hitMod + (Number(item.hitMod) || 0),
          dodgeMod: acc.dodgeMod + (Number(item.dodgeMod) || 0),
          defenseMod: acc.defenseMod + (Number(item.defenseMod) || 0),
          magicDefense: acc.magicDefense + (Number(item.magicDefense) || 0),
        }),
        init
      );
      const itemsWeight =
        items?.reduce(
          (acc, item) => acc + (Number(item.weight) || 0) * (Number(item.quantity) || 0),
          0
        ) || 0;
      const totalWeight = equipStats.weight + itemsWeight;
      const speciesBase = SPECIES_DATA[species as SpeciesKey]?.abilities.physical || 0;
      const bonus = abilities.physical.bonus || 0;
      const weightLimit = speciesBase + bonus;
      return { ...equipStats, totalWeight, weightLimit, isOver: totalWeight > weightLimit };
    }, [equipment, items, species, abilities.physical]);

    return (
      <section className={cardStyles.base}>
        <div
          className={cardStyles.accordionHeader}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
          style={isReadOnly ? { cursor: 'default' } : undefined}
        >
          <h2 className={cardStyles.title}>装備品</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
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
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
              style={{ minWidth: equipGridStyle.minWidth }}
            >
              <EquipmentHeader />

              {SLOTS.map(({ key, label }) => (
                <EquipmentRow
                  autoResize={autoResize}
                  isReadOnly={isReadOnly}
                  item={equipment[key]}
                  key={key}
                  label={label}
                  onUpdate={handleEquipmentUpdate}
                  slotKey={key}
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
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

EquipmentSection.displayName = 'EquipmentSection';
export default EquipmentSection;
