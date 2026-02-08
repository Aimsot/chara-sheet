'use server';

import { reverse } from 'dns/promises';
import { headers } from 'next/headers';

import { sendSecurityEmail } from '@/lib/mail';

export async function notifyLoginIP() {
  const headerList = await headers();

  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || '127.0.0.1';

  let hostName = '不明';
  try {
    if (ip !== '::1' && ip !== '127.0.0.1') {
      const hosts = await reverse(ip);
      hostName = hosts[0] || '取得失敗';
    } else {
      hostName = 'localhost';
    }
  } catch {
    hostName = '逆引き不可（プロバイダ制限等）';
  }

  // 除外判定
  const excludeIps = (process.env.EXCLUDE_IPS || '').split(',').map((i) => i.trim());
  if (excludeIps.includes(ip)) return;

  const userAgent = headerList.get('user-agent') || 'Unknown Device';
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const subject = '【管理用通知】ログイン通知';
  const body = `
キャラクターシートへのログインを検知しました。

■ 日時: ${now}
■ IPアドレス: ${ip}
■ ホスト名: ${hostName}  
■ デバイス: ${userAgent}
  `;

  await sendSecurityEmail(subject, body);
}
