import { useState } from 'react';
import { Menu, Image as ImageIcon, Video, File, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/sidebar';
import PostModal from '@/components/post-modal';
import { useLocation } from 'wouter';

export default function Community() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [postModal, setPostModal] = useState({ isOpen: false, post: null });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    enabled: !!authService.getToken(),
    queryFn: async () => {
      const token = authService.getToken();
      const response = await fetch('/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; file?: File }) => {
      const token = authService.getToken();
      const formData = new FormData();
      if (data.content) formData.append('content', data.content);
      if (data.file) formData.append('media', data.file);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setPostContent('');
      setSelectedFile(null);
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';

    if (type === 'image') {
      input.accept = 'image/*';
    } else if (type === 'video') {
      input.accept = 'video/*';
    } else {
      input.accept = '*';
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select a file smaller than 10MB.",
            variant: "destructive",
          });
          return;
        }
        setSelectedFile(file);
      }
    };

    input.click();
  };

  const handleSubmitPost = () => {
    if (!postContent.trim() && !selectedFile) {
      toast({
        title: "Empty post",
        description: "Please add some content or attach a file.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: postContent,
      file: selectedFile || undefined
    });
  };

  const openPostModal = (post: any) => {
    setPostModal({ isOpen: true, post });
  };

  const getMediaPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-dark-secondary p-3 rounded-lg border border-gray-700"
        onClick={() => setSidebarOpen(true)}
        data-testid="button-toggle-sidebar"
      >
        <Menu className="text-white" size={20} />
      </button>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="glassmorphism border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white" data-testid="community-title">Community</h2>
        </header>

        <div className="p-6 space-y-6">
          {/* Create Post */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4" data-testid="create-post-title">
              Share with the Community
            </h3>
            <div className="space-y-4">
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none"
                rows={3}
                placeholder="What's on your mind?"
                data-testid="textarea-post-content"
              />

              {selectedFile && (
                <div className="p-4 bg-dark-tertiary rounded-lg" data-testid="selected-file-preview">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img
                            src={getMediaPreview(selectedFile) || ''}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-accent-blue rounded-lg flex items-center justify-center">
                          <File className="text-white" size={24} />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-remove-file"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleFileSelect('image')}
                    className="flex items-center text-gray-400 hover:text-accent-blue transition-colors"
                    data-testid="button-add-photo"
                  >
                    <ImageIcon className="mr-2" size={20} />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileSelect('video')}
                    className="flex items-center text-gray-400 hover:text-accent-emerald transition-colors"
                    data-testid="button-add-video"
                  >
                    <Video className="mr-2" size={20} />
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileSelect('file')}
                    className="flex items-center text-gray-400 hover:text-accent-amber transition-colors"
                    data-testid="button-add-file"
                  >
                    <File className="mr-2" size={20} />
                    File
                  </button>
                </div>
                <Button
                  onClick={handleSubmitPost}
                  disabled={createPostMutation.isPending}
                  className="gradient-blue-emerald hover:opacity-80 text-white px-6 py-2 rounded-lg transition-all duration-300"
                  data-testid="button-create-post"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                <File className="inline mr-1" size={12} />
                Maximum file size: 10MB
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="glassmorphism rounded-2xl border border-gray-700/50 p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-dark-tertiary rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-dark-tertiary rounded mb-2"></div>
                      <div className="h-3 bg-dark-tertiary rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-dark-tertiary rounded mb-4"></div>
                  <div className="h-64 bg-dark-tertiary rounded mb-4"></div>
                  <div className="flex space-x-6">
                    <div className="h-6 bg-dark-tertiary rounded w-16"></div>
                    <div className="h-6 bg-dark-tertiary rounded w-16"></div>
                    <div className="h-6 bg-dark-tertiary rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg" data-testid="no-posts-message">
                  No posts yet. Be the first to share something with the community!
                </p>
              </div>
            ) : (
              posts.map((post: any) => (
                <div 
                  key={post.id} 
                  className="glassmorphism rounded-2xl border border-gray-700/50 p-6"
                  data-testid={`post-${post.id}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 gradient-blue-emerald rounded-full flex items-center justify-center mr-4">
                      {post.user?.profilePicture ? (
                        <img 
                          src={post.user.profilePicture} 
                          alt={post.user.name}
                          className="w-full h-full rounded-full object-cover"
                          data-testid={`post-author-avatar-${post.id}`}
                        />
                      ) : (
                        <div className="text-white font-bold text-sm">
                          {post.user?.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold" data-testid={`post-author-${post.id}`}>
                        {post.user?.name}
                      </h4>
                      <p className="text-gray-400 text-sm" data-testid={`post-timestamp-${post.id}`}>
                        {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {post.content && (
                    <p className="text-gray-300 mb-4" data-testid={`post-content-${post.id}`}>
                      {post.content}
                    </p>
                  )}

                  {post.mediaUrl && (
                    <div 
                      className="mb-4 cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => openPostModal(post)}
                      data-testid={`post-media-${post.id}`}
                    >
                      {post.mediaType === 'image' ? (
                        <img
                          src={post.mediaUrl}
                          alt="Post content"
                          className="w-full h-64 object-cover"
                        />
                      ) : post.mediaType === 'video' ? (
                        <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                          <Video className="text-6xl text-white opacity-75" size={96} />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-dark-tertiary rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <File className="text-4xl text-gray-400 mb-2 mx-auto" size={48} />
                            <p className="text-gray-300">{post.fileName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                    <div className="flex space-x-6">
                      <button className="flex items-center text-gray-400 hover:text-accent-blue transition-colors" data-testid={`button-like-${post.id}`}>
                        <span className="mr-2">❤️</span>
                        {post.reactions?.filter((r: any) => r.type === 'like').length || 0}
                      </button>
                      <button className="flex items-center text-gray-400 hover:text-accent-emerald transition-colors" data-testid={`button-comment-${post.id}`}>
                        <span className="mr-2">💬</span>
                        {post.comments?.length || 0}
                      </button>
                      {post.mediaUrl && (
                        <button className="flex items-center text-gray-400 hover:text-accent-amber transition-colors" data-testid={`button-download-${post.id}`}>
                          <span className="mr-2">⬇️</span>
                          Download
                        </button>
                      )}
                    </div>
                    <Button
                      variant="link"
                      onClick={() => {
                        setLocation(`/discussion/${post.id}`);
                      }}
                      className="text-accent-blue hover:text-accent-emerald transition-colors text-sm p-0"
                      data-testid={`button-join-discussion-${post.id}`}
                    >
                      Click to join discussion
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="lg:ml-64 bg-dark-secondary py-4 px-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Powered by John Reese</p>
          <p className="text-gray-500 text-xs">©#OurLadyOfFatimaAlumni</p>
        </div>
      </footer>

      <PostModal
        isOpen={postModal.isOpen}
        onClose={() => setPostModal({ isOpen: false, post: null })}
        post={postModal.post}
      />
    </div>
  );
}