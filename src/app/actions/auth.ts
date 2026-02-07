'use server';

import { headers } from 'next/headers';
import { sendSecurityEmail } from '@/lib/mail';
import { reverse } from 'dns/promises'; // dnsのPromise版を使用

export async function notifyLoginIP() {
  const headerList = await headers();

  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || '127.0.0.1';

  // --- ホスト名（Whois情報の一部）を取得 ---
  let hostName = '不明';
  try {
    // ローカル(::1)などは逆引きできないため、条件分岐
    if (ip !== '::1' && ip !== '127.0.0.1') {
      const hosts = await reverse(ip);
      hostName = hosts[0] || '取得失敗';
    } else {
      hostName = 'localhost';
    }
  } catch (e) {
    hostName = '逆引き不可（プロバイダ制限等）';
  }

  // 除外判定
  const excludeIps = (process.env.EXCLUDE_IPS || '').split(',').map((i) => i.trim());
  if (excludeIps.includes(ip)) return;

  const userAgent = headerList.get('user-agent') || 'Unknown Device';
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const subject = '【Precious Days】ログイン通知';
  const body = `
キャラクターシートへのログインを検知しました。

■ 日時: ${now}
■ IPアドレス: ${ip}
■ ホスト名: ${hostName}  
■ デバイス: ${userAgent}
  `;

  await sendSecurityEmail(subject, body);
}
