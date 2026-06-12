const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

// 入力と同じ文字数で各文字をランダムなカタカナに置換
export const scrambleText = (text: string): string => {
  if (!text) return '';
  return [...text]
    .map((char) => {
      if (char === ' ' || char === '　' || char === '\n') return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join('');
};
