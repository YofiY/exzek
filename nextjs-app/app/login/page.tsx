'use client';

import React, { useState, memo, ReactNode, useEffect, useRef, useContext } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Building2, User, Wallet, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConnectWalletButton from '../components/ConnectWallet';
import { UserContext } from '../UserContext';

// ==================== Utils ====================
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ==================== BoxReveal Component ====================
type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as 'relative' | 'absolute' | 'fixed' | 'sticky' | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#5046e6',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== BackgroundBeams Component ====================
const BackgroundBeams = memo(function BackgroundBeams({ className }: { className?: string }) {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
  ];

  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 flex items-center justify-center",
        className,
      )}
    >
      <svg
        className="z-0 h-full w-full pointer-events-none absolute"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {paths.map((path, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`gradient-${index}`}
              initial={{
                x1: "0%",
                x2: "0%",
                y1: "0%",
                y2: "0%",
              }}
              animate={{
                x1: ["0%", "100%"],
                x2: ["0%", "95%"],
                y1: ["0%", "100%"],
                y2: ["0%", `${93 + Math.random() * 8}%`],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="32.5%" stopColor="#6344F5" />
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
});

// ==================== Login Page Component ====================
type LoginType = 'employer' | 'employee';

const LoginPage = memo(function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('employer');
  const { user } = useContext(UserContext);

  // Redirect to upload page when wallet is connected
  useEffect(() => {
    if (user?.walletAddress) {
      console.log('Wallet connected, redirecting to upload page...');
      router.push('/upload');
    }
  }, [user?.walletAddress, router]);

  return (
  <div >
    {/* Background with beams */}
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden" style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
     
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Login Type Selector */}


          {/* Header */}
          <div className="text-center mb-8">
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <h2 className="text-3xl font-bold text-white mb-3">
                Connect Your Wallet
              </h2>
            </BoxReveal>
            
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <p className="text-white/70 mb-6">
                {loginType === 'employer' 
                  ? 'Connect your wallet to access the employer dashboard and deploy your agents'
                  : 'Connect your wallet to access your employee portal and verify your identity'
                }
              </p>
            </BoxReveal>
          </div>

          {/* Wallet Connection Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Secure Wallet Authentication
                </h3>
                <p className="text-white/60 text-sm">
                  Connect your MetaMask wallet to continue. Make sure you're on the Sepolia testnet.
                </p>
              </div>
            </BoxReveal> 

            {/* Connect Wallet Button */}
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <div className="space-y-4">
                <ConnectWalletButton />
                
                {user?.walletAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-200 text-sm font-medium">
                      Wallet Connected - Redirecting...
                    </span>
                    <ArrowRight size={16} className="text-green-400" />
                  </motion.div>
                )}
              </div>
            </BoxReveal>

            {/* Features */}
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-white font-medium mb-3 text-sm">What you can do:</h4>
                <div className="space-y-2">
                  {loginType === 'employer' ? (
                    <>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Deploy and manage AI agents
                      </div>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Set ENS records for your agents
                      </div>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Chat with your AI assistant
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Verify your identity securely
                      </div>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Chat with AI assistant
                      </div>
                      <div className="text-white/60 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Access your personalized dashboard
                      </div>
                    </>
                  )}
                </div>
              </div>
            </BoxReveal>
          </div>

          {/* Footer */}
          <BoxReveal boxColor="#3b82f6" duration={0.3}>
            <div className="mt-6 text-center">
              <p className="text-white/50 text-xs">
                By connecting your wallet, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </BoxReveal>
        </div>
      </div>
    </div>
  </div>
  );
});

export default LoginPage;
