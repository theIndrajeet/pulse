import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Trophy, Medal, Award, Users, Crown, Target, Zap, TrendingUp } from 'lucide-react';
import { useSocialStore } from '../stores/socialStore';
import { useAuthStore } from '../stores/authStore';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LeaderboardType = 'global' | 'friends' | 'streaks' | 'xp';

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('friends');
  
  const {
    leaderboard,
    friendsLeaderboard,
    myRank,
    isLoadingLeaderboard,
    loadLeaderboard,
    loadFriendsLeaderboard,
    subscribeToLeaderboard
  } = useSocialStore();
  
  const { user, isSignedIn } = useAuthStore();

  useEffect(() => {
    if (isOpen && isSignedIn) {
      loadLeaderboard();
      loadFriendsLeaderboard();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToLeaderboard();
      return unsubscribe;
    }
  }, [isOpen, isSignedIn, loadLeaderboard, loadFriendsLeaderboard, subscribeToLeaderboard]);

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case 'friends':
        return friendsLeaderboard;
      case 'streaks':
        return [...leaderboard].sort((a, b) => b.longest_streak - a.longest_streak);
      case 'xp':
        return [...leaderboard].sort((a, b) => b.total_xp - a.total_xp);
      default:
        return leaderboard;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted">#{rank}</span>;
    }
  };

  const getScoreForTab = (entry: any) => {
    switch (activeTab) {
      case 'streaks':
        return `${entry.longest_streak} days`;
      case 'xp':
        return `${entry.total_xp.toLocaleString()} XP`;
      default:
        return `${entry.current_streak} days`;
    }
  };

  const tabs = [
    { id: 'friends' as const, label: 'Friends', icon: Users },
    { id: 'global' as const, label: 'Global', icon: Trophy },
    { id: 'streaks' as const, label: 'Best Streaks', icon: Target },
    { id: 'xp' as const, label: 'Total XP', icon: Zap },
  ];

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
        className="bg-surface max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-xl font-bold">Leaderboard</h2>
                <p className="text-sm text-muted">Celebrate progress together</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* My Rank */}
          {myRank && activeTab !== 'friends' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/30 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">#{myRank}</span>
                </div>
                <div>
                  <p className="font-medium">Your Rank</p>
                  <p className="text-xs text-muted">Keep it up!</p>
                </div>
                <TrendingUp className="w-4 h-4 text-accent ml-auto" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {!isSignedIn ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">Sign in to see leaderboards</p>
            </div>
          ) : isLoadingLeaderboard ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted">Loading rankings...</p>
            </div>
          ) : getCurrentLeaderboard().length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted mb-2">
                {activeTab === 'friends' 
                  ? 'No friends on the leaderboard yet'
                  : 'No data available'
                }
              </p>
              {activeTab === 'friends' && (
                <p className="text-xs text-muted">Add friends to compete together!</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {getCurrentLeaderboard().map((entry, index) => {
                const isMe = entry.user_id === user?.id;
                
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isMe
                        ? 'bg-accent/10 border border-accent/30 ring-2 ring-accent/20'
                        : 'bg-surface-alt hover:bg-surface-alt/80'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {entry.avatar_url ? (
                        <img 
                          src={entry.avatar_url} 
                          alt={entry.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-medium text-accent">
                          {entry.display_name[0]}
                        </span>
                      )}
                    </div>

                    {/* Name & Stats */}
                    <div className="flex-1">
                      <p className={`font-medium ${isMe ? 'text-accent' : ''}`}>
                        {entry.display_name}
                        {isMe && <span className="text-xs ml-2">(You)</span>}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span>Level {entry.level}</span>
                        <span>{entry.current_streak} day streak</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="font-bold text-lg">{getScoreForTab(entry)}</p>
                      {activeTab !== 'xp' && (
                        <p className="text-xs text-muted">{entry.total_xp.toLocaleString()} XP</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-surface-alt border-t border-border text-center">
          <p className="text-xs text-muted">
            Rankings update in real-time • Keep building streaks together! 🚀
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
