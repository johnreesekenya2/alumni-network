import { useState } from 'react';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LoginData, loginSchema } from '@shared/schema';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);
      await authService.login(validatedData);
      
      toast({
        title: "Login successful!",
        description: "Welcome back to OLOF Alumni Community.",
      });
      
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
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
          <GraduationCap className="text-4xl text-accent-blue mb-4 mx-auto" size={64} data-testid="login-logo" />
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="login-title">Welcome Back</h2>
          <p className="text-gray-400" data-testid="login-subtitle">Sign in to your OLOF Alumni account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">
              Email or Username
            </Label>
            <Input
              id="identifier"
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
              className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
              placeholder="Enter your email or username"
              required
              data-testid="input-identifier"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                data-testid="checkbox-remember"
              />
              <Label htmlFor="remember" className="text-sm text-gray-300">
                Remember me
              </Label>
            </div>
            <Link href="/forgot-password">
              <Button
                variant="link"
                className="text-sm text-accent-blue hover:text-accent-emerald transition-colors p-0"
                data-testid="link-forgot-password"
              >
                Forgot password?
              </Button>
            </Link>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-blue-emerald hover:opacity-80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            data-testid="button-sign-in"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/register">
              <Button
                variant="link"
                className="text-accent-blue hover:text-accent-emerald transition-colors font-medium p-0"
                data-testid="link-create-account"
              >
                Create Account
              </Button>
            </Link>
          </p>
        </div>
        
        <Link href="/welcome">
          <Button
            variant="link"
            className="mt-4 text-gray-400 hover:text-white transition-colors flex items-center mx-auto p-0"
            data-testid="link-back-to-welcome"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Welcome
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
