// src/components/preciousdays/DebugUploader.tsx
'use client';

import { useState } from 'react';

import { DUMMY_CHARACTERS } from '@/constants/dummy';

export const DebugUploader = () => {
  const [status, setStatus] = useState('待機中');

  const handleUpload = async () => {
    const reversedChars = [...DUMMY_CHARACTERS].reverse();

    setStatus(`アップロード開始: 全${reversedChars.length}件`);

    for (const char of reversedChars) {
      try {
        setStatus(`送信中: ${char.characterName} (${char.id})...`);

        const response = await fetch('/api/save_character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // ★修正ポイント: password を追加して送信します
          body: JSON.stringify({
            ...char,
            password: 'password', // ここに任意の初期パスワードを設定
          }),
        });

        if (!response.ok) {
          // エラーの詳細をログに出すためにテキストを取得
          const errorText = await response.text();
          throw new Error(`Failed to upload ${char.id}: ${response.status} ${errorText}`);
        }

        console.log(`Success: ${char.characterName}`);
      } catch (error) {
        console.error(error);
        setStatus(`エラー発生: ${char.characterName} (詳細はコンソールを確認)`);
        return;
      }
    }

    setStatus('全件アップロード完了！');
  };

  return (
    // ... (表示部分はそのまま)
    <div
      style={{
        padding: '20px',
        border: '2px solid red',
        margin: '20px',
        background: '#fff',
        color: '#000',
      }}
    >
      <h3>管理者用：サンプルデータ投入</h3>
      <p>
        現在の状態: <b>{status}</b>
      </p>
      <button
        onClick={handleUpload}
        style={{ padding: '10px 20px', background: 'red', color: 'white', fontWeight: 'bold' }}
      >
        サンプルキャラを逆順でR2に送信
      </button>
    </div>
  );
};
