import { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { resetPasswordSchema, ResetPasswordData } from '@shared/schema';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const validatedData: ResetPasswordData = resetPasswordSchema.parse({
        code: formData.code,
        newPassword: formData.newPassword
      });

      await authService.resetPassword(email, validatedData);
      
      toast({
        title: "Password reset successful!",
        description: "Your password has been updated. You can now sign in with your new password.",
      });
      
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "Please check your code and try again.",
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
          <Shield className="text-4xl text-accent-emerald mb-4 mx-auto" size={64} data-testid="reset-password-logo" />
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="reset-password-title">Create New Password</h2>
          <p className="text-gray-400" data-testid="reset-password-subtitle">Enter the code and your new password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              data-testid="input-verification-code"
            />
          </div>
          
          <div>
            <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                placeholder="Enter new password"
                required
                data-testid="input-new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                data-testid="button-toggle-new-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                placeholder="Confirm new password"
                required
                data-testid="input-confirm-new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                data-testid="button-toggle-confirm-new-password"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-emerald to-accent-blue hover:opacity-80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            data-testid="button-reset-password"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
        
        <Link href="/forgot-password">
          <Button
            variant="link"
            className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center mx-auto p-0"
            data-testid="link-back-to-forgot-password"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Email Verification
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
