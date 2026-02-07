'use client';

import React, { memo, useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = memo(
  ({ value, onChange, className, placeholder }) => {
    // ローカルの表示用ステート
    const [localValue, setLocalValue] = useState<string>(
      value === undefined || value === null || Number.isNaN(value) ? '0' : value.toString()
    );

    useEffect(() => {
      const numericLocal = parseInt(localValue, 10);
      const safeValue = Number.isNaN(value) ? 0 : value;

      if (safeValue !== (Number.isNaN(numericLocal) ? 0 : numericLocal)) {
        setLocalValue(safeValue.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      if (!/^-?\d*$/.test(raw)) return;

      setLocalValue(raw);

      const num = parseInt(raw, 10);

      if (Number.isNaN(num)) {
        onChange(0);
      } else {
        onChange(num);
      }
    };

    const handleBlur = () => {
      setLocalValue(value.toString());
    };

    return (
      <input
        autoComplete='off'
        className={className}
        inputMode='numeric'
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={placeholder}
        type='text'
        value={localValue}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
