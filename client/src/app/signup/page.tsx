'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { useEffect } from 'react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

    useEffect(() => {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 1000); 
    
      return () => clearTimeout(timer);
    }, []);
    



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        style: {
          backgroundColor: '#f44336',
          color: '#ffffff',
        },
      }); 
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/auth/signup/email', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success('Signup successful. Verification email has been sent!', {
          style: {
            backgroundColor: '#6a0dad',
            color: '#ffffff',
          },
        });

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Signup failed', {
          style: {
            backgroundColor: '#f44336',
            color: '#ffffff',
          },
        });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.', {
        style: {
          backgroundColor: '#f44336',
          color: '#ffffff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    window.location.href = `http://localhost:5000/auth/${provider}`;
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin border-4 border-t-4 border-purple-500 rounded-full w-10 h-10"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900 text-white py-8">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 border border-purple-700">
        {/* Logo and DSARENA Text - Made more compact */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png" 
              alt="DSARENA Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-2xl font-semibold text-yellow-400">
              {['D', 'S', 'A', 'R', 'E', 'N', 'A'].map((letter, index) => (
                <span 
                  key={index} 
                  className="inline-block animate-bounce"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: '1.5s',
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'ease-in-out'
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
          </div>
        
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          {/* Username input */}
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Email input */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Password input */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Confirm Password input */}
          <div className="relative">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-700 text-white text-sm"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full  py-1.5 rounded-lg font-semibold text-gray-900 text-sm transition-all duration-300 transform ${
              loading ? 'bg-yellow-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center space-x-2">
                <div className="animate-spin border-2 border-t-2 border-yellow-900 w-4 h-4 rounded-full"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* OAuth Buttons - Made more compact */}
        <div className="flex justify-between space-x-3 pt-1">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="cursor-pointer flex-1 text-white py-1.5 text-sm rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 to-gray-700"
          >
            <Image
              src="/icons8-google-48.png"
              alt="Google"
              width={18}
              height={18}
            />
            <span className="text-white font-medium">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="cursor-pointer flex-1 text-white py-1.5 text-sm rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-purple-700"
          >
            <Image
              src="/icons8-github-logo-50.png"
              alt="GitHub"
              width={18}
              height={18}
            />
            <span>GitHub</span>
          </button>
        </div>

        {/* Already have an account? Sign in */}
        <div className="text-center pt-3">
          <p className="text-gray-300 text-sm">
            Already have an account?{' '}
            <button 
              onClick={() => router.push('/login')}
              className=" cursor-pointer text-yellow-400 hover:text-yellow-300 font-medium underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <ToastContainer />
    </main>
  );
}