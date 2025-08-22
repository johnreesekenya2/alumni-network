import { 
  users, 
  posts, 
  reactions, 
  comments, 
  messages, 
  feedbacks,
  gallery,
  galleryReactions,
  type User, 
  type InsertUser, 
  type Post, 
  type InsertPost, 
  type Reaction, 
  type InsertReaction, 
  type Comment, 
  type InsertComment, 
  type InsertMessage,
  type Gallery,
  type InsertGallery,
  type GalleryReaction,
  type InsertGalleryReaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, or, like, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from 'crypto';


export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser & { verificationCode: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  verifyUser(email: string, code: string): Promise<boolean>;
  setResetCode(email: string, code: string, expires: Date): Promise<boolean>;
  resetPassword(email: string, code: string, newPassword: string): Promise<boolean>;
  searchUsers(query: string, classOf?: string, clan?: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Post methods
  createPost(post: InsertPost & { userId: string }): Promise<Post>;
  getPosts(): Promise<(Post & { user: User; reactions: Reaction[]; comments: (Comment & { user: User })[] })[]>;
  getPost(id: string): Promise<(Post & { user: User; reactions: Reaction[]; comments: (Comment & { user: User })[] }) | undefined>;

  // Reaction methods
  addReaction(reaction: InsertReaction & { userId: string }): Promise<Reaction>;
  removeReaction(userId: string, postId: string): Promise<boolean>;

  // Comment methods
  addComment(comment: InsertComment & { userId: string }): Promise<Comment>;
  getComments(postId: string): Promise<(Comment & { user: User })[]>;

  // Feedback methods
  createFeedback(feedbackData: { userId: string; content: string; rating: number; type: string }): Promise<any>;
  getPublicFeedbacks(): Promise<any[]>;

  // Message methods
  createMessage(message: InsertMessage & { senderId: string }): Promise<any>;
  getMessages(userId1: string, userId2: string): Promise<any[]>;
  getConversations(userId: string): Promise<any[]>;

  // Gallery methods
  createGalleryItem(galleryData: InsertGallery & { userId: string }): Promise<Gallery>;
  getGalleryItems(): Promise<(Gallery & { user: User; reactions: GalleryReaction[]; userReaction?: GalleryReaction })[]>;
  addGalleryReaction(reaction: InsertGalleryReaction & { userId: string }): Promise<GalleryReaction>;
  removeGalleryReaction(userId: string, galleryId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(eq(users.email, identifier), eq(users.username, identifier))
    );
    return user || undefined;
  }

  async createUser(userData: InsertUser & { verificationCode: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyUser(email: string, code: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, verificationCode: null })
      .where(and(eq(users.email, email), eq(users.verificationCode, code)))
      .returning();
    return !!user;
  }

  async setResetCode(email: string, code: string, expires: Date): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ resetCode: code, resetCodeExpires: expires })
      .where(eq(users.email, email))
      .returning();
    return !!user;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        resetCode: null, 
        resetCodeExpires: null 
      })
      .where(
        and(
          eq(users.email, email),
          eq(users.resetCode, code),
          // Check if reset code hasn't expired
        )
      )
      .returning();
    return !!user;
  }

  async searchUsers(query: string, classOf?: string, clan?: string): Promise<User[]> {
    let conditions = [];

    if (query) {
      conditions.push(
        or(
          like(users.name, `%${query}%`),
          like(users.username, `%${query}%`)
        )
      );
    }

    if (classOf) {
      conditions.push(eq(users.classOf, classOf));
    }

    if (clan) {
      conditions.push(eq(users.clan, clan));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(users)
      .where(whereCondition)
      .orderBy(asc(users.name));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isVerified, true))
      .orderBy(asc(users.name));
  }

  async createPost(postData: InsertPost & { userId: string }): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    return post;
  }

  async getPosts(): Promise<(Post & { user: User; reactions: Reaction[]; comments: (Comment & { user: User })[] })[]> {
    const postsData = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const result = [];
    for (const postData of postsData) {
      if (!postData.posts || !postData.users) continue;

      const postReactions = await db
        .select()
        .from(reactions)
        .where(eq(reactions.postId, postData.posts.id));

      const postComments = await db
        .select()
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.postId, postData.posts.id))
        .orderBy(desc(comments.createdAt));

      result.push({
        ...postData.posts,
        user: postData.users,
        reactions: postReactions,
        comments: postComments.map(c => ({
          ...c.comments!,
          user: c.users!
        }))
      });
    }

    return result;
  }

  async getPost(id: string): Promise<(Post & { user: User; reactions: Reaction[]; comments: (Comment & { user: User })[] }) | undefined> {
    const [postData] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));

    if (!postData.posts || !postData.users) return undefined;

    const postReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.postId, id));

    const postComments = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    return {
      ...postData.posts,
      user: postData.users,
      reactions: postReactions,
      comments: postComments.map(c => ({
        ...c.comments!,
        user: c.users!
      }))
    };
  }

  async addReaction(reactionData: InsertReaction & { userId: string }): Promise<Reaction> {
    // First remove any existing reaction from this user on this post
    await db
      .delete(reactions)
      .where(and(
        eq(reactions.userId, reactionData.userId),
        eq(reactions.postId, reactionData.postId)
      ));

    // Then add the new reaction
    const [reaction] = await db
      .insert(reactions)
      .values(reactionData)
      .returning();
    return reaction;
  }

  async removeReaction(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .delete(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.postId, postId)
      ));
    return result.rowCount! > 0;
  }

  async addComment(commentData: { postId: string; userId: string; content: string }) {
    const [comment] = await db.insert(comments).values(commentData).returning();

    const fullComment = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profilePicture: users.profilePicture
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, comment.id))
      .limit(1);

    return fullComment[0];
  }

  async getComments(postId: string): Promise<(Comment & { user: User })[]> {
    const commentsData = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return commentsData.map(c => ({
      ...c.comments!,
      user: c.users!
    }));
  }

  async createFeedback(feedbackData: { userId: string; content: string; rating: number; type: string }) {
    const [feedback] = await db.insert(feedbacks).values(feedbackData).returning();

    // If it's a private feedback, send email to admin
    if (feedbackData.type === 'private') {
      const user = await this.getUser(feedbackData.userId);
      if (user) {
        // You can implement email sending to admin here
        console.log('Private feedback received from:', user.name, user.email);
        console.log('Feedback:', feedbackData.content);
        console.log('Rating:', feedbackData.rating);
      }
    }

    return feedback;
  }

  async getPublicFeedbacks() {
    const publicFeedbacks = await db
      .select({
        id: feedbacks.id,
        content: feedbacks.content,
        rating: feedbacks.rating,
        type: feedbacks.type,
        createdAt: feedbacks.createdAt,
        isAnonymous: sql<boolean>`${feedbacks.type} = 'anonymous'`,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email
        }
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .where(sql`${feedbacks.type} IN ('public', 'anonymous')`)
      .orderBy(sql`${feedbacks.createdAt} DESC`);

    return publicFeedbacks;
  }

  // Message methods
  async createMessage(messageData: InsertMessage & { senderId: string }): Promise<any> {
    // Ensure all required fields are present
    const messageToInsert = {
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content || null,
      mediaUrl: messageData.mediaUrl || null,
      mediaType: messageData.mediaType || null,
      fileName: messageData.fileName || null,
      createdAt: new Date(),
      readAt: null
    };

    const [message] = await db
      .insert(messages)
      .values(messageToInsert)
      .returning();
    
    // Get the message with sender info
    const [messageWithSender] = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        mediaType: messages.mediaType,
        fileName: messages.fileName,
        createdAt: messages.createdAt,
        readAt: messages.readAt,
        senderName: users.name,
        senderUsername: users.username
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, message.id));

    return messageWithSender;
  }

  async getMessages(userId1: string, userId2: string): Promise<any[]> {
    const messageList = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        mediaType: messages.mediaType,
        fileName: messages.fileName,
        createdAt: messages.createdAt,
        readAt: messages.readAt,
        senderName: users.name,
        senderUsername: users.username
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));

    return messageList;
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get all unique conversation partners
    const partnersQuery = await db.execute(sql`
      SELECT DISTINCT 
        CASE 
          WHEN sender_id = ${userId} THEN receiver_id
          ELSE sender_id 
        END as other_user_id
      FROM messages 
      WHERE sender_id = ${userId} OR receiver_id = ${userId}
    `);

    const conversations = [];

    for (const partner of partnersQuery.rows) {
      const otherUserId = (partner as any).other_user_id;
      
      // Get user info
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          profilePicture: users.profilePicture
        })
        .from(users)
        .where(eq(users.id, otherUserId));

      if (!user) continue;

      // Get latest message
      const [latestMessage] = await db
        .select({
          id: messages.id,
          content: messages.content,
          mediaUrl: messages.mediaUrl,
          mediaType: messages.mediaType,
          fileName: messages.fileName,
          createdAt: messages.createdAt,
          senderId: messages.senderId
        })
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
            and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Count unread messages
      const [unreadCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId),
            sql`${messages.readAt} IS NULL`
          )
        );

      conversations.push({
        userId: otherUserId,
        user,
        lastMessage: latestMessage || null,
        unreadCount: Number(unreadCount?.count) || 0
      });
    }

    // Sort by latest message date
    conversations.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
      const bDate = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return conversations;
  }

  // Gallery methods
  async createGalleryItem(galleryData: InsertGallery & { userId: string }): Promise<Gallery> {
    const [galleryItem] = await db
      .insert(gallery)
      .values({
        ...galleryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return galleryItem;
  }

  async getGalleryItems(): Promise<(Gallery & { user: User; reactions: GalleryReaction[]; userReaction?: GalleryReaction })[]> {
    // Get all gallery items with user data
    const galleryItems = await db
      .select({
        id: gallery.id,
        userId: gallery.userId,
        title: gallery.title,
        description: gallery.description,
        mediaUrl: gallery.mediaUrl,
        mediaType: gallery.mediaType,
        fileName: gallery.fileName,
        fileSize: gallery.fileSize,
        createdAt: gallery.createdAt,
        updatedAt: gallery.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profilePicture: users.profilePicture,
        },
      })
      .from(gallery)
      .leftJoin(users, eq(gallery.userId, users.id))
      .orderBy(desc(gallery.createdAt));

    // Get reactions for all gallery items
    const allReactions = await db
      .select()
      .from(galleryReactions);

    // Combine data
    return galleryItems.map(item => ({
      ...item,
      reactions: allReactions.filter(r => r.galleryId === item.id),
    }));
  }

  async addGalleryReaction(reactionData: InsertGalleryReaction & { userId: string }): Promise<GalleryReaction> {
    // Remove existing reaction from this user for this gallery item
    await db
      .delete(galleryReactions)
      .where(
        and(
          eq(galleryReactions.userId, reactionData.userId),
          eq(galleryReactions.galleryId, reactionData.galleryId)
        )
      );

    // Add new reaction
    const [reaction] = await db
      .insert(galleryReactions)
      .values(reactionData)
      .returning();

    return reaction;
  }

  async removeGalleryReaction(userId: string, galleryId: string): Promise<boolean> {
    const result = await db
      .delete(galleryReactions)
      .where(
        and(
          eq(galleryReactions.userId, userId),
          eq(galleryReactions.galleryId, galleryId)
        )
      )
      .returning();

    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();