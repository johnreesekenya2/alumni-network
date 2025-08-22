import { GraduationCap, Users, MessageCircle, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Welcome() {
  const features = [
    {
      icon: Users,
      title: 'Alumni Database',
      description: 'Search and connect with classmates from different years and clans. Find old friends and make new connections.',
      color: 'from-accent-blue to-accent-emerald',
      borderColor: 'hover:border-accent-blue/50'
    },
    {
      icon: MessageCircle,
      title: 'Community Posts',
      description: 'Share photos, videos, and memories. React and comment on posts from your fellow alumni.',
      color: 'from-accent-emerald to-accent-amber',
      borderColor: 'hover:border-accent-emerald/50'
    },
    {
      icon: UserCircle,
      title: 'Personal Profiles',
      description: 'Create your profile with photos, bio, favorite teachers, and hobbies. Share your journey since graduation.',
      color: 'from-accent-amber to-accent-blue',
      borderColor: 'hover:border-accent-amber/50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary">
      {/* Header */}
      <header className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/20 to-accent-emerald/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <GraduationCap className="text-6xl text-accent-blue mb-4 animate-bounce-slow mx-auto" data-testid="welcome-logo" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-blue to-accent-emerald bg-clip-text text-transparent" data-testid="welcome-title">
            OUR LADY OF FATIMA
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white" data-testid="welcome-subtitle">
            Alumni Community
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed" data-testid="welcome-description">
            Reconnect with your classmates, share memories, and build lasting connections with fellow OLOF graduates from 1999-2024.
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16 text-white" data-testid="features-title">
            What Makes Our Community Special
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`glassmorphism rounded-2xl p-8 border border-gray-700/50 ${feature.borderColor} transition-all duration-300 hover:transform hover:scale-105`}
                data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <feature.icon className="text-2xl text-white" size={32} />
                </div>
                <h4 className="text-xl font-semibold mb-4 text-center text-white">
                  {feature.title}
                </h4>
                <p className="text-gray-300 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center">
            <Link href="/login">
              <Button 
                className="w-full md:w-auto gradient-blue-emerald hover:opacity-80 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="button-sign-in"
              >
                <UserCircle className="mr-2" size={20} />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="outline"
                className="w-full md:w-auto bg-transparent border-2 border-accent-blue hover:bg-accent-blue text-accent-blue hover:text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                data-testid="button-create-account"
              >
                <Users className="mr-2" size={20} />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-secondary py-8 px-4 border-t border-gray-700">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 mb-2">Powered by John Reese</p>
          <p className="text-gray-500 text-sm">©#OurLadyOfFatimaAlumni</p>
        </div>
      </footer>
    </div>
  );
}
