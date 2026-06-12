import type { CSSProperties } from 'react';

// GL=1〜5: シルバー → accent-dark グラデーション
const GL_SILVER_LO = { r: 122, g: 132, b: 138 } as const; // #7a848a (GL=1, theme-silver --accent-dark)
const GL_SILVER_HI = { r: 163, g: 174, b: 181 } as const; // #a3aeb5 (GL=5, theme-silver --accent-color)
// GL=6: 師匠と同じ色
const GL_MASTER = { r: 142, g: 133, b: 97 } as const; // #8e8561 (default --accent-dark)

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

const getGLComponents = (gl: number): [number, number, number] => {
  if (gl >= 6) return [GL_MASTER.r, GL_MASTER.g, GL_MASTER.b];
  // GL=1→t=0, GL=5→t=1
  const t = Math.max(0, (Math.min(5, gl) - 1) / 4);
  return [
    lerp(GL_SILVER_LO.r, GL_SILVER_HI.r, t),
    lerp(GL_SILVER_LO.g, GL_SILVER_HI.g, t),
    lerp(GL_SILVER_LO.b, GL_SILVER_HI.b, t),
  ];
};

/** GL値に応じた色を返す（GL=1〜5:シルバー, GL=6:師匠色 #ffc107）*/
export const getGLColor = (gl: number): string => {
  const [r, g, b] = getGLComponents(gl);
  return `rgb(${r}, ${g}, ${b})`;
};

/** GLカード用インラインスタイル — ResourceSection のカード背景に使用 */
export const getGLCardStyle = (gl: number): CSSProperties => {
  const t = Math.max(0, Math.min(6, gl)) / 6;
  const [r, g, b] = getGLComponents(gl);
  const bgAlpha = (0.15 + t * 0.35).toFixed(2); // 0.15 → 0.50
  const darkEnd = (0.65 - t * 0.2).toFixed(2); // 0.65 → 0.45

  return {
    background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${bgAlpha}), rgba(0, 0, 0, ${darkEnd}))`,
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease-out',
  };
};
