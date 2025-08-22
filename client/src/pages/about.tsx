
import { useState } from 'react';
import { Menu, GraduationCap, MapPin, Phone, Mail, Award } from 'lucide-react';
import Sidebar from '@/components/sidebar';

export default function About() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    {
      icon: GraduationCap,
      title: 'Alumni Database',
      description: 'Search and connect with classmates from different years and clans. Find old friends and make new connections.'
    },
    {
      icon: Mail,
      title: 'Community Posts',
      description: 'Share photos, videos, and memories. React and comment on posts from your fellow alumni.'
    },
    {
      icon: Award,
      title: 'Personal Profiles',
      description: 'Create your profile with photos, bio, favorite teachers, and hobbies. Share your journey since graduation.'
    }
  ];

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
          <h2 className="text-2xl font-bold text-white" data-testid="about-title">About OLOF Alumni</h2>
          <p className="text-gray-400 mt-2">Learn more about our community and school</p>
        </header>

        <div className="p-6 space-y-6">
          {/* School Information */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <div className="text-center mb-8">
              <GraduationCap className="text-6xl text-accent-blue mb-4 mx-auto" />
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-blue to-accent-emerald bg-clip-text text-transparent">
                Our Lady of Fatima Secondary School
              </h1>
              <p className="text-xl text-gray-300 mb-4">Kariobangi, Kasarani Constituency</p>
              <div className="inline-block bg-accent-blue/20 border border-accent-blue/30 rounded-lg px-6 py-3">
                <p className="text-accent-blue font-semibold text-lg">School Motto</p>
                <p className="text-white mt-1">Excellence Through Faith and Knowledge</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                <div className="flex items-center space-x-3">
                  <Phone className="text-accent-blue" size={20} />
                  <div>
                    <p className="text-gray-300">Phone</p>
                    <p className="text-white font-medium">020 7353-3728</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-accent-emerald" size={20} />
                  <div>
                    <p className="text-gray-300">Email</p>
                    <p className="text-white font-medium">olofatima@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-accent-amber" size={20} />
                  <div>
                    <p className="text-gray-300">Location</p>
                    <p className="text-white font-medium">Kariobangi, Kasarani Constituency</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">About This Platform</h3>
                <p className="text-gray-300 leading-relaxed">
                  The OLOF Alumni Community is a digital platform designed to connect graduates 
                  from Our Lady of Fatima Secondary School from 1999 to 2024. This platform serves 
                  as a bridge between past and present, allowing alumni to reconnect, share memories, 
                  and maintain the bonds formed during their school years.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Whether you're looking to find old classmates, share your current journey, or 
                  simply reminisce about the good old days at OLOF, this platform provides all 
                  the tools you need to stay connected with your school community.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Features */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Platform Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-blue to-accent-emerald rounded-full flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="text-white" size={32} />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="glassmorphism rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Our Mission</h3>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                To create a lasting digital community that preserves the spirit of Our Lady of Fatima 
                Secondary School while fostering continuous connections among its alumni across different 
                generations and career paths.
              </p>
              <p className="text-gray-400">
                <em>More updates and information will be added to this page soon...</em>
              </p>
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
