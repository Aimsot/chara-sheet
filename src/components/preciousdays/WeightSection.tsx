import { useMemo } from 'react';

import { TriangleAlert } from 'lucide-react';

import { SPECIES_DATA, SpeciesKey } from '@/constants/preciousdays';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

const WeightSection = ({ char }: { char: Character }) => {
  const weightLimit = useMemo(() => {
    const speciesBase = SPECIES_DATA[char.species as SpeciesKey]?.abilities.physical || 0;
    const bonus = char.abilities.physical.bonus || 0;
    return speciesBase + bonus;
  }, [char.species, char.abilities.physical.bonus]);

  const totalWeight = useMemo(() => {
    const equipWeight = Object.values(char.equipment || {}).reduce(
      (acc, item) => acc + (Number(item?.weight) || 0),
      0
    );
    const itemWeight =
      char.items?.reduce(
        (acc, item) => acc + (Number(item.weight) || 0) * (Number(item.quantity) || 0),
        0
      ) || 0;

    return equipWeight + itemWeight;
  }, [char.equipment, char.items]);

  const isOverWeight = totalWeight > weightLimit;
  return (
    <div
      className={tableStyles.gridTable}
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        marginBottom: '1rem',
        borderColor: isOverWeight ? '#ff4d4f' : 'var(--card-border)',
      }}
    >
      <div className={`${tableStyles.headerRow} ${tableStyles.labelCell}`}>総重量 / 限界</div>

      {/* 数値部分：cell を使って中央揃えを維持 */}
      <div
        className={tableStyles.cell}
        style={{
          justifyContent: 'flex-start',
          paddingLeft: '1.5rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
        }}
      >
        {totalWeight} / {weightLimit}
        {isOverWeight && (
          <span
            style={{
              fontSize: '0.8rem',
              marginLeft: '12px',
              fontWeight: 'normal',
              color: isOverWeight ? '#ff4d4f' : 'inherit',
            }}
          >
            <TriangleAlert size={16} style={{ transform: 'translateY(3px)' }} /> 重量制限オーバー
          </span>
        )}
      </div>
    </div>
  );
};

export default WeightSection;
