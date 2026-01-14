import { useState } from 'react';
import { X } from 'lucide-react';
import logoImage from 'figma:asset/1694061c55bf8d6ca212824ee7cf12e9c950947f.png';

interface LoginPageProps {
  onClose?: () => void;
  onLogin: () => void;
}

export function LoginPage({ onClose, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError(true);
      return;
    }
    // Handle email login/registration
    console.log('Email login:', email);
    onLogin();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login
    console.log('Social login:', provider);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Close button - optional, only if onClose is provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-4 right-0 p-2 text-[#A0A0A0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logoImage} alt="Ask-M Logo" className="w-16 h-16 object-contain" />
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl text-center mb-4">
          Log in or sign up
        </h1>

        {/* Subtitle */}
        <p className="text-[#A0A0A0] text-center mb-8">
          An AI-powered chatbot and summarizer tailored exclusively to Kathmandu University's syllabus.
        </p>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full bg-[#2D2E30] hover:bg-[#3D3E40] text-white font-medium py-3.5 px-6 rounded-full transition-colors flex items-center justify-center gap-3 border border-[#3D3E40]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Email divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#3D3E40]"></div>
            <span className="text-[#A0A0A0] text-sm">OR</span>
            <div className="flex-1 h-px bg-[#3D3E40]"></div>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailContinue} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
              className={`w-full bg-transparent text-white placeholder-[#A0A0A0] py-3.5 px-6 rounded-full focus:outline-none transition-colors ${
                emailError 
                  ? 'border-2 border-red-500' 
                  : 'border border-[#3D3E40] focus:border-[#5D5E60]'
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2 px-6">
                Email is required
              </p>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3.5 px-6 rounded-full transition-colors"
          >
            Continue
          </button>
        </form>

        {/* Footer Text */}
        <p className="text-[#A0A0A0] text-xs text-center mt-8">
          By continuing, you agree to Ask-M's{' '}
          <button className="text-white hover:underline">Terms of Service</button> and{' '}
          <button className="text-white hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}