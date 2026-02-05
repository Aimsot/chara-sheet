import React, { useState } from 'react';

import { ArrowBigLeftDash, Ban, Copy, Eye, PenIcon, SaveAll, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import sidebarStyles from '@/styles/components/charaSheet/sidebar.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

import { ActionButton } from '../ui/ActionButton';

interface StatusSidebarProps {
  char: Character;
  charKey: string | null;
  isSubmitting?: boolean;
  className?: string;
  isReadOnly?: boolean;
  handleDelete?: () => Promise<void>;
}

export const SidebarSection: React.FC<StatusSidebarProps> = ({
  char,
  charKey,
  isSubmitting,
  className,
  isReadOnly,
  handleDelete,
}) => {
  const router = useRouter();
  const search = useSearchParams();
  const cloneKey = search.get('clone');
  const isSampleData = char?.id?.startsWith('sample');

  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  // --- 複製処理 ---
  const handleDuplicate = async (targetChar: Character) => {
    router.push(`/preciousdays/edit?clone=${targetChar.id}`);
  };

  // --- 認証処理 (閲覧モード用) ---
  const handleAuthSubmit = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    e?.preventDefault(); // リロード防止
    e?.stopPropagation(); // 親フォームへの伝播防止（重要）

    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/verify_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: char.id,
          password: authPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/preciousdays/edit?key=${char.id}`);
      } else {
        alert(data.message || 'パスワードが違います');
      }
    } catch (error) {
      console.error('Auth Submit Error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsAuthLoading(false);
    }
  };
  return (
    <aside className={`${layoutStyles.span4} ${className || ''}`}>
      <div className={sidebarStyles.container}>
        {/* PASSWORD エリア */}
        <div className={`${baseStyles.stack} ${formStyles.panel}`}>
          <div onSubmit={handleAuthSubmit}>
            <label className={formStyles.label}>編集用パスワード</label>
            <input
              autoComplete='current-password'
              className={formStyles.input}
              name='password'
              onChange={(e) => {
                const val = e.target.value;
                if (isReadOnly) {
                  setAuthPassword(val);
                } else {
                  setEditPassword(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthSubmit(e);
                }
              }}
              placeholder={
                isReadOnly
                  ? 'パスワードを入力' // 1. 閲覧時
                  : charKey
                  ? '変更する場合のみ入力 (空欄なら維持)' // 3. 編集時 (既存)
                  : '4〜12文字の半角英数' // 2. 新規作成時
              }
              type='password'
              value={isReadOnly ? authPassword : editPassword}
            />

            <div className={formStyles.notes} style={{ marginTop: 0 }}>
              <p>
                {isReadOnly
                  ? '編集するにはパスワードを入力して認証ボタンを押してください'
                  : '編集・削除時に必要になります'}
              </p>
            </div>

            {/* 認証ボタン (閲覧モード時のみフォーム内に表示) */}
            {isReadOnly && (
              <ActionButton
                disabled={isAuthLoading}
                icon={<PenIcon size={14} />}
                label={isAuthLoading ? '確認中...' : '認証して編集画面へ'}
                onClick={handleAuthSubmit}
                style={{ width: '100%', marginTop: '10px' }}
                variant='solid'
              />
            )}
          </div>
        </div>

        {/* アクションボタンエリア */}
        <div className={baseStyles.stack}>
          {/* 保存ボタン (編集モード時のみ) */}
          {!isReadOnly && (
            <>
              <ActionButton
                className={layoutStyles.mt2}
                disabled={isSubmitting}
                icon={<SaveAll size={16} />}
                label={charKey && !cloneKey ? '変更を保存する' : 'キャラクターを登録'}
                style={{ width: '100%' }}
                submit={true}
                variant='primary'
              />

              {/* 閲覧ページに戻るボタン (編集モード かつ 既存キャラ複製の場合) */}
              {charKey && cloneKey === null && (
                <>
                  <ActionButton
                    className={layoutStyles.mt2}
                    disabled={isSubmitting}
                    icon={<Trash2 size={16} />}
                    label='キャラクターを削除'
                    onClick={() => handleDelete?.()} // 削除ハンドラを呼ぶ
                    style={{ width: '100%', marginTop: '12px' }}
                    variant='danger'
                  />
                  <ActionButton
                    href={`/preciousdays/view/${char.id}`}
                    icon={<Eye size={16} />}
                    label='閲覧画面に戻る'
                    style={{ width: '100%', marginTop: '8px' }}
                    variant='outline'
                  />
                </>
              )}
            </>
          )}

          {/* その他のメニュー (閲覧モード時) */}
          {isReadOnly && (
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* 複製ボタン */}
              {!isSampleData ? (
                <ActionButton
                  icon={<Copy size={16} />}
                  label='このキャラを複製する'
                  onClick={() => handleDuplicate(char)}
                  style={{ width: '100%' }}
                  variant='midnight'
                />
              ) : (
                <ActionButton icon={<Ban size={16} />} label='複製できません' variant='disabled' />
              )}
            </div>
          )}

          {/* 一覧に戻るボタン (共通) */}
          <ActionButton
            className={layoutStyles.mt2}
            href='/preciousdays'
            icon={<ArrowBigLeftDash size={16} />}
            label='一覧に戻る'
            style={{ width: '100%' }}
            variant='outline'
          />
        </div>
      </div>
    </aside>
  );
};
