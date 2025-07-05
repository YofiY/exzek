'use client';

import React, { useState, ChangeEvent, FormEvent, memo, ReactNode, useEffect, useRef, forwardRef } from 'react';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Eye, EyeOff, Building2, User } from 'lucide-react';
import { useRouter } from 'next/router';

// ==================== Utils ====================
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ==================== Input Component ====================
const Input = memo(
  forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, type, ...props }, ref) {
      const radius = 100;
      const [visible, setVisible] = useState(false);

      const mouseX = useMotionValue(0);
      const mouseY = useMotionValue(0);

      function handleMouseMove({
        currentTarget,
        clientX,
        clientY,
      }: React.MouseEvent<HTMLDivElement>) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }

      return (
        <motion.div
          style={{
            background: useMotionTemplate`
              radial-gradient(
                ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
                #3b82f6,
                transparent 80%
              )
            `,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className='group/input rounded-lg p-[2px] transition duration-300'
        >
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-md border-none bg-gray-50 px-4 py-3 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600',
              className
            )}
            ref={ref}
            {...props}
          />
        </motion.div>
      );
    }
  )
);

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

// ==================== Label Component ====================
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
        className
      )}
      {...props}
    />
  );
});

// ==================== Button Component ====================
const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
    </>
  );
};

// ==================== Main Login Component ====================
type LoginType = 'employer' | 'employee';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = memo(function LoginPage() {
  // const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('employer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleInputChange = (field: keyof LoginFormData) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          type: loginType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful
      console.log('Login successful:', data.user);
      
      // Redirect to upload page
      window.location.href = '/upload';
      // router.push('/upload');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginType = (type: LoginType) => {
    setLoginType(type);
    setError(''); // Clear any existing errors
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Login Type Selector */}
          <BoxReveal boxColor="#3b82f6" duration={0.5}>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-6">Welcome Back</h1>
              <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => toggleLoginType('employer')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 font-medium",
                    loginType === 'employer'
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <Building2 size={18} />
                  Employer
                </button>
                <button
                  onClick={() => toggleLoginType('employee')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 font-medium",
                    loginType === 'employee'
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <User size={18} />
                  Employee
                </button>
              </div>
            </div>
          </BoxReveal>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Log in as {loginType}
              </h2>
            </BoxReveal>
            
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <p className="text-white/70 mb-6">
                {loginType === 'employer' 
                  ? 'Access your employer dashboard and manage your team'
                  : 'Access your employee portal and view your schedule'
                }
              </p>
            </BoxReveal>

            {/* Error Message */}
            {error && (
              <BoxReveal boxColor="#ef4444" duration={0.3}>
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </BoxReveal>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <BoxReveal boxColor="#3b82f6" duration={0.3}>
                  <Label htmlFor="email" className="text-white mb-2 block">
                    Email Address
                  </Label>
                </BoxReveal>
                <BoxReveal boxColor="#3b82f6" duration={0.3}>                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      disabled={isLoading}
                      required
                    />
                </BoxReveal>
              </div>

              <div>
                <BoxReveal boxColor="#3b82f6" duration={0.3}>
                  <Label htmlFor="password" className="text-white mb-2 block">
                    Password
                  </Label>
                </BoxReveal>
                <BoxReveal boxColor="#3b82f6" duration={0.3}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </BoxReveal>
              </div>

              <BoxReveal boxColor="#3b82f6" duration={0.3}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <>
                      Sign In as {loginType === 'employer' ? 'Employer' : 'Employee'}
                      <BottomGradient />
                    </>
                  )}
                </button>
              </BoxReveal>

              <BoxReveal boxColor="#3b82f6" duration={0.3}>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              </BoxReveal>
            </form>
          </div>

          <BoxReveal boxColor="#3b82f6" duration={0.3}>
            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Don&apos;t have an account?{' '}
                <button className="text-blue-300 hover:text-blue-200 transition-colors">
                  Sign up here
                </button>
              </p>
            </div>
          </BoxReveal>
        </div>
      </div>
    </div>
  );
});

export default LoginPage;
