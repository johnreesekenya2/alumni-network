import { useState } from 'react';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { insertUserSchema } from '@shared/schema';

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    classOf: '',
    clan: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const years = Array.from({ length: 26 }, (_, i) => (2024 - i).toString());
  const clans = ['G-CLAN', 'V-CLAN', 'W-CLAN', 'P-CLAN', 'L-CLAN'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Terms required",
        description: "You must agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = insertUserSchema.parse({
        name: formData.name,
        username: formData.username.toLowerCase(),
        email: formData.email,
        classOf: formData.classOf,
        clan: formData.clan,
        password: formData.password,
      });

      await authService.register(userData);
      
      toast({
        title: "Registration successful!",
        description: "Please check your email for a verification code.",
      });
      
      setLocation(`/verification?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="glassmorphism rounded-2xl p-8 border border-gray-700/50 animate-fade-in">
          <div className="text-center mb-8">
            <UserPlus className="text-4xl text-accent-emerald mb-4 mx-auto" size={64} data-testid="register-logo" />
            <h2 className="text-2xl font-bold text-white mb-2" data-testid="register-title">Join OLOF Alumni</h2>
            <p className="text-gray-400" data-testid="register-subtitle">Create your account and reconnect with classmates</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                  placeholder="Enter your full name"
                  required
                  data-testid="input-name"
                />
              </div>
              
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                  placeholder="johnsmith (lowercase, no spaces)"
                  required
                  data-testid="input-username"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters only, no spaces</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                placeholder="your.email@example.com"
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="classOf" className="block text-sm font-medium text-gray-300 mb-2">
                  Class of
                </Label>
                <Select value={formData.classOf} onValueChange={(value) => setFormData(prev => ({ ...prev, classOf: value }))}>
                  <SelectTrigger 
                    className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                    data-testid="select-class-of"
                  >
                    <SelectValue placeholder="Select your graduation year" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                    {years.map(year => (
                      <SelectItem key={year} value={year} data-testid={`option-year-${year}`}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="clan" className="block text-sm font-medium text-gray-300 mb-2">
                  Clan
                </Label>
                <Select value={formData.clan} onValueChange={(value) => setFormData(prev => ({ ...prev, clan: value }))}>
                  <SelectTrigger 
                    className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                    data-testid="select-clan"
                  >
                    <SelectValue placeholder="Select your clan" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                    {clans.map(clan => (
                      <SelectItem key={clan} value={clan} data-testid={`option-clan-${clan.toLowerCase()}`}>
                        {clan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                  placeholder="Create a strong password"
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
            
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors"
                  placeholder="Confirm your password"
                  required
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-emerald-amber hover:opacity-80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              data-testid="button-create-account"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
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
      </div>
      
      <footer className="bg-dark-secondary py-4 px-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Powered by John Reese</p>
          <p className="text-gray-500 text-xs">©#OurLadyOfFatimaAlumni</p>
        </div>
      </footer>
    </div>
  );
}
