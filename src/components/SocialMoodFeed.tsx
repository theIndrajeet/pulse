import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Users, Share2, Clock } from 'lucide-react';
import { useSocialStore } from '../stores/socialStore';
import { useAuthStore } from '../stores/authStore';

const moodEmojis = {
  '-2': '⛈️',
  '-1': '☁️',
  '0': '⛅',
  '1': '☀️',
  '2': '🌟'
} as const;

const energyEmojis = {
  'low': '🔋',
  'med': '🔋🔋',
  'high': '🔋🔋🔋'
} as const;

export default function SocialMoodFeed() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  
  // Social store
  const {
    friendsMoods,
    isLoadingMoods,
    loadFriendsMoods,
    shareMood,
    subscribeToFriendsMoods
  } = useSocialStore();
  
  // Auth store
  const { isSignedIn } = useAuthStore();

  // Mood sharing form state
  const [selectedMood, setSelectedMood] = useState<-2 | -1 | 0 | 1 | 2 | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<'low' | 'med' | 'high' | null>(null);
  const [moodMessage, setMoodMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      loadFriendsMoods();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToFriendsMoods();
      return unsubscribe;
    }
  }, [isSignedIn, loadFriendsMoods, subscribeToFriendsMoods]);

  const handleShareMood = async () => {
    if (!selectedMood || !selectedEnergy) return;
    
    setIsSharing(true);
    const success = await shareMood(selectedMood, selectedEnergy, moodMessage || undefined);
    
    if (success) {
      setSelectedMood(null);
      setSelectedEnergy(null);
      setMoodMessage('');
      setShowShareForm(false);
      // Mood will be reloaded automatically via subscription
    }
    
    setIsSharing(false);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return time.toLocaleDateString();
  };

  if (!isSignedIn) {
    return (
      <div className="card p-4 text-center">
        <Users className="w-8 h-8 text-muted mx-auto mb-2" />
        <p className="text-sm text-muted">Sign in to share moods with friends & family</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent" />
          <h3 className="font-medium">Mood Circle</h3>
          {friendsMoods.length > 0 && (
            <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs">
              {friendsMoods.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors text-accent"
            title="Share your mood"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
            title={isExpanded ? 'Show less' : 'Show all'}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Mood Form */}
      {showShareForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-surface-alt rounded-xl border border-border"
        >
          <h4 className="font-medium mb-3">Share your current mood</h4>
          
          {/* Mood Selection */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
            <div className="flex gap-2">
              {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(parseInt(mood) as -2 | -1 | 0 | 1 | 2)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedMood === parseInt(mood)
                      ? 'bg-accent/20 border-accent scale-110'
                      : 'bg-surface hover:bg-surface-alt border-border'
                  } border-2`}
                >
                  <span className="text-2xl">{moodEmojis[mood]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Selection */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-2 block">Energy level?</label>
            <div className="flex gap-2">
              {(Object.keys(energyEmojis) as Array<keyof typeof energyEmojis>).map((energy) => (
                <button
                  key={energy}
                  onClick={() => setSelectedEnergy(energy)}
                  className={`flex-1 p-3 rounded-xl transition-all ${
                    selectedEnergy === energy
                      ? 'bg-accent/20 border-accent'
                      : 'bg-surface hover:bg-surface-alt border-border'
                  } border`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{energyEmojis[energy]}</div>
                    <div className="text-xs capitalize">{energy}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div className="mb-3">
            <textarea
              value={moodMessage}
              onChange={(e) => setMoodMessage(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full p-3 rounded-lg border border-border bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Share Button */}
          <div className="flex gap-2">
            <button
              onClick={handleShareMood}
              disabled={!selectedMood || !selectedEnergy || isSharing}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isSharing ? 'Sharing...' : 'Share with friends'}
            </button>
            <button
              onClick={() => setShowShareForm(false)}
              className="px-4 py-2 text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Friends' Moods */}
      {isLoadingMoods ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted">Loading moods...</p>
        </div>
      ) : friendsMoods.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted mx-auto mb-2" />
          <p className="text-muted mb-2">No recent moods from friends</p>
          <p className="text-xs text-muted">Add friends to see their mood updates here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friendsMoods.slice(0, isExpanded ? friendsMoods.length : 3).map((mood) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 bg-surface-alt rounded-lg"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                {mood.user?.avatar_url ? (
                  <img 
                    src={mood.user.avatar_url} 
                    alt={mood.user.display_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-medium text-accent">
                    {mood.user?.display_name?.[0] || '?'}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{mood.user?.display_name || 'Anonymous'}</span>
                  <span className="text-2xl">{moodEmojis[mood.mood.toString() as keyof typeof moodEmojis]}</span>
                  <span className="text-sm">{energyEmojis[mood.energy]}</span>
                  <div className="flex items-center gap-1 text-xs text-muted ml-auto">
                    <Clock className="w-3 h-3" />
                    {formatTime(mood.created_at)}
                  </div>
                </div>
                
                {mood.message && (
                  <p className="text-sm text-muted italic">"{mood.message}"</p>
                )}
              </div>
            </motion.div>
          ))}

          {friendsMoods.length > 3 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-center text-sm text-accent hover:text-accent-dark py-2"
            >
              Show {friendsMoods.length - 3} more
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
