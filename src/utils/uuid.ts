export const generateUUID = (): string => {
  // ブラウザが標準対応している場合
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // ★ここを修正しました
    return crypto.randomUUID();
  }

  // 非対応環境用のフォールバック (RFC4122準拠の生成ロジック)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
