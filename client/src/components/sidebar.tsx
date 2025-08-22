import { Home, Users, MessageCircle, GraduationCap, LogOut, HelpCircle, Info, Award, Inbox, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { User } from '@shared/schema';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authState = authService.getState();
    setUser(authState.user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/welcome';
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      isActive: location === '/dashboard'
    },
    { 
      label: 'Database', 
      icon: Users, 
      path: '/database',
      isActive: location === '/database'
    },
    { 
      label: 'Community', 
      icon: MessageCircle, 
      path: '/community',
      isActive: location === '/community'
    },
    { 
      label: 'Inbox', 
      icon: Inbox, 
      path: '/inbox',
      isActive: location === '/inbox'
    },
    { 
      label: 'Job Zone', 
      icon: Briefcase, 
      path: '/job-zone',
      isActive: location === '/job-zone'
    },
    { 
      label: 'Support', 
      icon: HelpCircle, 
      path: '/support',
      isActive: location === '/support'
    },
    { 
      label: 'About', 
      icon: Info, 
      path: '/about',
      isActive: location === '/about'
    },
    { 
      label: 'Credits', 
      icon: Award, 
      path: '/credits',
      isActive: location === '/credits'
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-dark-secondary border-r border-gray-700 z-40 
        transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `} data-testid="sidebar">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <GraduationCap className="text-2xl text-accent-blue mr-3" data-testid="sidebar-logo" />
            <h1 className="text-xl font-bold text-white">OLOF Alumni</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${item.isActive 
                    ? 'text-white bg-accent-blue/20 border border-accent-blue/30' 
                    : 'text-gray-300 hover:text-white hover:bg-dark-tertiary'
                  }
                `}
                onClick={onClose}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="mr-3" size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 gradient-blue-emerald rounded-full flex items-center justify-center mr-3">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                    data-testid="sidebar-user-avatar"
                  />
                ) : (
                  <div className="text-white text-sm font-bold" data-testid="sidebar-user-initials">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm" data-testid="sidebar-user-name">
                  {user?.name || 'User'}
                </p>
                <p className="text-gray-400 text-xs" data-testid="sidebar-username">
                  @{user?.username || 'username'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
              data-testid="button-logout"
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
