import { motion } from 'framer-motion';
import { useRef } from 'react';
import { X, ChevronLeft, Clock } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useLanguage } from '../contexts/LanguageContext';
import { useSwipeGesture } from '../hooks/useSwipeGesture';


interface LaterDrawerProps {
  onClose: () => void;
}

export default function LaterDrawer({ onClose }: LaterDrawerProps) {
  const { laterTasks, moveToToday } = useTaskStore();
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Add swipe to close gesture
  useSwipeGesture(drawerRef as React.RefObject<HTMLElement>, {
    onSwipeRight: onClose,
  });

  const handleMoveToToday = async (taskId: string) => {
    await moveToToday(taskId);
    if (laterTasks.length === 1) {
      // Close drawer if this was the last task
      setTimeout(onClose, 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50"
      onClick={onClose}
    >
      <motion.div
        ref={drawerRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-paper-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-ink-black text-paper-bg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl sm:text-3xl">LATER PILE</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t('archives.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="font-typewriter text-sm mt-2">
            Tasks postponed for future • {laterTasks.length} items
          </p>
        </div>

        {/* Swipe hint for mobile */}
        <div className="sm:hidden bg-accent-gold/10 p-3 text-center">
          <p className="font-typewriter text-xs">Swipe right to close →</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto h-[calc(100%-180px)] sm:h-[calc(100%-120px)]">
          {laterTasks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-ink-light mb-4" />
              <p className="font-serif text-lg text-ink-faded">
                {t('archives.empty')}
              </p>
              <p className="font-typewriter text-sm text-ink-light mt-2">
                Tasks moved here will appear for later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {laterTasks.map((task, index) => (
                <motion.article
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="news-article p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-base sm:text-lg mb-1">
                        {task.text || task.title}
                      </h3>
                      <p className="font-typewriter text-xs text-ink-faded">
                        Postponed {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                      {/* Tags removed - not in Task type */}
                    </div>
                    
                    <motion.button
                      onClick={() => handleMoveToToday(task.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-ink-black text-paper-bg rounded hover:bg-ink-black/80 transition-colors text-sm whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="font-typewriter">TODAY</span>
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        {laterTasks.length > 0 && (
          <div className="border-t border-ink-light p-4 sm:p-6 bg-paper-aged">
            <div className="flex justify-between items-center">
              <span className="font-typewriter text-sm">
                Total postponed: {laterTasks.length}
              </span>
              <button
                onClick={onClose}
                className="font-typewriter text-sm hover:text-headline-red transition-colors"
              >
                Close drawer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}