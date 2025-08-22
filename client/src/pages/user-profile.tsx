import { useState } from 'react';
import { Menu, ArrowLeft, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { User } from '@shared/schema';
import Sidebar from '@/components/sidebar';
import ImageModal from '@/components/image-modal';
import { Link, useParams } from 'wouter';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', title: '', type: '' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users', username],
    enabled: !!authService.getToken() && !!username,
    queryFn: async () => {
      const token = authService.getToken();
      const response = await fetch(`/api/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('User not found');
      return response.json();
    }
  });

  const openImageModal = (type: 'profile' | 'cover') => {
    if (type === 'profile' && user?.profilePicture) {
      setImageModal({
        isOpen: true,
        url: user.profilePicture,
        title: `${user.name}'s Profile Picture`,
        type: 'profile'
      });
    } else if (type === 'cover' && user?.coverPhoto) {
      setImageModal({
        isOpen: true,
        url: user.coverPhoto,
        title: `${user.name}'s Cover Photo`,
        type: 'cover'
      });
    }
  };

  const shareProfile = () => {
    const url = `${window.location.origin}/profile/${username}`;
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="glassmorphism rounded-2xl p-8 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-dark-tertiary rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-dark-tertiary rounded mb-2"></div>
            <div className="h-4 bg-dark-tertiary rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="glassmorphism rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-gray-400 mb-6">The user you're looking for doesn't exist or may have been deactivated.</p>
          <Link href="/database">
            <Button className="gradient-blue-emerald text-white">
              <ArrowLeft className="mr-2" size={16} />
              Back to Database
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/database">
                <Button
                  variant="outline"
                  className="bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary"
                  data-testid="button-back-to-database"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Database
                </Button>
              </Link>
              <h2 className="text-2xl font-bold text-white" data-testid="user-profile-title">
                {user.name}'s Profile
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={shareProfile}
                className="bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary"
                data-testid="button-share-profile"
              >
                <ExternalLink className="mr-2" size={16} />
                Share Profile
              </Button>
              <Button
                className="bg-accent-blue hover:bg-accent-blue/80 text-white"
                data-testid="button-send-message"
              >
                <MessageCircle className="mr-2" size={16} />
                Send Message
              </Button>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="p-6">
          <div className="glassmorphism rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Cover Photo */}
            <div 
              className="h-64 relative cursor-pointer"
              onClick={() => openImageModal('cover')}
              data-testid="cover-photo-section"
            >
              {user.coverPhoto ? (
                <img 
                  src={user.coverPhoto} 
                  alt={`${user.name}'s cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-blue-emerald flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-3xl font-bold mb-2">{user.name}</h3>
                    <p className="text-xl opacity-90">@{user.username}</p>
                  </div>
                </div>
              )}
              {user.coverPhoto && (
                <div className="absolute bottom-4 left-6 text-white">
                  <h3 className="text-3xl font-bold mb-1" data-testid="user-name-overlay">
                    {user.name}
                  </h3>
                  <p className="text-xl opacity-90" data-testid="user-username-overlay">
                    @{user.username}
                  </p>
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="p-8 relative">
              <div className="absolute -top-20 left-8">
                <div 
                  className="w-32 h-32 gradient-emerald-amber rounded-full border-4 border-dark-secondary flex items-center justify-center cursor-pointer"
                  onClick={() => openImageModal('profile')}
                  data-testid="profile-picture-section"
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-white font-bold text-2xl">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-40">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2" data-testid="user-name">
                    {user.name}
                  </h1>
                  <p className="text-xl text-accent-blue mb-4" data-testid="user-username">
                    @{user.username}
                  </p>
                  <p className="text-gray-400" data-testid="user-email">
                    {user.email}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Academic Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Class of:</span>
                          <span className="text-white font-medium" data-testid="user-class-of">
                            {user.classOf}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Clan:</span>
                          <span className="text-white font-medium" data-testid="user-clan">
                            {user.clan}
                          </span>
                        </div>
                        {user.favoriteTeacher && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Favorite Teacher:</span>
                            <span className="text-white font-medium" data-testid="user-favorite-teacher">
                              {user.favoriteTeacher}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                      <div className="space-y-2">
                        {user.hobby && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Hobby:</span>
                            <span className="text-white font-medium" data-testid="user-hobby">
                              {user.hobby}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profile URL:</span>
                          <span className="text-accent-blue text-sm" data-testid="user-profile-url">
                            {typeof window !== 'undefined' && window.location.origin}/profile/{user.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                    <p className="text-gray-300 leading-relaxed" data-testid="user-bio">
                      {user.bio}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-700 pt-6">
                  <p className="text-gray-400 text-sm">
                    Member since {new Date(user.createdAt || '').getFullYear() || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="lg:ml-64 bg-dark-secondary py-4 px-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Powered by John Reese</p>
          <p className="text-gray-500 text-xs">©#OurLadyOfFatimaAlumni</p>
        </div>
      </footer>

      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, url: '', title: '', type: '' })}
        imageUrl={imageModal.url}
        title={imageModal.title}
        author={user.name}
      />
    </div>
  );
}
