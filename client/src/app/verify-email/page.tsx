'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Zap, Sword, AlertTriangle } from 'lucide-react';

type VerificationStatus = 'pending' | 'success' | 'error';

export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [message, setMessage] = useState('Verifying your credentials...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email/${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Email successfully verified!');
          setTimeout(() => router.push('/arena'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification link');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 bg-purple-800/50 px-6 py-3 rounded-full border border-purple-600 mb-12">
          <Sword className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="font-mono text-yellow-400 tracking-wider">DSARENA</span>
        </div>

        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl">
          {status === 'pending' && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Verifying</h2>
              <p className="text-gray-300">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-900" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Account Verified!</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full animate-[progress_3s_linear_forwards]" 
                  style={{ width: '0%' }}
                ></div>
              </div>
              <p className="text-sm text-purple-300">Redirecting to arena...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-600 to-rose-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-rose-100" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-rose-400 mb-2">Verification Failed</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <a
                  href="/signup"
                  className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 text-center"
                >
                  Try Again
                </a>
                <a
                  href="/contact"
                  className="text-sm text-purple-300 hover:text-yellow-400 transition-colors"
                >
                  Need help? Contact support
                </a>
              </div>
            </div>
          )}
        </div>

        <p className="mt-12 text-gray-400 text-sm">
          Ready to battle? Join the <span className="text-yellow-400">Algorithm Arena</span>
        </p>
      </div>
    </main>
  );
}