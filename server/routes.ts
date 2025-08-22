import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verificationSchema,
  profileSetupSchema,
  insertPostSchema,
  insertReactionSchema,
  insertCommentSchema,
  insertFeedbackSchema,
  insertMessageSchema,
  insertGallerySchema,
  insertGalleryReactionSchema
} from "@shared/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "./services/email";
import { upload, getFileUrl } from "./services/upload";
import express from "express";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || 'olof-alumni-secret-key';

// Middleware to authenticate JWT token
function authenticateToken(req: Request & { user?: any }, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header received:', authHeader);
  console.log('Extracted token:', token);
  console.log('Token length:', token?.length);

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Generate verification code
      const verificationCode = generateCode();

      // Create user
      const user = await storage.createUser({
        ...userData,
        verificationCode
      });

      // Send verification email
      await sendVerificationEmail(userData.email, verificationCode, userData.name);

      res.status(201).json({ 
        message: 'User registered successfully. Please check your email for verification code.',
        userId: user.id 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          classOf: user.classOf,
          clan: user.clan,
          profilePicture: user.profilePicture,
          coverPhoto: user.coverPhoto,
          bio: user.bio,
          favoriteTeacher: user.favoriteTeacher,
          hobby: user.hobby
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  app.post('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { code } = verificationSchema.parse(req.body);
      const email = req.body.email;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const verified = await storage.verifyUser(email, code);
      if (!verified) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Get the verified user and generate JWT token
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Generated token for user:', user.id, 'Token:', token);

      res.json({ 
        message: 'Email verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(400).json({ message: error.message || 'Verification failed' });
    }
  });

  app.post('/api/auth/resend-code', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      const verificationCode = generateCode();
      await storage.updateUser(user.id, { verificationCode });
      await sendVerificationEmail(email, verificationCode, user.name);

      res.json({ message: 'Verification code sent successfully' });
    } catch (error: any) {
      console.error('Resend code error:', error);
      res.status(400).json({ message: error.message || 'Failed to resend code' });
    }
  });

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }

      const resetCode = generateCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setResetCode(email, resetCode, expiresAt);
      await sendPasswordResetEmail(email, resetCode, user.name);

      res.json({ message: 'Password reset code sent to your email' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(400).json({ message: error.message || 'Failed to send reset code' });
    }
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { code, newPassword } = resetPasswordSchema.parse(req.body);
      const email = req.body.email;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const success = await storage.resetPassword(email, code, newPassword);
      if (!success) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({ message: error.message || 'Password reset failed' });
    }
  });

  // Profile routes
  app.post('/api/profile/update', authenticateToken, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]), async (req: Request & { user?: any, files?: any }, res: Response) => {
    try {
      const userId = req.user.userId;
      let updates: any = {};

      // Handle text field updates
      if (req.body.bio !== undefined) updates.bio = req.body.bio;
      if (req.body.favoriteTeacher !== undefined) updates.favoriteTeacher = req.body.favoriteTeacher;
      if (req.body.hobby !== undefined) updates.hobby = req.body.hobby;
      if (req.body.classOf !== undefined) updates.classOf = req.body.classOf;
      if (req.body.clan !== undefined) updates.clan = req.body.clan;

      // Handle file uploads
      if (req.files?.profilePicture) {
        updates.profilePicture = getFileUrl(req.files.profilePicture[0].filename);
      }

      if (req.files?.coverPhoto) {
        updates.coverPhoto = getFileUrl(req.files.coverPhoto[0].filename);
      }

      // Check if there are any updates to make
      if (Object.keys(updates).length === 0) {
        return res.json({
          message: 'No changes to update',
          user: await storage.getUser(userId)
        });
      }

      const updatedUser = await storage.updateUser(userId, updates);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      res.status(400).json({ message: error.message || 'Profile update failed' });
    }
  });

  app.get('/api/profile/me', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        classOf: user.classOf,
        clan: user.clan,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        favoriteTeacher: user.favoriteTeacher,
        hobby: user.hobby
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(400).json({ message: error.message || 'Failed to get profile' });
    }
  });

  // Database/Alumni routes
  app.get('/api/users/search', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { q, classOf, clan } = req.query;

      const users = await storage.searchUsers(
        q as string || '',
        classOf as string,
        clan as string
      );

      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        classOf: user.classOf,
        clan: user.clan,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        favoriteTeacher: user.favoriteTeacher,
        hobby: user.hobby
      }));

      res.json(sanitizedUsers);
    } catch (error: any) {
      console.error('Search users error:', error);
      res.status(400).json({ message: error.message || 'Search failed' });
    }
  });

  app.get('/api/users/:username', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);

      if (!user || !user.isVerified) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        classOf: user.classOf,
        clan: user.clan,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        favoriteTeacher: user.favoriteTeacher,
        hobby: user.hobby
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(400).json({ message: error.message || 'Failed to get user' });
    }
  });

  // Community/Posts routes
  app.get('/api/posts', authenticateToken, async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error: any) {
      console.error('Get posts error:', error);
      res.status(400).json({ message: error.message || 'Failed to get posts' });
    }
  });

  app.post('/api/posts', authenticateToken, upload.single('media'), async (req: Request & { user?: any }, res: Response) => {
    try {
      const postData = insertPostSchema.parse({
        content: req.body.content,
        mediaUrl: req.file ? getFileUrl(req.file.filename) : undefined,
        mediaType: req.file ? req.file.mimetype.split('/')[0] : undefined,
        fileName: req.file ? req.file.originalname : undefined
      });

      const post = await storage.createPost({
        ...postData,
        userId: req.user.userId
      });

      const fullPost = await storage.getPost(post.id);
      res.status(201).json(fullPost);
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(400).json({ message: error.message || 'Failed to create post' });
    }
  });

  app.get('/api/posts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const post = await storage.getPost(id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(400).json({ message: error.message || 'Failed to get post' });
    }
  });

  app.post('/api/posts/:id/reactions', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { id } = req.params;
      const reactionData = insertReactionSchema.parse({
        postId: id,
        type: req.body.type
      });

      const reaction = await storage.addReaction({
        ...reactionData,
        userId: req.user.userId
      });

      res.status(201).json(reaction);
    } catch (error: any) {
      console.error('Add reaction error:', error);
      res.status(400).json({ message: error.message || 'Failed to add reaction' });
    }
  });

  app.delete('/api/posts/:id/reactions', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.removeReaction(req.user.userId, id);

      if (!success) {
        return res.status(404).json({ message: 'Reaction not found' });
      }

      res.json({ message: 'Reaction removed successfully' });
    } catch (error: any) {
      console.error('Remove reaction error:', error);
      res.status(400).json({ message: error.message || 'Failed to remove reaction' });
    }
  });

  app.post('/api/posts/:id/comments', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { id } = req.params;
      const commentData = insertCommentSchema.parse({
        postId: id,
        content: req.body.content
      });

      const comment = await storage.addComment({
        ...commentData,
        userId: req.user.userId
      });

      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Add comment error:', error);
      res.status(400).json({ message: error.message || 'Failed to add comment' });
    }
  });

  // Feedback routes
  app.post('/api/feedback', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        content: req.body.content,
        rating: req.body.rating,
        type: req.body.type
      });

      const feedback = await storage.createFeedback({
        ...feedbackData,
        userId: req.user.userId
      });

      res.status(201).json(feedback);
    } catch (error: any) {
      console.error('Create feedback error:', error);
      res.status(400).json({ message: error.message || 'Failed to create feedback' });
    }
  });

  app.get('/api/feedback/public', authenticateToken, async (req: Request, res: Response) => {
    try {
      const feedbacks = await storage.getPublicFeedbacks();
      res.json(feedbacks);
    } catch (error: any) {
      console.error('Get public feedbacks error:', error);
      res.status(400).json({ message: error.message || 'Failed to get feedbacks' });
    }
  });

  // Message routes
  app.get('/api/messages/:userId', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.userId;
      
      const messages = await storage.getMessages(currentUserId, userId);
      res.json(messages);
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(400).json({ message: error.message || 'Failed to get messages' });
    }
  });

  // Initialize io variable that will be set later
  let io: SocketServer;

  app.post('/api/messages', authenticateToken, upload.single('media'), async (req: Request & { user?: any }, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse({
        receiverId: req.body.receiverId,
        content: req.body.content || undefined,
        mediaUrl: req.file ? getFileUrl(req.file.filename) : undefined,
        mediaType: req.file ? req.file.mimetype.split('/')[0] : undefined,
        fileName: req.file ? req.file.originalname : undefined
      });

      const message = await storage.createMessage({
        ...messageData,
        senderId: req.user.userId
      });

      // Emit the message via socket.io if available
      if (io) {
        io.to(`user_${messageData.receiverId}`).emit('new_message', message);
        io.to(`user_${req.user.userId}`).emit('new_message', message);
      }

      res.status(201).json(message);
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(400).json({ message: error.message || 'Failed to send message' });
    }
  });

  app.get('/api/conversations', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const conversations = await storage.getConversations(req.user.userId);
      res.json(conversations);
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(400).json({ message: error.message || 'Failed to get conversations' });
    }
  });

  // Gallery routes
  app.get('/api/gallery', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const galleryItems = await storage.getGalleryItems();
      res.json(galleryItems);
    } catch (error: any) {
      console.error('Get gallery error:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch gallery items' });
    }
  });

  app.post('/api/gallery/upload', authenticateToken, upload.single('file'), async (req: Request & { user?: any }, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check file size (10MB limit)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size must be less than 10MB' });
      }

      // Determine media type
      const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

      // Validate media type
      if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ message: 'Only images and videos are allowed' });
      }

      const galleryData = {
        title: req.body.title || null,
        description: req.body.description || null,
        mediaUrl: getFileUrl(req.file.filename),
        mediaType,
        fileName: req.file.filename,
        fileSize: req.file.size,
        userId: req.user.userId,
      };

      const galleryItem = await storage.createGalleryItem(galleryData);

      // Get the created item with user data
      const galleryItems = await storage.getGalleryItems();
      const createdItem = galleryItems.find(item => item.id === galleryItem.id);

      res.status(201).json(createdItem);
    } catch (error: any) {
      console.error('Gallery upload error:', error);
      res.status(400).json({ message: error.message || 'Upload failed' });
    }
  });

  app.post('/api/gallery/react', authenticateToken, async (req: Request & { user?: any }, res: Response) => {
    try {
      const { galleryId, type } = req.body;

      if (!['like', 'love', 'dislike'].includes(type)) {
        return res.status(400).json({ message: 'Invalid reaction type' });
      }

      await storage.addGalleryReaction({
        galleryId,
        type,
        userId: req.user.userId,
      });

      // Get updated gallery item with reactions
      const galleryItems = await storage.getGalleryItems();
      const updatedItem = galleryItems.find(item => item.id === galleryId);

      res.json(updatedItem);
    } catch (error: any) {
      console.error('Gallery reaction error:', error);
      res.status(400).json({ message: error.message || 'Failed to add reaction' });
    }
  });

  const httpServer = createServer(app);
  
  // Set up Socket.io
  io = new SocketServer(httpServer, {
    path: '/ws',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.io authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected`);
    
    // Join user to their own room
    socket.join(`user_${socket.data.userId}`);

    socket.on('join_conversation', (otherUserId) => {
      const roomName = [socket.data.userId, otherUserId].sort().join('_');
      socket.join(roomName);
      console.log(`User ${socket.data.userId} joined conversation with ${otherUserId}`);
    });

    socket.on('leave_conversation', (otherUserId) => {
      const roomName = [socket.data.userId, otherUserId].sort().join('_');
      socket.leave(roomName);
    });

    socket.on('typing', (data) => {
      const roomName = [socket.data.userId, data.receiverId].sort().join('_');
      socket.to(roomName).emit('user_typing', {
        userId: socket.data.userId,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected`);
    });
  });

  // Make io available to routes
  (app as any).io = io;

  return httpServer;
}