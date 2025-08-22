import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, ArrowLeft, Send, Search, Paperclip, Image, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import Sidebar from '@/components/sidebar';
import { User } from '@shared/schema';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

interface Conversation {
  userId: string;
  user: User;
  lastMessage?: Message;
  messages: Message[];
  unreadCount: number;
}

export default function Inbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [authState, setAuthState] = useState(authService.getState());
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const currentUserId = authState.user?.id;

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      setAuthState(event.detail);
    };

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, []);

  // Fetch all users for chat selection
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'search'],
    queryFn: async () => {
      const response = await fetch('/api/users/search', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!authState.token
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    enabled: !!authState.token
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['messages', selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const response = await fetch(`/api/messages/${selectedChat}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedChat && !!authState.token
  });

  // Initialize socket connection
  useEffect(() => {
    if (!authState.token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    socketRef.current = io(wsUrl, {
      path: '/ws',
      auth: {
        token: authState.token
      }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new_message', (message) => {
      // Update messages if it's for the current chat
      if (selectedChat && (message.senderId === selectedChat || message.receiverId === selectedChat)) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedChat] });
      }
      // Always update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      // Handle typing indicator
    });

    return () => {
      socket.disconnect();
    };
  }, [authState.token, selectedChat, queryClient]);

  // Update messages when chatMessages changes and scroll to bottom
  useEffect(() => {
    setMessages(chatMessages);
    // Scroll to bottom when messages update
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [chatMessages]);

  // Scroll to bottom when a new message is sent
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const startNewChat = (user: User) => {
    setSelectedChat(user.id);
    setShowUserList(false);

    // Join the conversation room via socket
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', user.id);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedChat || isUploading) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedChat);

      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Clear inputs
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh messages and conversations for both sender and receiver
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Scroll to bottom after sending message
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedConversation = conversations.find(conv => conv.userId === selectedChat);
  const selectedUser = selectedChat ? allUsers.find(user => user.id === selectedChat) : null;
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(user => user.id !== currentUserId); // Exclude current user from chat list

  if (showUserList) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowUserList(false)}
                className="mr-4 text-white hover:bg-dark-tertiary"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-2xl font-bold text-white">Select User to Chat</h1>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-secondary border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-dark-secondary border-gray-700 hover:bg-dark-tertiary cursor-pointer transition-colors" onClick={() => startNewChat(user)}>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Avatar className="mr-4">
                        <AvatarImage src={user.profilePicture || undefined} />
                        <AvatarFallback className="bg-accent-blue text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-medium">{user.name}</h3>
                        <p className="text-gray-400 text-sm">@{user.username}</p>
                        <p className="text-gray-500 text-xs">Class of {user.classOf}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedChat && (selectedConversation || selectedUser)) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
          <div className="flex flex-col h-screen">
            {/* Chat Header - Fixed */}
            <div className="bg-dark-secondary border-b border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedChat(null)}
                  className="mr-4 text-white hover:bg-dark-tertiary"
                >
                  <ArrowLeft size={20} />
                </Button>
                <Avatar className="mr-4">
                  <AvatarImage src={(selectedConversation?.user || selectedUser)?.profilePicture || undefined} />
                  <AvatarFallback className="bg-accent-blue text-white">
                    {(selectedConversation?.user || selectedUser)?.name.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-white font-medium">{(selectedConversation?.user || selectedUser)?.name}</h2>
                  <p className="text-gray-400 text-sm">@{(selectedConversation?.user || selectedUser)?.username}</p>
                </div>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'bg-accent-blue text-white'
                            : 'bg-dark-secondary text-white'
                        }`}
                      >
                        {/* Text content */}
                        {message.content && <p className="break-words">{message.content}</p>}

                        {/* Media content */}
                        {message.mediaUrl && (
                          <div className="mt-2">
                            {message.mediaType === 'image' && (
                              <img
                                src={message.mediaUrl}
                                alt={message.fileName || 'Image'}
                                className="max-w-full h-auto rounded cursor-pointer"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              />
                            )}
                            {message.mediaType === 'video' && (
                              <video
                                src={message.mediaUrl}
                                controls
                                className="max-w-full h-auto rounded"
                              />
                            )}
                            {message.mediaType === 'audio' && (
                              <audio
                                src={message.mediaUrl}
                                controls
                                className="w-full"
                              />
                            )}
                            {!['image', 'video', 'audio'].includes(message.mediaType) && (
                              <a
                                href={message.mediaUrl}
                                download={message.fileName}
                                className="flex items-center space-x-2 text-blue-300 hover:text-blue-200"
                              >
                                <File size={16} />
                                <span>{message.fileName}</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input - Fixed at Bottom */}
            <div className="bg-dark-secondary border-t border-gray-700 p-4 flex-shrink-0">
              {/* File preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-dark-tertiary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {selectedFile.type.startsWith('image/') && <Image size={16} className="text-blue-400" />}
                      {selectedFile.type.startsWith('video/') && <Video size={16} className="text-blue-400" />}
                      {!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/') &&
                        <File size={16} className="text-blue-400" />}
                      <span className="text-sm text-gray-300">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  <Paperclip size={20} />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-dark-tertiary border-gray-600 text-white"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isUploading || (!newMessage.trim() && !selectedFile)}
                  className="bg-accent-blue hover:bg-blue-600 disabled:opacity-50 flex-shrink-0"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Inbox</h1>
            <Button
              onClick={() => setShowUserList(true)}
              className="bg-accent-blue hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2" size={20} />
              Add Chat
            </Button>
          </div>

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <MessageCircle size={64} className="text-gray-500 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No conversations yet</h2>
              <p className="text-gray-400 mb-6">Start a conversation by clicking "Add Chat" above</p>
              <Button
                onClick={() => setShowUserList(true)}
                className="bg-accent-blue hover:bg-blue-600 text-white"
              >
                <Plus className="mr-2" size={20} />
                Start Your First Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.userId}
                  className="bg-dark-secondary border-gray-700 hover:bg-dark-tertiary cursor-pointer transition-colors"
                  onClick={() => setSelectedChat(conversation.userId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="mr-4">
                          <AvatarImage src={conversation.user.profilePicture || undefined} />
                          <AvatarFallback className="bg-accent-blue text-white">
                            {conversation.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-medium">{conversation.user.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {conversation.lastMessage && (
                          <div className="text-xs text-gray-400">
                            {conversation.lastMessage?.createdAt ? new Date(conversation.lastMessage.createdAt).toLocaleString() : ''}
                          </div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="inline-block bg-accent-blue text-white text-xs rounded-full px-2 py-1 mt-1">
                            {conversation.unreadCount}
                          </span>
                        )}
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