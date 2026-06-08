'use client';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ComboBoxProps {
  options: string[];
  defaultValue?: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 自由入力 ＋ 選択肢ドロップダウンを兼ねるコンボボックス。
 * Portal でレンダリングするため overflow:hidden な親要素を貫通する。
 */
export const ComboBox: React.FC<ComboBoxProps> = memo(
  ({ options, defaultValue = '', onCommit, placeholder, className, style }) => {
    const [value, setValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const onCommitRef = useRef(onCommit);
    useEffect(() => {
      onCommitRef.current = onCommit;
    });

    const filtered = value.trim() ? options.filter((o) => o.includes(value)) : options;

    const updateRect = useCallback(() => {
      if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
    }, []);

    const handleFocus = () => {
      updateRect();
      setIsOpen(true);
      setActiveIndex(-1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      updateRect();
      setIsOpen(true);
      setActiveIndex(-1);
    };

    const handleBlur = () => {
      // mousedown でオプション選択が先に発火するよう少し遅らせる
      setTimeout(() => {
        setIsOpen(false);
        setActiveIndex(-1);
        onCommitRef.current(value);
      }, 120);
    };

    const handleSelect = (opt: string) => {
      setValue(opt);
      setIsOpen(false);
      setActiveIndex(-1);
      onCommitRef.current(opt);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filtered.length === 0) {
        if (e.key === 'ArrowDown') {
          updateRect();
          setIsOpen(true);
          setActiveIndex(0);
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          handleSelect(filtered[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    // スクロール時はドロップダウンを閉じる（位置ずれ防止）
    useEffect(() => {
      if (!isOpen) return;
      const close = () => setIsOpen(false);
      window.addEventListener('scroll', close, { passive: true, capture: true });
      return () => window.removeEventListener('scroll', close, { capture: true });
    }, [isOpen]);

    const dropdown =
      isOpen && filtered.length > 0 && rect
        ? createPortal(
            <div
              style={{
                position: 'fixed',
                top: rect.bottom + 2,
                left: rect.left,
                minWidth: Math.max(rect.width, 100),
                zIndex: 9999,
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '4px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            >
              {filtered.map((opt, idx) => (
                <div
                  key={opt}
                  onMouseDown={(e) => {
                    e.preventDefault(); // blur の前に値を確定させる
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: '#eee',
                    userSelect: 'none',
                    backgroundColor: idx === activeIndex ? 'rgba(255,255,255,0.18)' : 'transparent',
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>,
            document.body
          )
        : null;

    return (
      <>
        <input
          className={className}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          style={{ width: '100%', ...style }}
          type='text'
          value={value}
        />
        {dropdown}
      </>
    );
  }
);
ComboBox.displayName = 'ComboBox';
export default ComboBox;
