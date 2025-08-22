import { useState } from 'react';
import { Briefcase, Plus, Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/sidebar';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedDate: Date;
  deadline?: Date;
}

export default function JobZone() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      description: 'We are looking for a skilled Software Engineer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: ['3+ years experience', 'React/TypeScript', 'Node.js', 'SQL databases'],
      postedBy: 'John Doe (Class of 2018)',
      postedDate: new Date('2024-08-20'),
      deadline: new Date('2024-09-15')
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Creative Agency Inc',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$65,000 - $85,000',
      description: 'Join our dynamic marketing team as a Marketing Manager. Lead campaigns, analyze market trends, and drive brand awareness.',
      requirements: ['5+ years marketing experience', 'Digital marketing expertise', 'Team leadership', 'Analytics tools'],
      postedBy: 'Jane Smith (Class of 2016)',
      postedDate: new Date('2024-08-18'),
      deadline: new Date('2024-09-10')
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      company: 'Design Studio Pro',
      location: 'Remote',
      type: 'Contract',
      salary: '$50 - $75/hour',
      description: 'We need a talented UI/UX Designer to create beautiful and intuitive user experiences for our clients\' digital products.',
      requirements: ['Portfolio required', 'Figma/Sketch proficiency', 'User research experience', 'Responsive design'],
      postedBy: 'Mike Johnson (Class of 2020)',
      postedDate: new Date('2024-08-15'),
    }
  ]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Part-time':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Contract':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Internship':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Job Zone</h1>
              <p className="text-gray-400">Discover career opportunities shared by our alumni network</p>
            </div>
            <Button className="bg-accent-blue hover:bg-blue-600 text-white">
              <Plus className="mr-2" size={20} />
              Post Job
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-dark-secondary border-gray-700 text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-dark-secondary border-gray-700 text-white">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-4 text-center">
                <Briefcase className="mx-auto mb-2 text-accent-blue" size={24} />
                <div className="text-2xl font-bold text-white">{jobs.length}</div>
                <div className="text-sm text-gray-400">Total Jobs</div>
              </CardContent>
            </Card>
            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-4 text-center">
                <MapPin className="mx-auto mb-2 text-green-400" size={24} />
                <div className="text-2xl font-bold text-white">{new Set(jobs.map(j => j.location)).size}</div>
                <div className="text-sm text-gray-400">Locations</div>
              </CardContent>
            </Card>
            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-4 text-center">
                <DollarSign className="mx-auto mb-2 text-yellow-400" size={24} />
                <div className="text-2xl font-bold text-white">{jobs.filter(j => j.salary).length}</div>
                <div className="text-sm text-gray-400">With Salary Info</div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-dark-secondary border-gray-700 hover:bg-dark-tertiary transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span className="font-medium text-accent-blue">{job.company}</span>
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {job.postedDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${getTypeColor(job.type)} border`}>
                        {job.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {job.salary && (
                        <div className="flex items-center text-green-400">
                          <DollarSign size={16} className="mr-2" />
                          <span className="font-medium">{job.salary}</span>
                        </div>
                      )}
                      
                      <p className="text-gray-300">{job.description}</p>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400">
                          Posted by: <span className="text-accent-blue">{job.postedBy}</span>
                          {job.deadline && (
                            <span className="ml-4">
                              Deadline: <span className="text-orange-400">
                                {job.deadline.toLocaleDateString()}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" className="border-gray-600 text-white hover:bg-dark-tertiary">
                            Save
                          </Button>
                          <Button className="bg-accent-blue hover:bg-blue-600">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}