'use client';

import React, { useState } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  // ローカルステート
  const [localValue, setLocalValue] = useState<string>(Number.isNaN(value) ? '' : value.toString());

  const [prevValue, setPrevValue] = useState<number>(value);

  if (value !== prevValue) {
    setPrevValue(value);
    if (!Number.isNaN(value)) {
      setLocalValue(value.toString());
    } else {
      setLocalValue('');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 数字、マイナス記号、空文字以外は入力を受け付けないバリデーション（任意）
    if (!/^-?\d*$/.test(raw)) return;

    setLocalValue(raw);

    if (raw === '' || raw === '-') {
      onChange(NaN);
    } else {
      const num = parseInt(raw, 10);
      onChange(Number.isNaN(num) ? NaN : num);
    }
  };

  const handleBlur = () => {
    // フォーカスが外れた際、空文字や "-" のままなら 0 に戻すなどの補正（任意）
    if (localValue === '' || localValue === '-') {
      setLocalValue('0');
      onChange(0);
    }
  };

  return (
    <input
      autoComplete='off'
      className={className}
      inputMode='numeric'
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
      pattern='-?[0-9]*'
      placeholder={placeholder}
      type='text'
      value={localValue}
    />
  );
};
