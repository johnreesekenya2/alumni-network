
import { useState } from 'react';
import { Menu, User, Mail, Phone } from 'lucide-react';
import Sidebar from '@/components/sidebar';

export default function Credits() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <h2 className="text-2xl font-bold text-white" data-testid="credits-title">Credits</h2>
          <p className="text-gray-400 mt-2">Meet the creator and owner of this platform</p>
        </header>

        <div className="p-6 space-y-6">
          {/* Creator Information */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-accent-blue to-accent-emerald bg-clip-text text-transparent">
                Creator & Owner
              </h1>
              <p className="text-gray-300 text-lg">The mastermind behind OLOF Alumni Community</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Profile Image */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img 
                    src="https://files.catbox.moe/ti77bj.jpg" 
                    alt="Creator" 
                    className="w-64 h-64 object-cover rounded-2xl border-4 border-accent-blue/30 shadow-2xl mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwNCIgcj0iNDAiIGZpbGw9IiM2Mzc0OEEiLz4KPHBhdGggZD0iTTY0IDE5MkM2NCAxNTIuMjM1IDk2LjIzNTQgMTIwIDEzNiAxMjBIMTQ0QzE4My43NjUgMTIwIDIxNiAxNTIuMjM1IDIxNiAxOTJWMjU2SDY0VjE5MloiIGZpbGw9IiM2Mzc0OEEiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                    First on the left in the pic
                  </div>
                </div>
              </div>

              {/* Admin Details */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-dark-tertiary rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="text-accent-blue" size={24} />
                      <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Real Name</p>
                        <p className="text-white font-medium text-lg">Pascal Erick</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Alias Name</p>
                        <p className="text-white font-medium text-lg">John Reese</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Bio</p>
                        <p className="text-gray-300 italic leading-relaxed">
                          "IN THE END WE ARE ALL ALONE AND NO ONE IS COMING TO SAVE YOU."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-dark-tertiary rounded-xl p-6 border border-gray-600">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="text-accent-emerald" size={24} />
                      <h3 className="text-xl font-semibold text-white">Contact Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white font-medium">254745282166</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email Addresses</p>
                        <div className="space-y-1">
                          <p className="text-white font-medium text-sm">fsocietycipherrevolt@gmail.com</p>
                          <p className="text-white font-medium text-sm">thepresidentofvietnam@gmail.com</p>
                          <p className="text-white font-medium text-sm">dukeofbritain66@gmail.com</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-tertiary rounded-xl p-6 border border-gray-600">
                    <h3 className="text-xl font-semibold text-white mb-4">Platform Development</h3>
                    <p className="text-gray-300 leading-relaxed">
                      This platform was designed and developed to serve the Our Lady of Fatima 
                      Secondary School alumni community, connecting generations of students and 
                      preserving the school's legacy through digital innovation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement Section */}
              <div className="mt-8 text-center bg-gradient-to-r from-accent-blue/10 to-accent-emerald/10 border border-accent-blue/20 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Platform Achievement</h3>
                <p className="text-gray-300 text-lg">
                  Successfully created and launched the OLOF Alumni Community platform, 
                  bringing together alumni from 1999-2024 in a unified digital space.
                </p>
              </div>
            </div>
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
