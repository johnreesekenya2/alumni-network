
import { useState } from 'react';
import { Menu, Star, Send, MessageSquare, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/sidebar';

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'public' | 'private' | 'anonymous'>('public');
  const { toast } = useToast();

  const { data: publicFeedbacks = [], isLoading } = useQuery({
    queryKey: ['/api/feedback/public'],
    enabled: !!authService.getToken(),
    queryFn: async () => {
      const token = authService.getToken();
      const response = await fetch('/api/feedback/public', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      return response.json();
    }
  });

  const submitFeedback = useMutation({
    mutationFn: async ({ feedback, rating, type }: { feedback: string; rating: number; type: string }) => {
      const token = authService.getToken();
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: feedback, rating, type })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Feedback submitted successfully!' });
      setFeedback('');
      setRating(0);
      setFeedbackType('public');
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/public'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!feedback.trim() || rating === 0) {
      toast({ title: 'Error', description: 'Please provide both feedback and rating', variant: 'destructive' });
      return;
    }
    submitFeedback.mutate({ feedback: feedback.trim(), rating, type: feedbackType });
  };

  const renderStars = (currentRating: number, onClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
            onClick={() => onClick?.(star)}
          />
        ))}
      </div>
    );
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
          <h2 className="text-2xl font-bold text-white" data-testid="support-title">Support & Feedback</h2>
          <p className="text-gray-400 mt-2">Share your feedback and help us improve the platform</p>
        </header>

        <div className="p-6 space-y-6">
          {/* Submit Feedback Form */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Submit Feedback
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-10 stars)</label>
                {renderStars(rating, setRating)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Type</label>
                <Select value={feedbackType} onValueChange={(value: 'public' | 'private' | 'anonymous') => setFeedbackType(value)}>
                  <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (with your name)</SelectItem>
                    <SelectItem value="anonymous">Public (anonymous)</SelectItem>
                    <SelectItem value="private">Private (sent to admin)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  {feedbackType === 'public' && 'Your feedback will be visible to everyone with your name'}
                  {feedbackType === 'anonymous' && 'Your feedback will be visible to everyone as "Anonymous User"'}
                  {feedbackType === 'private' && 'Your feedback will be sent privately to the admin email'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none"
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitFeedback.isPending || !feedback.trim() || rating === 0}
                className="gradient-blue-emerald text-white flex items-center"
              >
                <Send className="mr-2" size={16} />
                {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>

          {/* Public Feedbacks */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="mr-2" size={20} />
              Public Feedback
            </h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading feedbacks...</p>
              </div>
            ) : publicFeedbacks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No public feedback yet. Be the first to share!</p>
            ) : (
              <div className="space-y-4">
                {publicFeedbacks.map((feedback: any) => (
                  <div key={feedback.id} className="bg-dark-tertiary rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 gradient-blue-emerald rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {feedback.isAnonymous ? 'A' : feedback.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {feedback.isAnonymous ? 'Anonymous User' : feedback.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(feedback.rating)}
                        <span className="ml-2 text-sm text-gray-400">{feedback.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{feedback.content}</p>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
