'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PRESET_COLORS = [
  '#e53935',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
  '#f48fb1',
  '#ce93d8',
  '#90caf9',
  '#80cbc4',
  '#ffffff',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [hexInput, setHexInput] = useState(value.replace(/^#/, ''));
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // value が外部から変わったとき hexInput を同期（state mirroring）
  if (value !== prevValue) {
    setPrevValue(value);
    setHexInput(value.replace(/^#/, ''));
  }

  const open = useCallback(() => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const handleSwatchClick = (color: string) => {
    setHexInput(color.replace(/^#/, ''));
    onChange(color);
    close();
  };

  const handleHexChange = (raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHexInput(clean);
    if (clean.length === 6) onChange('#' + clean);
  };

  // ポップアップ外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen, close]);

  const normalizedValue = value.toLowerCase();
  const displayColor = value.length === 7 ? value : '#888888';

  const popup =
    isOpen && rect
      ? createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: rect.bottom + 6,
              left: rect.left,
              width: Math.max(rect.width, 200),
              zIndex: 9999,
              backgroundColor: '#1e1e1e',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              padding: '10px',
            }}
          >
            {/* カラーグリッド */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '5px',
                marginBottom: '10px',
              }}
            >
              {PRESET_COLORS.map((color) => {
                const selected = normalizedValue === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => handleSwatchClick(color)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    }}
                    style={{
                      aspectRatio: '1',
                      backgroundColor: color,
                      border: selected ? '2px solid #fff' : '2px solid transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: selected
                        ? '0 0 0 1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.3)'
                        : '0 0 0 1px rgba(0,0,0,0.35)',
                      transition: 'transform 0.1s',
                    }}
                    title={color}
                    type='button'
                  />
                );
              })}
            </div>

            {/* Hex 入力 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'var(--input-bg)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '32px',
                  backgroundColor: displayColor,
                  flexShrink: 0,
                  borderRight: '1px solid var(--border-color)',
                }}
              />
              <span
                style={{
                  padding: '0 4px 0 8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  userSelect: 'none',
                }}
              >
                #
              </span>
              <input
                maxLength={6}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder='888888'
                style={{
                  flex: 1,
                  height: '32px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  paddingRight: '8px',
                }}
                type='text'
                value={hexInput}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={isOpen ? close : open}
        ref={triggerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '5px 8px',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--input-bg)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        type='button'
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '3px',
            backgroundColor: displayColor,
            flexShrink: 0,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
          }}
        />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            flex: 1,
          }}
        >
          {value || '#888888'}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      {popup}
    </>
  );
};

export default ColorPicker;
