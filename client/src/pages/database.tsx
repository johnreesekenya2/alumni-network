import { useState } from 'react';
import { Menu, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { User } from '@shared/schema';
import Sidebar from '@/components/sidebar';
import { Link } from 'wouter';

export default function Database() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClan, setSelectedClan] = useState('');

  const years = Array.from({ length: 26 }, (_, i) => (2024 - i).toString());
  const clans = ['G-CLAN', 'V-CLAN', 'W-CLAN', 'P-CLAN', 'L-CLAN'];

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery, selectedYear, selectedClan],
    enabled: !!authService.getToken(),
    queryFn: async () => {
      const token = authService.getToken();
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedYear && selectedYear !== 'all') params.append('classOf', selectedYear);
      if (selectedClan && selectedClan !== 'all') params.append('clan', selectedClan);
      
      const response = await fetch(`/api/users/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

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
          <h2 className="text-2xl font-bold text-white" data-testid="database-title">Alumni Database</h2>
        </header>

        {/* Database Content */}
        <div className="p-6">
          {/* Search and Filters */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    placeholder="Search alumni by name..."
                    data-testid="input-search"
                  />
                  <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger 
                    className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    data-testid="select-year-filter"
                  >
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                    <SelectItem value="all" data-testid="option-all-years">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year} data-testid={`option-year-${year}`}>
                        Class of {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedClan} onValueChange={setSelectedClan}>
                  <SelectTrigger 
                    className="w-full bg-dark-tertiary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    data-testid="select-clan-filter"
                  >
                    <SelectValue placeholder="All Clans" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border border-gray-600 text-white">
                    <SelectItem value="all" data-testid="option-all-clans">All Clans</SelectItem>
                    {clans.map(clan => (
                      <SelectItem key={clan} value={clan} data-testid={`option-clan-${clan.toLowerCase()}`}>
                        {clan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Alumni Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glassmorphism rounded-2xl border border-gray-700/50 p-6 animate-pulse">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-dark-tertiary rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-dark-tertiary rounded mb-2"></div>
                    <div className="h-3 bg-dark-tertiary rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-dark-tertiary rounded"></div>
                      <div className="h-3 bg-dark-tertiary rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg" data-testid="no-users-message">
                No alumni found matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: User) => (
                <Link key={user.id} href={`/profile/${user.username}`}>
                  <a>
                    <div 
                      className="glassmorphism rounded-2xl border border-gray-700/50 p-6 hover:border-accent-blue/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                      data-testid={`user-card-${user.username}`}
                    >
                    <div className="text-center">
                      <div className="w-20 h-20 gradient-blue-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                            data-testid={`user-avatar-${user.username}`}
                          />
                        ) : (
                          <div className="text-white font-bold text-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1" data-testid={`user-name-${user.username}`}>
                        {user.name}
                      </h3>
                      <p className="text-accent-blue text-sm mb-3" data-testid={`user-username-${user.username}`}>
                        @{user.username}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Class of:</span>
                          <span className="text-white" data-testid={`user-class-${user.username}`}>
                            {user.classOf}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Clan:</span>
                          <span className="text-white" data-testid={`user-clan-${user.username}`}>
                            {user.clan}
                          </span>
                        </div>
                        {user.favoriteTeacher && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Teacher:</span>
                            <span className="text-white text-xs" data-testid={`user-teacher-${user.username}`}>
                              {user.favoriteTeacher}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {user.bio && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p 
                            className="text-gray-300 text-xs leading-relaxed line-clamp-3"
                            data-testid={`user-bio-${user.username}`}
                          >
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination - Static for now */}
          {users.length > 0 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                className="px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-accent-blue transition-colors"
                data-testid="button-prev-page"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button className="px-4 py-2 bg-accent-blue text-white rounded-lg" data-testid="button-page-1">
                1
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-accent-blue transition-colors"
                data-testid="button-page-2"
              >
                2
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-accent-blue transition-colors"
                data-testid="button-page-3"
              >
                3
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 bg-dark-tertiary border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-accent-blue transition-colors"
                data-testid="button-next-page"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          )}
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
