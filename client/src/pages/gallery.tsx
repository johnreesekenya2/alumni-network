import { useState, useEffect } from 'react';
import { Camera, Upload, Heart, ThumbsUp, ThumbsDown, Edit, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { Gallery, GalleryReaction, User } from '@shared/schema';

interface GalleryItemWithUser extends Gallery {
  user: Pick<User, 'id' | 'name' | 'username' | 'profilePicture'>;
  reactions: GalleryReaction[];
  userReaction?: GalleryReaction;
}

export default function GalleryPage() {
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItemWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  const currentUser = authService.getUser();

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const items = await response.json();
        setGalleryItems(items);
      } else {
        throw new Error('Failed to fetch gallery items');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load gallery",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (uploadData.file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);

      const token = authService.getToken();
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newItem = await response.json();
        setGalleryItems(prev => [newItem, ...prev]);
        setShowUploadModal(false);
        setUploadData({ title: '', description: '', file: null });
        toast({
          title: "Success",
          description: "Photo/video uploaded successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReaction = async (galleryId: string, reactionType: 'like' | 'love' | 'dislike') => {
    try {
      const token = authService.getToken();
      const response = await fetch('/api/gallery/react', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ galleryId, type: reactionType }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update the gallery items with new reaction data
        setGalleryItems(prev => prev.map(item => 
          item.id === galleryId ? { ...item, ...result } : item
        ));
      } else {
        throw new Error('Failed to react');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to react",
        variant: "destructive",
      });
    }
  };

  const getReactionCount = (reactions: GalleryReaction[], type: string) => {
    return reactions.filter(r => r.type === type).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading gallery...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Camera className="text-accent-emerald mr-3" size={32} />
            <h1 className="text-3xl font-bold text-white">Gallery</h1>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="gradient-emerald-amber hover:opacity-80 text-white font-semibold"
          >
            <Plus className="mr-2" size={20} />
            Upload Photo/Video
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="glassmorphism rounded-lg overflow-hidden border border-gray-700/50">
              {/* Media Display */}
              <div className="relative">
                {item.mediaType === 'image' ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.title || 'Gallery item'}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={item.mediaUrl}
                    controls
                    className="w-full h-64 object-cover"
                  />
                )}
                
                {/* Edit Icon for own photos */}
                {currentUser?.id === item.userId && (
                  <button className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                    <Edit size={16} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full gradient-blue-emerald flex items-center justify-center mr-3">
                    {item.user.profilePicture ? (
                      <img 
                        src={item.user.profilePicture} 
                        alt={item.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-xs font-bold">
                        {item.user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.user.name}</p>
                    <p className="text-gray-400 text-xs">@{item.user.username}</p>
                  </div>
                </div>

                {/* Title and Description */}
                {item.title && (
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                )}
                {item.description && (
                  <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                )}

                {/* Reactions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReaction(item.id, 'like')}
                      className={`flex items-center space-x-1 transition-colors ${
                        item.userReaction?.type === 'like' 
                          ? 'text-blue-400' 
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      <span className="text-sm">{getReactionCount(item.reactions, 'like')}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReaction(item.id, 'love')}
                      className={`flex items-center space-x-1 transition-colors ${
                        item.userReaction?.type === 'love' 
                          ? 'text-red-400' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart size={16} />
                      <span className="text-sm">{getReactionCount(item.reactions, 'love')}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReaction(item.id, 'dislike')}
                      className={`flex items-center space-x-1 transition-colors ${
                        item.userReaction?.type === 'dislike' 
                          ? 'text-yellow-400' 
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <ThumbsDown size={16} />
                      <span className="text-sm">{getReactionCount(item.reactions, 'dislike')}</span>
                    </button>
                  </div>
                  
                  <span className="text-gray-400 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {galleryItems.length === 0 && (
          <div className="text-center py-16">
            <Camera className="text-gray-400 mx-auto mb-4" size={64} />
            <h3 className="text-white text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share a photo or video!</p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="gradient-emerald-amber hover:opacity-80 text-white font-semibold"
            >
              <Upload className="mr-2" size={20} />
              Upload First Photo
            </Button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glassmorphism rounded-lg max-w-md w-full p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Photo/Video</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file" className="text-gray-300 mb-2 block">
                    Select File (Max 10MB)
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      file: e.target.files?.[0] || null 
                    }))}
                    className="bg-dark-tertiary border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-gray-300 mb-2 block">
                    Title (Optional)
                  </Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    className="bg-dark-tertiary border-gray-600 text-white"
                    placeholder="Add a title..."
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300 mb-2 block">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    className="bg-dark-tertiary border-gray-600 text-white"
                    placeholder="Tell us about this photo/video..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-emerald-amber hover:opacity-80 text-white"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}