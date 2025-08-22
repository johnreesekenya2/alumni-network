import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { verificationSchema } from '@shared/schema';

export default function Verification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = verificationSchema.parse({ code });
      const result = await authService.verifyEmail(email, code);
      
      console.log('Verification result:', result);
      console.log('Auth service state after verification:', authService.getState());
      
      // Redirect to dashboard after successful verification
      window.location.href = '/dashboard';
      
      toast({
        title: "Email verified successfully!",
        description: "Welcome to OLOF Alumni Community!",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      await authService.resendCode(email);
      
      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl p-8 w-full max-w-md border border-gray-700/50 animate-fade-in">
        <div className="text-center mb-8">
          <Mail className="text-4xl text-accent-blue mb-4 mx-auto" size={64} data-testid="verification-logo" />
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="verification-title">Verify Your Email</h2>
          <p className="text-gray-400" data-testid="verification-subtitle">We've sent a verification code to your email</p>
          <p className="text-accent-blue text-sm mt-2" data-testid="verification-email">{email}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              data-testid="input-verification-code"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-blue-emerald hover:opacity-80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            data-testid="button-verify-email"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">Didn't receive the code?</p>
          <Button
            variant="link"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-accent-blue hover:text-accent-emerald transition-colors font-medium text-sm mt-1 p-0"
            data-testid="button-resend-code"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </Button>
        </div>
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
