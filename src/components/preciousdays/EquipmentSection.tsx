import React, { memo, useCallback, useMemo, useState } from 'react';

import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { ComboBox } from '@/components/ui/ComboBox';
import { NumberInput } from '@/components/ui/NumberInput';
import { SPECIES_DATA, SpeciesKey } from '@/constants/preciousdays';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

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

const EquipmentHeader = () => (
  <div className={`${tableStyles.headerRow} ${tableStyles.equipHeaderGrid}`}>
    <div className={tableStyles.labelBlock}>
      <div className={tableStyles.labelCell}>取得</div>
      <div className={tableStyles.labelCell}>部位</div>
    </div>
    <div className={tableStyles.cell}>名称</div>
    <div className={tableStyles.cell}>GL</div>
    <div className={tableStyles.cell}>重量</div>
    <div className={tableStyles.cell}>命中修正</div>
    <div className={tableStyles.cell}>ダメージ</div>
    <div className={tableStyles.cell}>射程</div>
    <div className={tableStyles.cell}>回避値</div>
    <div className={tableStyles.cell}>防御値</div>
    <div></div>
  </div>
);

const EquipmentRow = memo(
  ({
    slotKey,
    label,
    item,
    isReadOnly,
    autoResize,
    showAll,
    onUpdate,
  }: {
    slotKey: string;
    label: string;
    item: any;
    isReadOnly?: boolean;
    autoResize?: boolean;
    showAll?: boolean;
    onUpdate: (slotKey: string, field: string, value: any) => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [local, setLocal] = useState({
      name: item.name || '',
      notes: item.notes || '',
      page: item.page || '',
    });
    const [prevItem, setPrevItem] = useState(item);

    if (prevItem !== item) {
      const next = { ...local };
      let hasChange = false;
      if ((item.name || '') !== (prevItem.name || '')) {
        next.name = item.name || '';
        hasChange = true;
      }
      if ((item.notes || '') !== (prevItem.notes || '')) {
        next.notes = item.notes || '';
        hasChange = true;
      }
      if ((item.page || '') !== (prevItem.page || '')) {
        next.page = item.page || '';
        hasChange = true;
      }
      setPrevItem(item);
      if (hasChange) setLocal(next);
    }

    const updateNum = useCallback(
      (field: string, val: number) => onUpdate(slotKey, field, val),
      [slotKey, onUpdate]
    );
    const updateField = useCallback(
      (field: string, val: any) => onUpdate(slotKey, field, val),
      [slotKey, onUpdate]
    );

    const isArmor = ['head', 'body', 'accessory'].includes(slotKey);
    const isGuardian = slotKey === 'guardian';
    const showNotesRow = !isReadOnly || !!item.notes;
    const showSubRow = showNotesRow && (!isReadOnly || isHovered || (showAll ?? false));

    return (
      <div
        className={`${tableStyles.row} ${tableStyles.equipDataRowGrid}${item.acquired === false ? ` ${tableStyles.unacquired}` : ''}`}
        onMouseEnter={isReadOnly ? () => setIsHovered(true) : undefined}
        onMouseLeave={isReadOnly ? () => setIsHovered(false) : undefined}
      >
        {/* 取得チェック + 部位ラベル（flex で隣接、gap なし） */}
        <div className={tableStyles.labelBlock}>
          <div className={tableStyles.labelCell}>
            {isReadOnly ? (
              <input
                checked={item.acquired !== false}
                className={tableStyles.acquireCheck}
                disabled
                readOnly
                type='checkbox'
              />
            ) : (
              <input
                checked={item.acquired !== false}
                className={tableStyles.acquireCheck}
                onChange={(e) => onUpdate(slotKey, 'acquired', e.target.checked)}
                type='checkbox'
              />
            )}
          </div>
          <div className={tableStyles.labelCell}>{label}</div>
        </div>

        {/* コンテンツ列: メイン行 + サブ行を縦に積む */}
        <div className={tableStyles.flexColumn}>
          {/* メイン行（7列） */}
          <div className={tableStyles.equipInnerGrid}>
            <div className={tableStyles.cell} style={isReadOnly ? { gap: '6px' } : undefined}>
              {isReadOnly ? (
                <>
                  <span>{item.name || ''}</span>
                  {item.page && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: 'rgba(160,160,160,0.45)',
                        flexShrink: 0,
                      }}
                    >
                      {/^\d+$/.test(item.page) ? `p.${item.page}` : item.page}
                    </span>
                  )}
                </>
              ) : (
                <input
                  className={formStyles.input}
                  inputMode='text'
                  onChange={(e) => {
                    setLocal((l) => ({ ...l, name: e.target.value }));
                    onUpdate(slotKey, 'name', e.target.value);
                  }}
                  placeholder={`${label}なし`}
                  type='text'
                  value={local.name}
                />
              )}
            </div>
            {/* GL */}
            <div className={tableStyles.cell}>
              {isReadOnly ? (
                (item.gl ?? 0)
              ) : (
                <div className={formStyles.stepperSmall}>
                  <button
                    onClick={() => updateNum('gl', Math.max(0, (Number(item.gl) || 0) - 1))}
                    type='button'
                  >
                    -
                  </button>
                  <NumberInput
                    onChange={(v) => updateNum('gl', Math.max(0, Math.min(6, v)))}
                    value={item.gl ?? 0}
                  />
                  <button
                    onClick={() => updateNum('gl', Math.min(6, (Number(item.gl) || 0) + 1))}
                    type='button'
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            {/* 重量 */}
            <div className={tableStyles.cell}>
              {isGuardian ? null : isReadOnly ? (
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
            {/* 命中修正 */}
            <div className={tableStyles.cell}>
              {isArmor || isGuardian ? null : isReadOnly ? (
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
            {/* ダメージ */}
            <div className={tableStyles.cell}>
              {isGuardian ? null : isReadOnly ? (
                item.damage
              ) : (
                <div className={formStyles.stepperSmall}>
                  <button
                    onClick={() => updateNum('damage', (Number(item.damage) || 0) - 1)}
                    type='button'
                  >
                    -
                  </button>
                  <NumberInput onChange={(v) => updateNum('damage', v)} value={item.damage} />
                  <button
                    onClick={() => updateNum('damage', (Number(item.damage) || 0) + 1)}
                    type='button'
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            {/* 射程 */}
            <div className={tableStyles.cell}>
              {isArmor || isGuardian ? null : isReadOnly ? (
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
            {/* 回避値 */}
            <div className={tableStyles.cell}>
              {isGuardian ? null : isReadOnly ? (
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
                  <NumberInput
                    onChange={(v) => updateNum('defenseMod', v)}
                    value={item.defenseMod}
                  />
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

          {/* 効果+ページ 2行目（編集時は常時、閲覧時はホバー or 全表示時のみ） */}
          {showSubRow && (
            <div className={tableStyles.equipSubRow}>
              {/* 効果 */}
              {isReadOnly ? (
                <div
                  className={tableStyles.textContent}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 12px',
                    maxHeight: autoResize ? undefined : '4.5em',
                    overflowY: autoResize ? undefined : 'auto',
                  }}
                >
                  {item.notes}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span className={tableStyles.fieldLabel}>効果</span>
                  <AutoResizeTextarea
                    autoResize={autoResize}
                    className={formStyles.textareaTable}
                    inputMode='text'
                    onChange={(e) => {
                      setLocal((l) => ({ ...l, notes: e.target.value }));
                      onUpdate(slotKey, 'notes', e.target.value);
                    }}
                    placeholder='効果'
                    rows={1}
                    style={{ flex: 1 }}
                    value={local.notes}
                  />
                </div>
              )}
              {/* ページ（編集時のみ） */}
              {!isReadOnly && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span className={tableStyles.fieldLabel}>ページ</span>
                  <input
                    className={formStyles.input}
                    inputMode='text'
                    onChange={(e) => {
                      setLocal((l) => ({ ...l, page: e.target.value }));
                      onUpdate(slotKey, 'page', e.target.value);
                    }}
                    placeholder='p.'
                    style={{ flex: 1, paddingRight: '8px' }}
                    type='text'
                    value={local.page}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
EquipmentRow.displayName = 'EquipmentRow';

export const EquipmentSection: React.FC<EquipmentSectionProps> = memo(
  ({ equipment, items, abilities, species, handleEquipmentUpdate, isReadOnly, autoResize }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const totals = useMemo(() => {
      const init = { weight: 0, hitMod: 0, dodgeMod: 0, defenseMod: 0, magicDefense: 0 };
      const equipStats = Object.values(equipment || {}).reduce((acc, item) => {
        const active = item?.acquired !== false;
        return {
          weight: acc.weight + (active ? Number(item.weight) || 0 : 0),
          hitMod: acc.hitMod + (active ? Number(item.hitMod) || 0 : 0),
          dodgeMod: acc.dodgeMod + (active ? Number(item.dodgeMod) || 0 : 0),
          defenseMod: acc.defenseMod + (active ? Number(item.defenseMod) || 0 : 0),
          magicDefense: acc.magicDefense + (active ? Number(item.magicDefense) || 0 : 0),
        };
      }, init);
      const itemsWeight =
        items?.reduce(
          (acc, item) =>
            acc +
            (item.acquired !== false
              ? (Number(item.weight) || 0) * (Number(item.quantity) || 0)
              : 0),
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
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>装備品</h2>
          {isReadOnly ? (
            <button
              className={btnStyles.expandToggle}
              onClick={() => setShowAll((v) => !v)}
              type='button'
            >
              {showAll ? '効果を折畳む' : '効果を全展開'}
              {showAll ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </button>
          ) : (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
              style={{ minWidth: '980px' }}
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
                  showAll={showAll}
                  slotKey={key}
                />
              ))}

              {/* 合計行 */}
              <div
                className={`${tableStyles.row} ${tableStyles.equipHeaderGrid} ${tableStyles.totalRow}`}
              >
                <div className={tableStyles.labelCell}>小計</div>
                <div className={tableStyles.cell}></div>
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
