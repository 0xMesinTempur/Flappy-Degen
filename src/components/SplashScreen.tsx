'use client';

import React, { useEffect, useState } from 'react';
import { APP_NAME, APP_SPLASH_BACKGROUND_COLOR } from '~/lib/constants';
import Image from 'next/image';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function SplashScreen({ isVisible, onComplete }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 2000); // 2 seconds splash screen

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: APP_SPLASH_BACKGROUND_COLOR }}
    >
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <Image
            src="/flappydegen.png"
            alt="Flappy Degen"
            width={96}
            height={96}
            className="w-24 h-24 mx-auto animate-pulse"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
          />
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {APP_NAME}
        </h1>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-48 mx-auto">
          <div className="bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-1000"
              style={{ 
                width: isAnimating ? '100%' : '0%',
                transition: 'width 2s ease-in-out'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 