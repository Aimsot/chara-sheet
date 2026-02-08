import React from 'react';

import Link from 'next/link';

import btnStyles from '@/styles/components/buttons.module.scss';

interface ActionButtonProps {
  label: string;
  href?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  // ★追加: solid と primary をバリエーションに追加
  variant?:
    | 'outline'
    | 'magic'
    | 'solid'
    | 'primary'
    | 'ghost'
    | 'danger'
    | 'midnight'
    | 'glass'
    | 'rich'
    | 'disabled';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  submit?: boolean;
  disabled?: boolean;
  form?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  href,
  onClick,
  variant = 'outline',
  icon,
  className = '',
  style,
  submit = false,
  disabled = false,
  form,
}) => {
  // バリエーションごとのスタイル決定
  let baseClass = btnStyles.outline; // デフォルト
  if (variant === 'magic') baseClass = `${btnStyles.magicOutline} ${btnStyles.animateIcon}`;
  if (variant === 'rich') baseClass = btnStyles.rich;
  if (variant === 'solid') baseClass = btnStyles.solid;
  if (variant === 'primary') baseClass = btnStyles.primary;
  if (variant === 'ghost') baseClass = btnStyles.ghost;
  if (variant === 'danger') baseClass = btnStyles.danger;
  if (variant === 'midnight') baseClass = btnStyles.midnight;
  if (variant === 'glass') baseClass = btnStyles.glass;
  if (variant === 'disabled') baseClass = btnStyles.disabledStatus;

  const combinedClass = `${baseClass} ${className}`;

  const content = (
    <>
      {icon && <span className={btnStyles.icon}>{icon}</span>}
      <span>{label}</span>
    </>
  );

  // Linkの場合
  if (href && !disabled) {
    return (
      <Link
        className={combinedClass}
        href={href}
        style={{ justifyContent: 'center', textDecoration: 'none', ...style }}
      >
        {content}
      </Link>
    );
  }

  // Buttonの場合
  return (
    <button
      className={combinedClass}
      disabled={disabled}
      form={form}
      onClick={onClick}
      style={style}
      type={submit ? 'submit' : 'button'}
    >
      {content}
    </button>
  );
};
