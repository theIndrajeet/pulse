import { motion } from 'framer-motion';
import { Trophy, Zap, Flame } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useStreakInfo } from '../behavior/BehaviorProvider';
import { useLanguage } from '../contexts/LanguageContext';

export default function QuickStats() {
  const { currentStreak, level, totalXP } = useGameStore();
  const { graceDaysLeft } = useStreakInfo();
  const { t } = useLanguage();

  const stats = [
    {
      icon: Flame,
      label: t('stats.streak'),
      value: `${currentStreak} ${t('stats.streakValue', { days: currentStreak })}`,
      subtext: graceDaysLeft > 0 ? `${graceDaysLeft} grace days left` : null,
      color: 'text-headline-red'
    },
    {
      icon: Trophy,
      label: t('stats.level'),
      value: `${t('stats.levelValue', { level })}`,
      color: 'text-accent-gold'
    },
    {
      icon: Zap,
      label: t('stats.xp'),
      value: `${t('stats.xpValue', { xp: totalXP })}`,
      color: 'text-accent-blue'
    }
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 sm:p-4 bg-paper-aged rounded-lg"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              <div>
                <span className="font-typewriter text-xs sm:text-sm uppercase text-ink-faded">
                  {stat.label}
                </span>
                {stat.subtext && (
                  <p className="font-typewriter text-[10px] sm:text-xs text-ink-light">
                    {stat.subtext}
                  </p>
                )}
              </div>
            </div>
            <span className="font-headline text-lg sm:text-xl">
              {stat.value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
