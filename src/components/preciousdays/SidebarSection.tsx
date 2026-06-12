import React, { useEffect, useRef, useState } from 'react';

import {
  AlertCircle,
  Ban,
  ClipboardCopy,
  Copy,
  ExternalLink,
  Eye,
  LoaderCircle,
  PenIcon,
  Save,
  Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  ELEMENT_COLORS,
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
  StyleKey,
} from '@/constants/preciousdays';
import btnStyles from '@/styles/components/buttons.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import sidebarStyles from '@/styles/components/charaSheet/sidebar.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';
import { buildCcfoliaCharacter } from '@/utils/preciousdays/buildCcfoliaCharacter';
import { getGLColor } from '@/utils/preciousdays/glColor';

import { ActionButton } from '../ui/ActionButton';
import { ColorPicker } from '../ui/ColorPicker';

interface MiniProfile {
  characterName: string;
  playerName: string;
  characterType: 'disciple' | 'master';
  hasImage: boolean;
  species: string;
  style: string;
  element: string;
  gl: number;
  profileSpoilers: { species?: boolean; style?: boolean; element?: boolean };
}

const LinkedMiniCard: React.FC<{ id: string; profile: MiniProfile }> = ({ id, profile }) => {
  const { profileSpoilers: sp } = profile;
  const speciesName = !sp.species
    ? SPECIES_DATA[profile.species as SpeciesKey]?.name || profile.species
    : null;
  const styleName = !sp.style ? STYLE_DATA[profile.style as StyleKey]?.name || profile.style : null;
  const elementName = !sp.element
    ? ELEMENT_DATA[profile.element as ElementKey]?.name || profile.element
    : null;
  const elementColor = !sp.element ? ELEMENT_COLORS[profile.element] || undefined : undefined;

  return (
    <div className={sidebarStyles.miniCard}>
      {profile.hasImage && (
        <div className={sidebarStyles.miniCardImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={profile.characterName}
            src={`/api/preciousdays/character/${id}/image`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          />
        </div>
      )}
      <div className={sidebarStyles.miniCardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className={sidebarStyles.miniCardType}>
            {profile.characterType === 'master' ? '師匠' : '弟子'}
          </span>
          {profile.characterType === 'disciple' && (
            <span
              className={sidebarStyles.miniCardMetaTag}
              style={{ color: getGLColor(profile.gl), borderColor: `${getGLColor(profile.gl)}60` }}
            >
              GL{profile.gl}
            </span>
          )}
        </div>
        <span className={sidebarStyles.miniCardName}>{profile.characterName}</span>
        <div className={sidebarStyles.miniCardMeta}>
          {speciesName && <span>{speciesName}</span>}
          {styleName && <span>{styleName}</span>}
          {elementName && <span style={{ color: elementColor }}>{elementName}</span>}
        </div>
      </div>
    </div>
  );
};

interface StatusSidebarProps {
  id: string | undefined;
  password: string | undefined;
  isCopyProhibited: boolean | undefined;
  char: Character;
  setChar: React.Dispatch<React.SetStateAction<Character>>;
  mode: 'create' | 'edit' | 'view';
  isSubmitting?: boolean;
  className?: string;
  isReadOnly?: boolean;
  isDirty?: boolean;
  handleDelete?: () => Promise<void>;
  autoResize?: boolean;
  onAutoResizeChange?: (value: boolean) => void;
  authFlashTrigger?: number;
}

export const SidebarSection: React.FC<StatusSidebarProps> = ({
  id,
  password,
  isCopyProhibited,
  char,
  setChar,
  mode,
  isSubmitting,
  className,
  isReadOnly,
  isDirty,
  handleDelete,
  autoResize,
  onAutoResizeChange,
  authFlashTrigger,
}) => {
  const router = useRouter();
  const search = useSearchParams();
  const cloneKey = search.get('clone');

  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [ccfoliaCopied, setCcfoliaCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [linkedProfile, setLinkedProfile] = useState<MiniProfile | null>(null);

  useEffect(() => {
    if (!authFlashTrigger) return;
    const startTimer = setTimeout(() => setIsFlashing(true), 0);
    const endTimer = setTimeout(() => setIsFlashing(false), 700);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [authFlashTrigger]);

  useEffect(() => {
    const linkedId = char.linkedCharacterId?.trim();
    if (!linkedId) {
      const t = setTimeout(() => setLinkedProfile(null), 0);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    fetch(`/api/preciousdays/character/${linkedId}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setLinkedProfile(data);
      })
      .catch(() => {
        if (!cancelled) setLinkedProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [char.linkedCharacterId]);

  const initialPasswordRef = useRef(char.password);

  const handleCopyCcfolia = async () => {
    try {
      const json = buildCcfoliaCharacter(char);
      await navigator.clipboard.writeText(json);
      setCcfoliaCopied(true);
      setTimeout(() => setCcfoliaCopied(false), 2000);
    } catch {
      alert('クリップボードへのコピーに失敗しました');
    }
  };
  // --- 複製処理 ---
  const handleDuplicate = async (targetChar: string) => {
    router.push(`/preciousdays/edit?clone=${targetChar}`);
  };

  // --- 認証処理 (閲覧モード用) ---
  const handleAuthSubmit = async () => {
    if (!password) {
      router.push(`/preciousdays/edit?key=${id}`);
      return;
    }
    if (!authPassword) {
      alert('パスワードを入力してください');
      return;
    }
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/verify_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          password: authPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/preciousdays/edit?key=${id}`);
      } else {
        alert(data.message || 'パスワードが違います');
        setIsAuthLoading(false);
      }
    } catch (error) {
      console.error('Auth Submit Error:', error);
      setIsAuthLoading(false);
    }
  };

  return (
    <aside className={`${layoutStyles.span4} ${className || ''}`} id='signin-section'>
      <div className={sidebarStyles.container}>
        {/* シートID */}
        {id && (
          <div className={`${baseStyles.stack} ${formStyles.panel}`}>
            <label className={formStyles.label}>シートID</label>
            <div className={sidebarStyles.idDisplay}>
              <span className={sidebarStyles.idText}>{id}</span>
              <button
                className={btnStyles.ghost}
                onClick={async () => {
                  await navigator.clipboard.writeText(id);
                  setIdCopied(true);
                  setTimeout(() => setIdCopied(false), 2000);
                }}
                title='IDをコピー'
                type='button'
              >
                {idCopied ? <span style={{ fontSize: '0.65rem' }}>✓</span> : <Copy size={13} />}
              </button>
            </div>
          </div>
        )}

        {/* キャラクターの役割（編集モードのみ） */}
        {!isReadOnly && (
          <div className={`${baseStyles.stack} ${formStyles.panel}`}>
            <label className={formStyles.label}>キャラクターの役割</label>
            <select
              className={formStyles.select}
              onChange={(e) =>
                setChar((prev) => ({
                  ...prev,
                  characterType: e.target.value as 'disciple' | 'master',
                }))
              }
              value={char.characterType ?? 'disciple'}
            >
              <option value='disciple'>弟子</option>
              <option value='master'>師匠</option>
            </select>
            {char.characterType === 'master' && (
              <div className={`${formStyles.notes} ${layoutStyles.mt0}`}>
                <p>師匠モードでは能力値・装備などの欄が非表示になります</p>
              </div>
            )}
          </div>
        )}

        {/* リンク先シートID */}
        {!isReadOnly ? (
          <div className={`${baseStyles.stack} ${formStyles.panel}`}>
            <label className={formStyles.label}>
              {char.characterType === 'master' ? '弟子' : '師匠'}のシートID
            </label>
            <input
              className={formStyles.input}
              onChange={(e) => setChar((prev) => ({ ...prev, linkedCharacterId: e.target.value }))}
              placeholder='リンク先のシートIDを入力'
              type='text'
              value={char.linkedCharacterId ?? ''}
            />
            {char.linkedCharacterId && linkedProfile && (
              <LinkedMiniCard id={char.linkedCharacterId} profile={linkedProfile} />
            )}
            {char.linkedCharacterId && (
              <ActionButton
                icon={<ExternalLink size={14} />}
                label={`${char.characterType === 'master' ? '弟子' : '師匠'}のシートを開く`}
                onClick={() =>
                  window.open(`/preciousdays/view/${char.linkedCharacterId}`, '_blank')
                }
                style={{ width: '100%', marginTop: '6px' }}
                variant='outline'
              />
            )}
          </div>
        ) : (
          char.linkedCharacterId && (
            <div className={`${baseStyles.stack} ${formStyles.panel}`}>
              <label className={formStyles.label}>
                {char.characterType === 'master' ? '弟子' : '師匠'}のシート
              </label>
              {linkedProfile && (
                <LinkedMiniCard id={char.linkedCharacterId} profile={linkedProfile} />
              )}
              <ActionButton
                icon={<ExternalLink size={14} />}
                label={`${char.characterType === 'master' ? '弟子' : '師匠'}のシートを開く`}
                onClick={() =>
                  window.open(`/preciousdays/view/${char.linkedCharacterId}`, '_blank')
                }
                style={{ width: '100%' }}
                variant='outline'
              />
            </div>
          )
        )}

        {/* PASSWORD エリア */}
        <div className={`${baseStyles.stack} ${formStyles.panel}`}>
          <div onSubmit={handleAuthSubmit}>
            <label className={formStyles.label}>
              {mode === 'view'
                ? '編集用パスワード'
                : password
                  ? 'パスワードを変更する'
                  : 'パスワードを設定する（任意）'}
            </label>
            <input
              autoCapitalize='none'
              autoComplete='current-password'
              autoCorrect='off'
              className={`${formStyles.input} ${isFlashing ? sidebarStyles.inputFlash : ''}`}
              inputMode='email'
              lang='en'
              name='password'
              onChange={(e) => {
                const val = e.target.value;
                if (isReadOnly) {
                  setAuthPassword(val);
                } else {
                  setEditPassword(val);
                  setChar((prev: Character) => ({
                    ...prev,
                    password: val || initialPasswordRef.current || '',
                  }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthSubmit();
                }
              }}
              pattern='[A-Za-z0-9]*'
              placeholder={
                mode === 'view'
                  ? '認証パスワードを入力'
                  : password
                    ? '変更する場合のみ入力（空欄なら維持）'
                    : '4〜12文字の半角英数'
              }
              spellCheck='false'
              type='password'
              value={isReadOnly ? authPassword : editPassword}
            />

            <div className={`${formStyles.notes} ${layoutStyles.mt0}`}>
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
                icon={
                  isAuthLoading ? (
                    <LoaderCircle className={btnStyles.spinner} size={16} />
                  ) : (
                    <PenIcon size={16} />
                  )
                }
                label={isAuthLoading ? '' : '認証して編集画面へ'}
                onClick={handleAuthSubmit}
                style={{ width: '100%', marginTop: '10px' }}
                variant='solid'
              />
            )}
          </div>
        </div>

        {/* 表示設定（閲覧モードのみ） */}
        {isReadOnly && onAutoResizeChange !== undefined && (
          <div className={`${baseStyles.stack} ${formStyles.panel}`}>
            <label className={formStyles.toggleLabel}>
              <span>テキストエリアを自動サイズ調整</span>
              <div className={formStyles.toggleSwitch}>
                <input
                  checked={autoResize || false}
                  onChange={(e) => onAutoResizeChange(e.target.checked)}
                  type='checkbox'
                />
                <span className={formStyles.slider}></span>
              </div>
            </label>
          </div>
        )}

        {/* ココフォリア設定 */}
        {!isReadOnly && (
          <div className={`${baseStyles.stack} ${formStyles.panel}`}>
            <label className={formStyles.label}>ココフォリアコマカラー</label>
            <ColorPicker
              onChange={(color) => setChar((prev: Character) => ({ ...prev, ccfoliaColor: color }))}
              value={char.ccfoliaColor || '#4a90d9'}
            />
            <div className={`${formStyles.notes} ${layoutStyles.mt0}`}>
              <p>コマの出力は閲覧画面で行なえます</p>
            </div>
          </div>
        )}

        {/* アクションボタンエリア */}
        <div className={baseStyles.stack}>
          {/* 保存ボタン (編集モード時のみ) */}
          {mode !== 'view' && (
            <>
              <div className={`${baseStyles.stack} ${formStyles.panel}`}>
                <label className={formStyles.toggleLabel}>
                  <span>シートの複製禁止</span>
                  <div className={formStyles.toggleSwitch}>
                    <input
                      checked={isCopyProhibited || false}
                      name='isCopyProhibited'
                      onChange={(e) => {
                        setChar((prev: Character) => ({
                          ...prev,
                          isCopyProhibited: e.target.checked,
                        }));
                      }}
                      type='checkbox'
                    />
                    <span className={formStyles.slider}></span>
                  </div>
                </label>
                <label className={formStyles.toggleLabel}>
                  <span>テキストエリアを自動サイズ調整</span>
                  <div className={formStyles.toggleSwitch}>
                    <input
                      checked={char.autoResizeTextarea || false}
                      name='autoResizeTextarea'
                      onChange={(e) => {
                        setChar((prev: Character) => ({
                          ...prev,
                          autoResizeTextarea: e.target.checked,
                        }));
                      }}
                      type='checkbox'
                    />
                    <span className={formStyles.slider}></span>
                  </div>
                </label>
              </div>
              <div>
                {isDirty ? (
                  <>
                    <ActionButton
                      className={layoutStyles.mt2}
                      disabled={isSubmitting}
                      icon={
                        isSubmitting ? (
                          <LoaderCircle className={btnStyles.spinner} size={16} />
                        ) : (
                          <Save size={16} />
                        )
                      }
                      label={
                        isSubmitting
                          ? ''
                          : id && !cloneKey
                            ? '変更を保存する'
                            : 'キャラクターを登録'
                      }
                      style={{ width: '100%' }}
                      submit={true}
                      variant='primary'
                    />
                    <div className={`${formStyles.notes} ${layoutStyles.mt0}`}>
                      <p>Ctrl + S でも保存ができます</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ActionButton
                      className={layoutStyles.mt2}
                      disabled={true}
                      icon={<AlertCircle size={16} />}
                      label='変更はありません'
                      style={{ width: '100%' }}
                      variant='disabled'
                    />
                  </>
                )}
              </div>

              {/* 閲覧ページに戻るボタン (編集モード かつ 既存キャラ) */}
              {id && cloneKey === null && (
                <ActionButton
                  icon={<Eye size={16} />}
                  label='閲覧画面に戻る'
                  onClick={() => {
                    if (isSubmitting) return;
                    if (isDirty) {
                      const ok = window.confirm(
                        '編集中ですが、保存せずに閲覧ページに戻ってもよろしいですか？'
                      );
                      if (!ok) return;
                    }
                    router.push(`/preciousdays/view/${id}`);
                  }}
                  style={{ width: '100%', marginTop: '8px' }}
                  variant='outline'
                />
              )}
            </>
          )}
          {/* 閲覧モード専用: 複製ボタン */}
          {mode === 'view' && (
            <>
              <ActionButton
                icon={<ClipboardCopy size={16} />}
                label={ccfoliaCopied ? 'コピーしました！' : 'ココフォリアコマ出力'}
                onClick={handleCopyCcfolia}
                style={{ width: '100%' }}
                variant={ccfoliaCopied ? 'solid' : 'outline'}
              />
              <div className={`${formStyles.notes} ${layoutStyles.mt0}`}>
                <p>画像は出力できません</p>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* 複製ボタン */}
                {!isCopyProhibited && id ? (
                  <ActionButton
                    icon={<Copy size={16} />}
                    label='このキャラを複製する'
                    onClick={() => handleDuplicate(id)}
                    style={{ width: '100%' }}
                    variant='midnight'
                  />
                ) : (
                  <ActionButton
                    icon={<Ban size={16} />}
                    label='複製できません'
                    variant='disabled'
                  />
                )}
              </div>
            </>
          )}
          {/* 削除ボタン (編集モード かつ 既存キャラ) */}
          {mode !== 'view' && id && cloneKey === null && (
            <ActionButton
              className={layoutStyles.mt2}
              disabled={isSubmitting}
              icon={<Trash2 size={16} />}
              label='キャラクターを削除'
              onClick={() => handleDelete?.()}
              style={{ width: '100%', marginTop: '24px' }}
              variant='danger'
            />
          )}
        </div>
      </div>
    </aside>
  );
};
