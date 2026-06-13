import { useMemo } from 'react';

import { TriangleAlert } from 'lucide-react';

import { SPECIES_DATA, SpeciesKey } from '@/constants/preciousdays';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

interface WeightProps {
  items: Character['items'];
  equipment: Character['equipment'];
  species: string;
  abilities: Character['abilities'];
}

const WeightSection = ({ items, equipment, species, abilities }: WeightProps) => {
  const weightLimit = useMemo(() => {
    const speciesBase = SPECIES_DATA[species as SpeciesKey]?.abilities.physical || 0;
    const bonus = abilities.physical.bonus || 0;
    return speciesBase + bonus;
  }, [species, abilities.physical.bonus]);

  const totalWeight = useMemo(() => {
    const equipWeight = Object.values(equipment || {}).reduce(
      (acc, item) => acc + (item?.acquired !== false ? Number(item?.weight) || 0 : 0),
      0
    );
    const itemWeight =
      items?.reduce(
        (acc, item) => acc + (item.acquired !== false && !item.used ? Number(item.weight) || 0 : 0),
        0
      ) || 0;

    return equipWeight + itemWeight;
  }, [equipment, items]);

  const isOverWeight = totalWeight > weightLimit;
  return (
    <div
      className={`${tableStyles.gridTable} ${tableStyles.totalRow}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        margin: '1rem 0',
        borderColor: isOverWeight ? '#ff4d4f' : 'var(--card-border)',
        backgroundColor: isOverWeight ? '#5c1a1a' : undefined,
        boxShadow: isOverWeight ? '0 0 8px rgba(255, 77, 79, 0.4)' : undefined,
      }}
    >
      <div className={tableStyles.labelCell}>重量合計 ／ 限界</div>
      <div
        className={tableStyles.cell}
        style={{ justifyContent: 'flex-start', paddingLeft: '1.5rem', fontSize: '0.8rem' }}
      >
        {totalWeight} ／ {weightLimit}
        {isOverWeight && (
          <span style={{ marginLeft: '12px', fontWeight: 'normal', color: '#ff9999' }}>
            <TriangleAlert size={14} style={{ transform: 'translateY(3px)', marginRight: '4px' }} />
            重量制限オーバー
          </span>
        )}
      </div>
    </div>
  );
};

export default WeightSection;
