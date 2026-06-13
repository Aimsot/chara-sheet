'use client';

import React, { memo, useMemo, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { TriangleAlert } from 'lucide-react';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Item } from '@/types/preciousdays/character';

interface GrowthTableSectionProps {
  experience?: number;
  gl: number;
  items: Item[];
  style: string;
}

const MILESTONES = [
  { exp: 1000, label: 'スキルをひとつ獲得', skills: 1, items: 0, consumables: 0, hpMp: false },
  { exp: 3000, label: 'HP・MP上昇', skills: 0, items: 0, consumables: 0, hpMp: true },
  {
    exp: 5000,
    label: 'アイテムと消耗品をひとつずつ獲得',
    skills: 0,
    items: 1,
    consumables: 1,
    hpMp: false,
  },
  {
    exp: 6000,
    label: 'スキルと消耗品をひとつずつ獲得',
    skills: 1,
    items: 0,
    consumables: 1,
    hpMp: false,
  },
  { exp: 8000, label: 'スキルをひとつ獲得', skills: 1, items: 0, consumables: 0, hpMp: false },
] as const;

const GrowthTableSection: React.FC<GrowthTableSectionProps> = memo(
  ({ experience = 0, gl, items, style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const glLevel = gl || 0;
    const styleData = STYLE_DATA[style as StyleKey];
    const requiredExp = Math.max(0, glLevel - 1) * 10000;
    const isExpInsufficient = glLevel >= 2 && experience < requiredExp;

    const {
      currentCycleExp,
      totalSkillsFromMilestones,
      totalItemsFromMilestones,
      totalConsumablesFromMilestones,
      hpMpMilestoneCount,
    } = useMemo(() => {
      // GL0→1 はファーストシナリオで無償のため、マイルストーンサイクル数 = max(0, gl-1)
      const completedCycles = Math.max(0, glLevel - 1);
      const currentCycleExp = Math.max(0, experience - completedCycles * 10000);
      const reachedInCycle = MILESTONES.filter((m) => currentCycleExp >= m.exp);

      return {
        currentCycleExp,
        totalSkillsFromMilestones:
          3 * completedCycles + reachedInCycle.reduce((a, m) => a + m.skills, 0),
        totalItemsFromMilestones:
          1 * completedCycles + reachedInCycle.reduce((a, m) => a + m.items, 0),
        totalConsumablesFromMilestones:
          2 * completedCycles + reachedInCycle.reduce((a, m) => a + m.consumables, 0),
        hpMpMilestoneCount: completedCycles + (currentCycleExp >= 3000 ? 1 : 0),
      };
    }, [experience, glLevel]);

    const currentConsumableCount = items.filter(
      (i) => i.category === '消耗品' && i.acquired !== false
    ).length;

    const hpGrowth = styleData?.hp.growth || 0;
    const mpGrowth = styleData?.mp.growth || 0;

    return (
      <section className={cardStyles.base} id='growth-table-section'>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen((v) => !v)}>
          <h2 className={cardStyles.title}>成長テーブル</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`} />
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          {/* 経験点表示 */}
          <div style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
            現サイクル:&nbsp;
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {currentCycleExp.toLocaleString()} pt
            </strong>
            {experience > 0 && (
              <span className={formStyles.dimNote}>（累計: {experience.toLocaleString()} pt）</span>
            )}
            {glLevel > 0 && <span className={formStyles.dimNote}>— GL{glLevel}サイクル目</span>}
            {isExpInsufficient && (
              <>
                <TriangleAlert
                  data-tooltip-id='exp-insufficient-tooltip'
                  size={14}
                  style={{
                    marginLeft: '8px',
                    color: '#ff4d4f',
                    verticalAlign: 'middle',
                    cursor: 'default',
                  }}
                />
                <Tooltip
                  content={`GL${glLevel}には累計${requiredExp.toLocaleString()}ptが必要です（現在: ${experience.toLocaleString()}pt）`}
                  id='exp-insufficient-tooltip'
                  place='bottom'
                  variant='error'
                />
              </>
            )}
          </div>

          {/* マイルストーンテーブル */}
          <div className={tableStyles.scrollContainer}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
            >
              <div className={`${tableStyles.headerRow} ${tableStyles.milestoneGrid}`}>
                <div className={tableStyles.labelCell}>経験点</div>
                <div className={tableStyles.cell}>内容</div>
                <div className={tableStyles.cell}>達成</div>
              </div>
              {MILESTONES.map((milestone) => {
                const reached = currentCycleExp >= milestone.exp;
                return (
                  <div
                    className={`${tableStyles.row} ${tableStyles.milestoneGrid}${reached ? ` ${tableStyles.totalRow}` : ''}`}
                    key={milestone.exp}
                    style={reached ? undefined : { color: 'var(--text-muted)' }}
                  >
                    <div className={tableStyles.labelCell}>{milestone.exp.toLocaleString()}</div>
                    <div className={`${tableStyles.cell} ${tableStyles.cellLeft}`}>
                      {milestone.label}
                    </div>
                    <div className={tableStyles.cell}>{reached ? '✓' : ''}</div>
                  </div>
                );
              })}
              <div
                className={`${tableStyles.row} ${tableStyles.milestoneGrid}${currentCycleExp >= 10000 ? ` ${tableStyles.totalRow}` : ''}`}
                style={currentCycleExp >= 10000 ? undefined : { color: 'var(--text-muted)' }}
              >
                <div className={tableStyles.labelCell}>10,000</div>
                <div className={`${tableStyles.cell} ${tableStyles.cellLeft}`}>グレードアップ</div>
                <div className={tableStyles.cell}>{currentCycleExp >= 10000 ? '✓' : ''}</div>
              </div>
            </div>
          </div>

          {/* サマリーテーブル */}
          <div className={tableStyles.scrollContainer} style={{ marginTop: '10px' }}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
            >
              <div className={`${tableStyles.headerRow} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>項目</div>
                <div className={tableStyles.cell}>ベース</div>
                <div className={tableStyles.cell}>経験点分</div>
                <div className={tableStyles.cell}>GUP選択 ×{glLevel}</div>
                <div className={tableStyles.cell}>現在数</div>
              </div>
              <div className={`${tableStyles.row} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>スキル</div>
                <div className={tableStyles.cell}>4</div>
                <div className={tableStyles.cell}>{totalSkillsFromMilestones}</div>
                <div className={tableStyles.cell}>0~{glLevel}</div>
                <div className={tableStyles.cell}>
                  {4 + totalSkillsFromMilestones}~{4 + totalSkillsFromMilestones + glLevel}
                </div>
              </div>
              <div className={`${tableStyles.row} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>アイテム</div>
                <div className={tableStyles.cell}>1</div>
                <div className={tableStyles.cell}>{totalItemsFromMilestones}</div>
                <div className={tableStyles.cell}>0~{glLevel}</div>
                <div className={tableStyles.cell}>
                  {1 + totalItemsFromMilestones}~{1 + totalItemsFromMilestones + glLevel}
                </div>
              </div>
              <div className={`${tableStyles.row} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>消耗品</div>
                <div className={tableStyles.cell}>1</div>
                <div className={tableStyles.cell}>{totalConsumablesFromMilestones}</div>
                <div className={tableStyles.cell}>—</div>
                <div className={tableStyles.cell}>{currentConsumableCount}</div>
              </div>
              <div className={`${tableStyles.row} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>HP</div>
                <div className={tableStyles.cell}>{styleData?.hp.base ?? 0}</div>
                <div className={tableStyles.cell}>
                  +{hpGrowth * hpMpMilestoneCount}
                  <span className={formStyles.calcNote}>
                    ({hpGrowth}×{hpMpMilestoneCount})
                  </span>
                </div>
                <div className={tableStyles.cell}>
                  +{hpGrowth * glLevel}
                  <span className={formStyles.calcNote}>
                    ({hpGrowth}×{glLevel})
                  </span>
                </div>
                <div className={`${tableStyles.cell} ${tableStyles.cellTextSmall}`}>HP欄で管理</div>
              </div>
              <div className={`${tableStyles.row} ${tableStyles.summaryGrid}`}>
                <div className={tableStyles.labelCell}>MP</div>
                <div className={tableStyles.cell}>{styleData?.mp.base ?? 0}</div>
                <div className={tableStyles.cell}>
                  +{mpGrowth * hpMpMilestoneCount}
                  <span className={formStyles.calcNote}>
                    ({mpGrowth}×{hpMpMilestoneCount})
                  </span>
                </div>
                <div className={tableStyles.cell}>
                  +{mpGrowth * glLevel}
                  <span className={formStyles.calcNote}>
                    ({mpGrowth}×{glLevel})
                  </span>
                </div>
                <div className={`${tableStyles.cell} ${tableStyles.cellTextSmall}`}>MP欄で管理</div>
              </div>
            </div>
          </div>
          <div className={formStyles.notes} style={{ marginTop: '6px', marginBottom: 0 }}>
            <p>GUP = グレードアップ</p>
          </div>
        </div>
      </section>
    );
  }
);

GrowthTableSection.displayName = 'GrowthTableSection';
export default GrowthTableSection;
