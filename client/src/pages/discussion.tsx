
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { X, Heart, Smile, Frown, Download, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Discussion() {
  const { postId } = useParams<{ postId: string }>();
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    enabled: !!postId && !!authService.getToken(),
    queryFn: async () => {
      const token = authService.getToken();
      const response = await fetch(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    }
  });

  const reactions = [
    { type: 'like', icon: Heart, label: 'Like', color: 'hover:text-red-400' },
    { type: 'love', icon: Heart, label: 'Love', color: 'hover:text-pink-400' },
    { type: 'laugh', icon: Smile, label: 'Laugh', color: 'hover:text-yellow-400' },
    { type: 'sad', icon: Frown, label: 'Sad', color: 'hover:text-blue-400' },
  ];

  const addReactionMutation = useMutation({
    mutationFn: async (type: string) => {
      const token = authService.getToken();
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      toast({
        title: "Reaction added!",
        description: "Your reaction has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add reaction",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = authService.getToken();
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      setNewComment('');
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add comment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleReaction = (type: string) => {
    setSelectedReaction(type);
    addReactionMutation.mutate(type);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleDownload = () => {
    if (post?.mediaUrl) {
      const link = document.createElement('a');
      link.href = post.mediaUrl;
      link.download = post.fileName || 'download';
      link.click();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-white text-lg">Loading discussion...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Post not found</div>
          <Button onClick={() => setLocation('/community')} className="bg-accent-blue hover:bg-accent-blue/80">
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary">
      {/* Header */}
      <header className="glassmorphism border-b border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setLocation('/community')}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Community
          </Button>
          <h1 className="text-2xl font-bold text-white">Discussion</h1>
        </div>
      </header>

      {/* Discussion Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="glassmorphism rounded-2xl border border-gray-700/50 p-8">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 gradient-blue-emerald rounded-full flex items-center justify-center mr-6">
                {post.user?.profilePicture ? (
                  <img 
                    src={post.user.profilePicture} 
                    alt={post.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-white font-bold text-lg">
                    {post.user?.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl" data-testid="post-author">
                  {post.user?.name}
                </h2>
                <p className="text-gray-400" data-testid="post-timestamp">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="mb-8">
            {post.content && (
              <p className="text-gray-300 mb-6 text-lg" data-testid="post-content">{post.content}</p>
            )}
            
            {post.mediaUrl && (
              <div className="rounded-lg overflow-hidden mb-6">
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="Post content"
                    className="w-full h-auto max-h-96 object-contain"
                    data-testid="post-media-image"
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-auto max-h-96"
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
                  <div className="bg-dark-tertiary p-6 rounded-lg flex items-center justify-center">
                    <p className="text-gray-300 text-lg" data-testid="post-media-file">
                      📎 {post.fileName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Reactions and Download */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex items-center space-x-8 mb-8">
              {reactions.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  disabled={addReactionMutation.isPending}
                  className={`flex items-center text-gray-400 transition-colors ${reaction.color} ${
                    selectedReaction === reaction.type ? 'text-accent-blue' : ''
                  }`}
                  data-testid={`reaction-${reaction.type}`}
                >
                  <reaction.icon className="mr-2" size={24} />
                  <span className="text-lg">{reaction.label}</span>
                  <span className="ml-2 text-sm">
                    ({post.reactions?.filter((r: any) => r.type === reaction.type).length || 0})
                  </span>
                </button>
              ))}
              {post.mediaUrl && (
                <button 
                  onClick={handleDownload}
                  className="flex items-center text-gray-400 hover:text-accent-amber transition-colors"
                  data-testid="button-download"
                >
                  <Download className="mr-2" size={24} />
                  <span className="text-lg">Download</span>
                </button>
              )}
            </div>
            
            {/* Comments Section */}
            <div className="space-y-6 mb-8">
              <h3 className="text-white font-semibold text-xl">
                Comments ({post.comments?.length || 0})
              </h3>
              
              {post.comments?.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-emerald-amber rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.user?.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture} 
                        alt={comment.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-sm font-bold">
                        {comment.user?.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-dark-tertiary rounded-lg p-4">
                      <h5 className="text-white font-medium mb-2">{comment.user?.name}</h5>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-blue-emerald rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-white text-sm font-bold">
                  You
                </div>
              </div>
              <div className="flex-1 flex space-x-3">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="bg-dark-tertiary border-gray-600 text-white placeholder-gray-400 focus:border-accent-blue focus:ring-accent-blue"
                  placeholder="Write a comment..."
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="bg-accent-blue hover:bg-accent-blue/80 text-white px-6"
                  data-testid="button-add-comment"
                >
                  {addCommentMutation.isPending ? '...' : <Send size={16} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
