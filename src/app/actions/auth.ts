'use server';

import { headers } from 'next/headers';
import { sendSecurityEmail } from '@/lib/mail';

export async function notifyLoginIP() {
  const headerList = await headers();

  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || '127.0.0.1';

  const excludeIpsEnv = process.env.EXCLUDE_IPS || '';
  const excludeIps = excludeIpsEnv.split(',').map((item) => item.trim());

  if (excludeIps.includes(ip)) {
    console.log(`Login notification skipped for excluded IP: ${ip}`);
    return;
  }
  // -------------------------

  const userAgent = headerList.get('user-agent') || 'Unknown Device';
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const subject = '【キャラクターシート】ログイン通知';
  const body = `
キャラクターシートへのログインを検知しました。

■ 日時: ${now}
■ IPアドレス: ${ip}
■ デバイス: ${userAgent}
  `;

  await sendSecurityEmail(subject, body);
}
