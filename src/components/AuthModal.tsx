import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, User, Mail, Lock, UserPlus, LogIn, Heart } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let result;
    if (mode === 'signin') {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password, displayName);
    }

    if (result.success) {
      onClose();
      setEmail('');
      setPassword('');
      setDisplayName('');
    } else {
      setError(result.error || 'Something went wrong');
    }
    
    setIsLoading(false);
  };

  const handleModeSwitch = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="w-6" /> {/* Spacer */}
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold">Join the Community</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted text-sm">
            {mode === 'signin' 
              ? 'Welcome back! Share your mood with loved ones.'
              : 'Start sharing your wellness journey with friends and family.'
            }
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should friends see you?"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Choose a secure password' : 'Enter your password'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  required
                  minLength={mode === 'signup' ? 6 : 1}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleModeSwitch}
              className="text-accent hover:text-accent-dark transition-colors text-sm"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {/* Features preview */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-3 text-center">What you'll unlock:</h3>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                Share your mood with family & friends
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                See how your loved ones are feeling
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                Join leaderboards and celebrate together
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                Build accountability and support
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
