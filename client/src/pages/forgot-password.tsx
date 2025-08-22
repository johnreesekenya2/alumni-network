import { useState } from 'react';
import { Key, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { forgotPasswordSchema, ForgotPasswordData } from '@shared/schema';

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData: ForgotPasswordData = forgotPasswordSchema.parse({ email });
      await authService.forgotPassword(validatedData);
      
      toast({
        title: "Reset code sent!",
        description: "Please check your email for the password reset code.",
      });
      
      setLocation(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: "Failed to send reset code",
        description: error.message || "Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl p-8 w-full max-w-md border border-gray-700/50 animate-fade-in">
        <div className="text-center mb-8">
          <Key className="text-4xl text-accent-amber mb-4 mx-auto" size={64} data-testid="forgot-password-logo" />
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="forgot-password-title">Reset Password</h2>
          <p className="text-gray-400" data-testid="forgot-password-subtitle">Enter your email to receive a reset code</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber transition-colors"
              placeholder="Enter your email address"
              required
              data-testid="input-email"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-amber to-accent-emerald hover:opacity-80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            data-testid="button-send-reset-code"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Remember your password?{' '}
            <Link href="/login">
              <Button
                variant="link"
                className="text-accent-blue hover:text-accent-emerald transition-colors font-medium p-0"
                data-testid="link-sign-in"
              >
                Sign In
              </Button>
            </Link>
          </p>
        </div>
        
        <Link href="/login">
          <Button
            variant="link"
            className="mt-4 text-gray-400 hover:text-white transition-colors flex items-center mx-auto p-0"
            data-testid="link-back-to-login"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Login
          </Button>
        </Link>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-dark-secondary py-4 px-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Powered by John Reese</p>
          <p className="text-gray-500 text-xs">©#OurLadyOfFatimaAlumni</p>
        </div>
      </footer>
    </div>
  );
}
