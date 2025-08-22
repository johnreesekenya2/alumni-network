
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    bio: '',
    favoriteTeacher: '',
    hobby: '',
    classOf: '',
    clan: ''
  });
  const { toast } = useToast();

  const years = Array.from({ length: 26 }, (_, i) => (2024 - i).toString());
  const clans = ['G-CLAN', 'V-CLAN', 'W-CLAN', 'P-CLAN', 'L-CLAN'];

  const setupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = authService.getToken();
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile has been set up successfully.",
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl border border-gray-700/50 p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Class of
            </label>
            <Select value={formData.classOf} onValueChange={(value) => setFormData({...formData, classOf: value})}>
              <SelectTrigger className="w-full bg-dark-tertiary border border-gray-600 text-white">
                <SelectValue placeholder="Select your graduation year" />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                {years.map(year => (
                  <SelectItem key={year} value={year}>Class of {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Clan
            </label>
            <Select value={formData.clan} onValueChange={(value) => setFormData({...formData, clan: value})}>
              <SelectTrigger className="w-full bg-dark-tertiary border border-gray-600 text-white">
                <SelectValue placeholder="Select your clan" />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                {clans.map(clan => (
                  <SelectItem key={clan} value={clan}>{clan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Bio
            </label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-dark-tertiary border border-gray-600 text-white placeholder-gray-400"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Favorite Teacher
            </label>
            <Input
              type="text"
              value={formData.favoriteTeacher}
              onChange={(e) => setFormData({...formData, favoriteTeacher: e.target.value})}
              className="w-full bg-dark-tertiary border border-gray-600 text-white placeholder-gray-400"
              placeholder="Who was your favorite teacher?"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Hobby
            </label>
            <Input
              type="text"
              value={formData.hobby}
              onChange={(e) => setFormData({...formData, hobby: e.target.value})}
              className="w-full bg-dark-tertiary border border-gray-600 text-white placeholder-gray-400"
              placeholder="What's your favorite hobby?"
            />
          </div>

          <Button
            type="submit"
            disabled={setupMutation.isPending}
            className="w-full gradient-blue-emerald hover:opacity-80 text-white py-3 rounded-lg transition-all duration-300"
          >
            {setupMutation.isPending ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
