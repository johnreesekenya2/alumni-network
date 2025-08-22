import { useState, useEffect } from 'react';
import { Menu, Bell, Edit, Camera, X, User, GraduationCap, MapPin, Users, Phone, Mail, Calendar, Upload, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { User as SchemaUser } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/sidebar';
import ImageModal from '@/components/image-modal';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', title: '', type: '' });
  const [user, setUser] = useState<SchemaUser | null>(null);
  const [editModal, setEditModal] = useState({ isOpen: false, field: '', value: '' });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadModal, setUploadModal] = useState({ isOpen: false, type: '' });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const authState = authService.getState();
    setUser(authState.user);
  }, []);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/profile/me'],
    enabled: !!authService.getToken(),
    queryFn: async () => {
      const token = authService.getToken();
      const response = await fetch('/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  const currentUser = profile || user;

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = authService.getToken();
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/me'] });
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
      setEditModal({ isOpen: false, field: '', value: '' });
      setUploadModal({ isOpen: false, type: '' });
      setProfilePicture(null);
      setCoverPhoto(null);
      setProfilePreview('');
      setCoverPreview('');
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEditField = (field: string, currentValue: string) => {
    setEditModal({ isOpen: true, field, value: currentValue });
  };

  const handleSaveField = () => {
    const formData = new FormData();
    formData.append(editModal.field, editModal.value);
    updateProfileMutation.mutate(formData);
  };

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setUploadModal({ isOpen: true, type });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfilePicture(file);
        const reader = new FileReader();
        reader.onload = () => setProfilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setCoverPhoto(file);
        const reader = new FileReader();
        reader.onload = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageSave = () => {
    const formData = new FormData();
    if (uploadModal.type === 'profile' && profilePicture) {
      formData.append('profilePicture', profilePicture);
    } else if (uploadModal.type === 'cover' && coverPhoto) {
      formData.append('coverPhoto', coverPhoto);
    }
    updateProfileMutation.mutate(formData);
  };

  const openImageModal = (type: 'profile' | 'cover') => {
    if (type === 'profile' && currentUser?.profilePicture) {
      setImageModal({
        isOpen: true,
        url: currentUser.profilePicture,
        title: 'Profile Picture',
        type: 'profile'
      });
    } else if (type === 'cover' && currentUser?.coverPhoto) {
      setImageModal({
        isOpen: true,
        url: currentUser.coverPhoto,
        title: 'Cover Photo',
        type: 'cover'
      });
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'like',
      message: 'Sarah Johnson liked your post',
      time: '2 hours ago',
      icon: '❤️'
    },
    {
      id: 2,
      type: 'comment',
      message: 'Mike Chen commented on your photo',
      time: '5 hours ago',
      icon: '💬'
    },
    {
      id: 3,
      type: 'friend',
      message: 'Lisa Rodriguez sent you a friend request',
      time: '1 day ago',
      icon: '👥'
    }
  ];

  // Placeholder for loader, would be conditionally rendered based on data fetching status
  const isLoading = isProfileLoading;

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
            <h2 className="text-2xl font-bold text-white" data-testid="dashboard-title">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors" data-testid="button-notifications">
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-blue rounded-full flex items-center justify-center text-xs text-white">3</span>
              </button>
              <div
                className="w-10 h-10 gradient-blue-emerald rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => openImageModal('profile')}
                data-testid="header-profile-picture"
              >
                {currentUser?.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-white font-bold text-sm">
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Cover Photo */}
            <div
              className="h-48 gradient-blue-emerald relative cursor-pointer group"
              data-testid="cover-photo-section"
            >
              {currentUser?.coverPhoto ? (
                <img
                  src={currentUser.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onClick={() => openImageModal('cover')}
                />
              ) : (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">No Cover Photo</h3>
                    <p className="text-lg opacity-90">Click to add one</p>
                  </div>
                </div>
              )}
              <Button
                onClick={() => handleImageUpload('cover')}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="button-edit-cover"
              >
                <Camera size={16} />
              </Button>
              <div className="absolute bottom-4 left-6 text-white">
                <h3 className="text-2xl font-bold" data-testid="user-name">
                  {currentUser?.name || 'User Name'}
                </h3>
                <p className="text-lg opacity-90" data-testid="user-username">
                  @{currentUser?.username || 'username'}
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 relative">
              <div className="absolute -top-16 left-6">
                <div
                  className="w-24 h-24 gradient-emerald-amber rounded-full border-4 border-dark-secondary flex items-center justify-center cursor-pointer group relative"
                  data-testid="profile-picture-section"
                >
                  {currentUser?.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                      onClick={() => openImageModal('profile')}
                    />
                  ) : (
                    <div className="text-white font-bold text-xl">
                      {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </div>
                  )}
                  <Button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute -bottom-2 -right-2 bg-accent-blue hover:bg-accent-blue/80 text-white p-1 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-edit-profile-picture"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
              </div>

              <div className="ml-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="glassmorphism rounded-xl border border-gray-700/50 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="mr-2 text-accent-blue" size={18} />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Name</label>
                          <p className="text-white text-sm font-medium">{currentUser?.name || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-blue cursor-pointer transition-colors" size={14} onClick={() => handleEditField('name', currentUser?.name || '')}/>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Email</label>
                          <p className="text-white text-sm font-medium">{currentUser?.email || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-blue cursor-pointer transition-colors" size={14} onClick={() => handleEditField('email', currentUser?.email || '')}/>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Phone</label>
                          <p className="text-white text-sm font-medium">{currentUser?.phone || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-blue cursor-pointer transition-colors" size={14} onClick={() => handleEditField('phone', currentUser?.phone || '')}/>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="glassmorphism rounded-xl border border-gray-700/50 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <GraduationCap className="mr-2 text-accent-emerald" size={18} />
                      Academic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Class Of</label>
                          <p className="text-white text-sm font-medium">{currentUser?.classOf || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-emerald cursor-pointer transition-colors" size={14} onClick={() => handleEditField('classOf', currentUser?.classOf || '')}/>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Clan</label>
                          <p className="text-white text-sm font-medium">{currentUser?.clan || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-emerald cursor-pointer transition-colors" size={14} onClick={() => handleEditField('clan', currentUser?.clan || '')}/>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Current Occupation</label>
                          <p className="text-white text-sm font-medium">{currentUser?.currentOccupation || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-emerald cursor-pointer transition-colors" size={14} onClick={() => handleEditField('currentOccupation', currentUser?.currentOccupation || '')}/>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="glassmorphism rounded-xl border border-gray-700/50 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <MapPin className="mr-2 text-accent-amber" size={18} />
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Current City</label>
                          <p className="text-white text-sm font-medium">{currentUser?.currentCity || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-amber cursor-pointer transition-colors" size={14} onClick={() => handleEditField('currentCity', currentUser?.currentCity || '')}/>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Current Country</label>
                          <p className="text-white text-sm font-medium">{currentUser?.currentCountry || 'Not specified'}</p>
                        </div>
                        <Edit2 className="text-gray-500 group-hover:text-accent-amber cursor-pointer transition-colors" size={14} onClick={() => handleEditField('currentCountry', currentUser?.currentCountry || '')}/>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="glassmorphism rounded-xl border border-gray-700/50 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="mr-2 text-accent-pink" size={18} />
                      About Me
                    </h3>
                    <div className="flex items-start justify-between group">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Bio</label>
                        <p className="text-white text-sm">{currentUser?.bio || 'No bio provided yet.'}</p>
                      </div>
                      <Edit2 className="text-gray-500 group-hover:text-accent-pink cursor-pointer transition-colors mt-5" size={14} onClick={() => handleEditField('bio', currentUser?.bio || '')}/>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-gray-400 text-sm">
                    <span className="text-accent-blue">
                      {typeof window !== 'undefined' && window.location.origin}/profile/{currentUser?.username || 'username'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-bold text-white mb-6" data-testid="recent-activities-title">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-dark-tertiary/50 rounded-lg"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{activity.message}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
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
        author={currentUser?.name}
      />

      {/* Edit Field Modal */}
      <Dialog open={editModal.isOpen} onOpenChange={(open) => setEditModal({ ...editModal, isOpen: open })}>
        <DialogContent className="glassmorphism border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">Edit {editModal.field === 'classOf' ? 'Class of' : editModal.field === 'favoriteTeacher' ? 'Favorite Teacher' : editModal.field.charAt(0).toUpperCase() + editModal.field.slice(1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editModal.field === 'bio' ? (
              <Textarea
                value={editModal.value}
                onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white placeholder-gray-400"
                placeholder={`Enter your ${editModal.field}`}
                rows={4}
                data-testid="textarea-edit-bio"
              />
            ) : editModal.field === 'classOf' ? (
              <Select value={editModal.value} onValueChange={(value) => setEditModal({ ...editModal, value })}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white" data-testid="select-edit-class-of">
                  <SelectValue placeholder="Select Class of" />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-gray-600">
                  {Array.from({ length: 26 }, (_, i) => 1999 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : editModal.field === 'clan' ? (
              <Select value={editModal.value} onValueChange={(value) => setEditModal({ ...editModal, value })}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white" data-testid="select-edit-clan">
                  <SelectValue placeholder="Select Clan" />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-gray-600">
                  <SelectItem value="G-CLAN">G-CLAN</SelectItem>
                  <SelectItem value="V-CLAN">V-CLAN</SelectItem>
                  <SelectItem value="W-CLAN">W-CLAN</SelectItem>
                  <SelectItem value="P-CLAN">P-CLAN</SelectItem>
                  <SelectItem value="L-CLAN">L-CLAN</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={editModal.value}
                onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white placeholder-gray-400"
                placeholder={`Enter your ${editModal.field}`}
                data-testid={`input-edit-${editModal.field}`}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditModal({ isOpen: false, field: '', value: '' })}
                className="border-gray-600 text-gray-300 hover:bg-gray-600"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveField}
                disabled={updateProfileMutation.isPending}
                className="bg-accent-blue hover:bg-accent-blue/80 text-white"
                data-testid="button-save-edit"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Image Modal */}
      <Dialog open={uploadModal.isOpen} onOpenChange={(open) => setUploadModal({ ...uploadModal, isOpen: open })}>
        <DialogContent className="glassmorphism border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">Upload {uploadModal.type === 'profile' ? 'Profile Picture' : 'Cover Photo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-gray-300 mb-2 block">
                Choose Image
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, uploadModal.type as 'profile' | 'cover')}
                className="bg-dark-tertiary border-gray-600 text-white"
                data-testid="input-upload-image"
              />
            </div>

            {/* Image Preview */}
            {(uploadModal.type === 'profile' && profilePreview) || (uploadModal.type === 'cover' && coverPreview) ? (
              <div className="text-center">
                <img
                  src={uploadModal.type === 'profile' ? profilePreview : coverPreview}
                  alt="Preview"
                  className={`mx-auto border border-gray-600 ${
                    uploadModal.type === 'profile'
                      ? 'w-32 h-32 rounded-full object-cover'
                      : 'w-full h-48 rounded-lg object-cover'
                  }`}
                  data-testid="image-preview"
                />
              </div>
            ) : null}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadModal({ isOpen: false, type: '' });
                  setProfilePicture(null);
                  setCoverPhoto(null);
                  setProfilePreview('');
                  setCoverPreview('');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-600"
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageSave}
                disabled={updateProfileMutation.isPending || (!profilePicture && !coverPhoto)}
                className="bg-accent-blue hover:bg-accent-blue/80 text-white"
                data-testid="button-save-upload"
              >
                {updateProfileMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}