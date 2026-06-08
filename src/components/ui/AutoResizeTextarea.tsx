'use client';
import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  autoResize,
  value,
  style,
  ...props
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (autoResize) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    } else {
      el.style.height = '';
    }
  }, [value, autoResize]);

  return (
    <textarea
      ref={ref}
      style={{ resize: autoResize ? 'none' : undefined, ...style }}
      value={value}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
