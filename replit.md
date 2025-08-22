# Overview

OLOF Alumni Community is a full-stack web application designed to connect graduates from Our Lady of Fatima from 1999-2024. The platform enables alumni to reconnect through an interactive community featuring user profiles, a searchable alumni database, and social media-style posting functionality with reactions and comments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom design tokens and dark theme support

## Backend Architecture
- **Runtime**: Node.js with Express.js RESTful API
- **Language**: TypeScript with ES modules for modern development experience
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Uploads**: Multer middleware for handling profile pictures, cover photos, and post media
- **Email Service**: Nodemailer with Gmail SMTP for verification and password reset emails

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database**: PostgreSQL with connection pooling via node-postgres
- **Schema Design**: Relational model with users, posts, reactions, and comments tables
- **Connection**: Uses both Neon serverless driver and traditional PostgreSQL pool for flexibility

## Authentication & Authorization
- **Registration Flow**: Email verification with 6-digit codes sent via Nodemailer
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Session Management**: JWT tokens stored in localStorage with automatic expiration handling
- **Password Recovery**: Secure reset codes with expiration timestamps

## File Management
- **Upload Strategy**: Local file system storage with unique filename generation
- **File Types**: Support for images, videos, audio, and documents up to 10MB
- **URL Generation**: Static file serving through Express with public access endpoints
- **Validation**: File type and size validation with error handling

## External Dependencies

- **Database**: PostgreSQL database (configured for both local and Neon serverless)
- **Email Service**: Gmail SMTP server for transactional emails (verification, password reset)
- **File Storage**: Local filesystem for uploaded media and profile assets
- **UI Components**: Radix UI component library for accessible, unstyled primitives
- **Development Tools**: Vite development server with hot module replacement and TypeScript support