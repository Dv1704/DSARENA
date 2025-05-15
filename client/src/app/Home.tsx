'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sword, Zap, Trophy, Code } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [typedText, setTypedText] = useState('');
  const fullText = "Welcome, Future Coder!";
  const typingSpeed = 100;
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Fixed: Initialize as null

  useEffect(() => {
    const type = () => {
      if (indexRef.current < fullText.length) {
        setTypedText(fullText.substring(0, indexRef.current + 1));
        indexRef.current += 1;
        timeoutRef.current = setTimeout(type, typingSpeed);
      }
    };

    type();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fullText]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white overflow-hidden">
      <section className="container mx-auto pt-6 px-4 py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo / Branding */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-purple-800/50 px-6 py-3 rounded-full border border-purple-600">
              <Sword className="w-5 h-5 text-yellow-400 animate-pulse" />
              <Image
                src="/logo.svg"
                alt="DSARENA Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-mono text-yellow-400 tracking-wider">DSARENA</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-yellow-400 block mb-4">
              {typedText}
              <span className="animate-pulse">|</span>
            </span>
            <span className="text-purple-400 block">Enter the</span>
            <span className="text-yellow-400 block">Algorithm Arena</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Sharpen your skills through coding duels,<br />
            Master data structures through visual tools,<br />
            Rise through ranks in weekly battles,<br />
            Become the champion that rules!
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/arena"
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Zap className="w-5 h-5 group-hover:animate-ping" />
              Join the Arena
            </Link>

            <Link
              href="/challenges"
              className="bg-transparent hover:bg-purple-800/50 text-yellow-400 border-2 border-yellow-400 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-0 -mt-8 mb-8 text-center">
        <h2 className="text-3xl font-bold mb-12 text-purple-300">Your Training Grounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-yellow-400 transition-all">
            <div className="flex justify-center mb-4">
              <Sword className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Algorithm Battles</h3>
            <p className="text-gray-400">Face opponents in live coding duels</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-yellow-400 transition-all">
            <div className="flex justify-center mb-4">
              <Code className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Visualization Dojo</h3>
            <p className="text-gray-400">See algorithms come to life visually</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-yellow-400 transition-all">
            <div className="flex justify-center mb-4">
              <Trophy className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tournaments</h3>
            <p className="text-gray-400">Compete for glory and prizes</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900/50 border-t border-gray-800 py-12 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            The arena awaits your skills,<br />
            Sign up now and climb those hills!
          </p>
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-bold px-8 py-3 rounded-lg text-lg transition-all duration-300"
          >
            Claim Your Gladiator Badge
          </Link>
        </div>
      </section>

      {/* Background Glow */}
      <div className="absolute top-[-20%] left-1/2 transform -translate-x-1/2 w-[140%] h-[80%] bg-gradient-to-br from-yellow-500/20 via-purple-500/20 to-transparent blur-3xl opacity-20 pointer-events-none z-0" />
    </main>
  );
}