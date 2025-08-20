import { motion } from 'framer-motion';
import { Star, TrendingUp, Target } from 'lucide-react';
import type { Task } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Daily3StripProps {
  tasks: Task[];
}

export default function Daily3Strip({ tasks }: Daily3StripProps) {
  const { t } = useLanguage();
  const daily3Tasks = tasks.filter(task => task.isDaily3 && !task.completed);
  const completedDaily3 = tasks.filter(task => task.isDaily3 && task.completed);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Daily 3</h2>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Star className="w-4 h-4" />
          <span>{completedDaily3.length} / 3 complete</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => {
          const task = daily3Tasks[index];
          const isCompleted = index < completedDaily3.length;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className={`card p-5 h-full transition-all ${
                isCompleted ? 'bg-surface-alt border-accent' : ''
              }`}>
                {/* Accent dot in corner */}
                <motion.div 
                  className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                    isCompleted ? 'bg-positive' : 'bg-accent opacity-30'
                  }`}
                  animate={isCompleted ? {
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.8, 1]
                  } : {}}
                  transition={{ duration: 0.5 }}
                />
                
                {task ? (
                  <>
                    <h3 className="font-medium mb-2">{task.text}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>50 XP</span>
                      </div>
                      {task.urgency !== 'normal' && (
                        <span className={`capitalize ${
                          task.urgency === 'high' ? 'text-error' : 'text-warning'
                        }`}>
                          {task.urgency}
                        </span>
                      )}
                    </div>
                  </>
                ) : isCompleted ? (
                  <div className="text-center py-4">
                    <Target className="w-8 h-8 text-positive mx-auto mb-2" />
                    <p className="text-sm font-medium text-positive">Completed!</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-border-muted mx-auto mb-2" />
                    <p className="text-sm text-muted">Empty slot</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Subtle separator */}
      <hr className="separator-dotted" />
    </section>
  );
}