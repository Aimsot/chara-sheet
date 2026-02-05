'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation'; // router を追加

import { saveCharacterAction } from '@/app/preciousdays/actions'; // Server Action をインポート
import { DUMMY_CHARACTERS } from '@/constants/dummy';

export const DebugUploader = () => {
  const router = useRouter();
  const [status, setStatus] = useState('待機中');

  const handleUpload = async () => {
    const reversedChars = [...DUMMY_CHARACTERS].reverse();

    setStatus(`アップロード開始: 全${reversedChars.length}件`);

    for (const char of reversedChars) {
      try {
        setStatus(`送信中: ${char.characterName} (${char.id})...`);

        // ★ API fetch の代わりに Server Action を呼び出します
        // これにより、サーバー側の Data Cache とタグが適切に処理されます
        const result = await saveCharacterAction({
          ...char,
          password: 'password', // 初期パスワードを設定
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        console.log(`Success: ${char.characterName}`);
      } catch (error) {
        console.error(error);
        setStatus(`エラー発生: ${char.characterName} (詳細はコンソールを確認)`);
        return;
      }
    }

    // ★ 全件完了後、現在のページ（一覧）を最新状態にリフレッシュします
    // これで「一回更新しないと見えない」問題が解消されます
    router.refresh();
    setStatus('全件アップロード完了！一覧を確認してください。');
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid red',
        margin: '20px',
        background: '#fff',
        color: '#000',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>管理者用：サンプルデータ投入</h3>
      <p>
        現在の状態: <b>{status}</b>
      </p>
      <button
        onClick={handleUpload}
        style={{
          padding: '10px 20px',
          background: 'red',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        サンプルキャラを逆順でR2に送信
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        ※送信完了後、自動的に一覧が更新されます。
      </p>
    </div>
  );
};
