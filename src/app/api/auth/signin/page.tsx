'use client';

import { useState, Suspense } from 'react'; // Suspense を追加
import { Tooltip } from 'react-tooltip';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { MainLayout } from '@/components/layouts/MainLayout';
import { ActionButton } from '@/components/ui/ActionButton';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import titleStyles from '@/styles/components/titles.module.scss';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        password: password,
        redirect: true,
      });
      if (result?.error) {
        setError('合言葉が違います。');
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('通信エラーが発生しました。');
      setIsLoading(false);
    }
  };

  return (
    <div
      className={layoutStyles.container}
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <header className={titleStyles.decoratedHeader} style={{ marginBottom: '2rem' }}>
        <h1>
          <span className={titleStyles.mainTitle}>SIGN IN</span>
          <span className={titleStyles.subTitle}>合言葉を教えてください</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit}>
        <input
          autoComplete='username'
          name='username'
          readOnly
          style={{ display: 'none' }}
          type='text'
          value='character-editor'
        />
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            autoComplete='current-password'
            className={formStyles.input}
            data-tooltip-id='password-error-tooltip'
            id='password'
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            type='password'
            value={password}
          />
        </div>

        <Tooltip
          content={`⚠ ${error}`}
          id='password-error-tooltip'
          isOpen={!!error}
          place='top'
          variant='error'
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionButton
            label={isLoading ? '確認中...' : '確認'}
            style={{ width: '100%' }}
            submit={true}
            variant='outline'
          />
        </div>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
        <SignInContent />
      </Suspense>
    </MainLayout>
  );
}
