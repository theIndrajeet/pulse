import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show iOS prompt after 30 seconds if not installed
    if (isIOSDevice && !localStorage.getItem('pwa-prompt-dismissed')) {
      setTimeout(() => setShowPrompt(true), 30000);
      return;
    }

    // Handle install prompt for other platforms
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds
      if (!localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
      >
        <div className="bg-paper-bg shadow-2xl border-4 border-ink-black p-4 sm:p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <Download className="w-8 h-8 text-accent-gold flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-headline text-xl mb-2">INSTALL PULSE</h3>
              
              {isIOS ? (
                <>
                  <p className="font-typewriter text-sm mb-3">
                    Add Pulse to your home screen for the best experience:
                  </p>
                  <ol className="font-typewriter text-xs space-y-1 mb-4">
                    <li>1. Tap the Share button <span className="inline-block w-4 h-4 align-text-bottom">⬆️</span></li>
                    <li>2. Scroll down and tap "Add to Home Screen"</li>
                    <li>3. Tap "Add" in the top right corner</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-typewriter text-sm mb-4">
                    Install Pulse for quick access and offline use. Works just like a native app!
                  </p>
                  <button
                    onClick={handleInstall}
                    className="btn-newspaper w-full"
                  >
                    Install Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
