export const GROWTH_MILESTONES = [
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

export interface GrowthCapacity {
  skills: { min: number; max: number };
  items: { min: number; max: number };
  consumables: { count: number };
}

export function calcGrowthCapacity(experience: number, gl: number): GrowthCapacity {
  const glLevel = gl || 0;
  const completedCycles = Math.max(0, glLevel - 1);
  const currentCycleExp = Math.max(0, experience - completedCycles * 10000);
  const reached = GROWTH_MILESTONES.filter((m) => currentCycleExp >= m.exp);

  const skillsFromMilestones = 3 * completedCycles + reached.reduce((a, m) => a + m.skills, 0);
  const itemsFromMilestones = 1 * completedCycles + reached.reduce((a, m) => a + m.items, 0);
  const consumablesFromMilestones =
    2 * completedCycles + reached.reduce((a, m) => a + m.consumables, 0);

  return {
    skills: { min: 4 + skillsFromMilestones, max: 4 + skillsFromMilestones + glLevel },
    items: { min: 1 + itemsFromMilestones, max: 1 + itemsFromMilestones + glLevel },
    consumables: { count: 1 + consumablesFromMilestones },
  };
}

export function formatCapacity(min: number, max: number): string {
  return min === max ? String(min) : `${min}〜${max}`;
}
