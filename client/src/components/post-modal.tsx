import { X, Heart, Smile, Frown, Download, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const reactions = [
    { type: 'like', icon: Heart, label: 'Like', color: 'hover:text-red-400' },
    { type: 'love', icon: Heart, label: 'Love', color: 'hover:text-pink-400' },
    { type: 'laugh', icon: Smile, label: 'Laugh', color: 'hover:text-yellow-400' },
    { type: 'sad', icon: Frown, label: 'Sad', color: 'hover:text-blue-400' },
  ];

  const handleReaction = async (type: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        setSelectedReaction(type);
        // Reload the page to show updated reaction counts
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const token = authService.getToken();
        if (!token) return;

        const response = await fetch(`/api/posts/${post.id}/comments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newComment.trim() })
        });

        if (response.ok) {
          setNewComment('');
          // Reload the page to show the new comment
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleDownload = () => {
    if (post.mediaUrl) {
      const link = document.createElement('a');
      link.href = post.mediaUrl;
      link.download = post.fileName || 'download';
      link.click();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="post-modal-overlay"
    >
      <div 
        className="bg-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="post-modal-content"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 gradient-blue-emerald rounded-full flex items-center justify-center mr-4">
                {post.user?.profilePicture ? (
                  <img 
                    src={post.user.profilePicture} 
                    alt={post.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-white font-bold text-sm">
                    {post.user?.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold" data-testid="post-author">
                  {post.user?.name}
                </h4>
                <p className="text-gray-400 text-sm" data-testid="post-timestamp">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white text-2xl"
              data-testid="button-close-post-modal"
            >
              <X />
            </button>
          </div>
          
          <div className="mb-6">
            {post.content && (
              <p className="text-gray-300 mb-4" data-testid="post-content">{post.content}</p>
            )}
            
            {post.mediaUrl && (
              <div className="rounded-lg overflow-hidden">
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="Post content"
                    className="w-full h-auto"
                    data-testid="post-media-image"
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-auto"
                    data-testid="post-media-video"
                  />
                ) : post.mediaType === 'audio' ? (
                  <audio
                    src={post.mediaUrl}
                    controls
                    className="w-full"
                    data-testid="post-media-audio"
                  />
                ) : (
                  <div className="bg-dark-tertiary p-4 rounded-lg flex items-center justify-center">
                    <p className="text-gray-300" data-testid="post-media-file">
                      {post.fileName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Reactions and Download */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center space-x-6 mb-6">
              {reactions.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`flex items-center text-gray-400 transition-colors ${reaction.color} ${
                    selectedReaction === reaction.type ? 'text-accent-blue' : ''
                  }`}
                  data-testid={`reaction-${reaction.type}`}
                >
                  <reaction.icon className="mr-2" size={20} />
                  {reaction.label}
                </button>
              ))}
              {post.mediaUrl && (
                <button 
                  onClick={handleDownload}
                  className="flex items-center text-gray-400 hover:text-accent-amber transition-colors"
                  data-testid="button-download"
                >
                  <Download className="mr-2" size={20} />
                  Download
                </button>
              )}
            </div>
            
            {/* Comments Section */}
            <div className="space-y-4 mb-6">
              {post.comments?.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 gradient-emerald-amber rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.user?.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture} 
                        alt={comment.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-xs font-bold">
                        {comment.user?.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-dark-tertiary rounded-lg p-3">
                      <h5 className="text-white font-medium text-sm">{comment.user?.name}</h5>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-blue-emerald rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-white text-xs font-bold">
                  {post.currentUser?.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
              <div className="flex-1 flex space-x-2">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-dark-tertiary border-gray-600 text-white placeholder-gray-400 focus:border-accent-blue focus:ring-accent-blue"
                  placeholder="Write a comment..."
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-accent-blue hover:bg-accent-blue/80 text-white"
                  data-testid="button-add-comment"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
