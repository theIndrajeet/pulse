import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, UserPlus, Users, Mail, Check, XIcon, Search, Heart } from 'lucide-react';
import { useSocialStore } from '../stores/socialStore';
import { useAuthStore } from '../stores/authStore';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [addFriendMessage, setAddFriendMessage] = useState('');

  const {
    friends,
    pendingFriendRequests,
    isLoadingFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    loadFriends,
    loadPendingRequests,
    subscribeToFriendRequests
  } = useSocialStore();

  const { isSignedIn } = useAuthStore();

  useEffect(() => {
    if (isOpen && isSignedIn) {
      loadFriends();
      loadPendingRequests();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToFriendRequests();
      return unsubscribe;
    }
  }, [isOpen, isSignedIn, loadFriends, loadPendingRequests, subscribeToFriendRequests]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;

    setIsAddingFriend(true);
    const result = await sendFriendRequest(newFriendEmail.trim());
    
    if (result.success) {
      setNewFriendEmail('');
      setAddFriendMessage('Friend request sent! 🎉');
      setTimeout(() => setAddFriendMessage(''), 3000);
    } else {
      setAddFriendMessage(result.error || 'Failed to send request');
      setTimeout(() => setAddFriendMessage(''), 5000);
    }
    
    setIsAddingFriend(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendshipId);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'friends' as const, label: 'Friends', count: friends.length },
    { id: 'requests' as const, label: 'Requests', count: pendingFriendRequests.length },
    { id: 'add' as const, label: 'Add Friend', count: null },
  ];

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
              <Users className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-xl font-bold">Friends & Family</h2>
                <p className="text-sm text-muted">Build your support network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
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
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {!isSignedIn ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">Sign in to manage friends</p>
            </div>
          ) : (
            <>
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div>
                  {isLoadingFriends ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted">Loading friends...</p>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="text-muted mb-2">No friends yet</p>
                      <p className="text-xs text-muted">Add friends to start sharing moods and compete together!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends.map((friendship) => (
                        <div
                          key={friendship.id}
                          className="flex items-center gap-4 p-4 bg-surface-alt rounded-xl"
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                            {friendship.friend?.avatar_url ? (
                              <img 
                                src={friendship.friend.avatar_url} 
                                alt={friendship.friend.display_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-medium text-accent">
                                {friendship.friend?.display_name?.[0] || '?'}
                              </span>
                            )}
                          </div>

                          {/* Name */}
                          <div className="flex-1">
                            <p className="font-medium">{friendship.friend?.display_name || 'Unknown'}</p>
                            <p className="text-xs text-muted">
                              Friends since {new Date(friendship.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveFriend(friendship.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
                            title="Remove friend"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Friend Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  {pendingFriendRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="text-muted">No pending friend requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingFriendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center gap-4 p-4 bg-surface-alt rounded-xl border border-accent/30"
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                            {request.user?.avatar_url ? (
                              <img 
                                src={request.user.avatar_url} 
                                alt={request.user.display_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-medium text-accent">
                                {request.user?.display_name?.[0] || '?'}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <p className="font-medium">{request.user?.display_name || 'Unknown'}</p>
                            <p className="text-xs text-muted">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                              title="Accept"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                              title="Reject"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Friend Tab */}
              {activeTab === 'add' && (
                <div>
                  <form onSubmit={handleAddFriend} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Friend's Email Address
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="email"
                          value={newFriendEmail}
                          onChange={(e) => setNewFriendEmail(e.target.value)}
                          placeholder="friend@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {addFriendMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        addFriendMessage.includes('sent')
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}>
                        {addFriendMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAddingFriend || !newFriendEmail.trim()}
                      className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAddingFriend ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Send Friend Request
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 p-4 bg-surface-alt rounded-xl">
                    <h3 className="font-medium mb-2">How it works</h3>
                    <div className="space-y-2 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        Enter their email address and send a request
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        They'll get notified and can accept or decline
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        Once connected, you can see each other's moods and compete on leaderboards
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
