# Drishti - Mahakumbh 2028 Command Center

## Overview

Drishti is a comprehensive crowd management and safety monitoring system designed for the Mahakumbh 2028 festival. It's a full-stack web application that uses AI-powered computer vision to analyze crowd density, detect incidents, and coordinate emergency responses. The system features real-time monitoring through camera feeds, multilingual alert broadcasts, volunteer management, and lost person identification capabilities.

The application serves as a command center for festival organizers, providing real-time insights into crowd conditions, incident detection, and emergency response coordination across multiple zones of the festival grounds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with custom spiritual theme and design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket connection for live updates and incident notifications
- **Internationalization**: Multi-language support (Hindi, English, Marathi, Sanskrit) with custom fonts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with WebSocket support for real-time features
- **File Uploads**: Multer middleware for handling image uploads
- **Session Management**: Express sessions with PostgreSQL storage
- **Error Handling**: Global error handling middleware with structured error responses

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Design**: Normalized relational schema with tables for users, sources, frames, analyses, reports, events, volunteers, and lost persons
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Security**: HTTP-only cookies with secure flag and configurable TTL
- **User Management**: Automatic user creation and profile synchronization from OIDC claims

### Real-time Features
- **WebSocket Server**: Integrated WebSocket server for live updates
- **Event Broadcasting**: Real-time incident notifications and alert confirmations
- **Client State Sync**: Automatic UI updates for incidents, alerts, and system status changes

### AI & Computer Vision Integration
- **Primary AI Provider**: OpenAI GPT-5 for advanced image analysis and natural language processing
- **Local Python AI Services**: Custom computer vision models using OpenCV, scikit-learn, and NumPy for real-time crowd analysis
- **Hybrid AI Architecture**: Seamless switching between cloud-based OpenAI services and local Python processing
- **Image Analysis**: Automated crowd density analysis, face detection, behavior pattern recognition, and risk assessment
- **Multilingual Content**: AI-powered translation and localization for emergency alerts in Hindi, English, Marathi, and Sanskrit
- **Audio Processing**: Python-based transcription capabilities for audio-based incident reporting
- **Face Recognition**: Local Python services for lost person identification and matching

### File Storage & Media Handling
- **Image Processing**: In-memory buffer processing with Multer
- **Camera Integration**: Support for RTSP, HTTP, and other camera protocols
- **Frame Analysis Pipeline**: Automated processing of camera feeds for crowd analysis

### Development & Deployment
- **Multi-Language Runtime**: Node.js 20 for backend services and Python 3.11 for AI/ML processing
- **Development Server**: Vite development server with HMR and middleware integration
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines with Python AI service integration
- **Environment Configuration**: Environment-based configuration for database, AI services, Python processes, and authentication
- **Python Integration**: FastAPI-based Python services for computer vision and ML tasks
- **Static Asset Serving**: Production-ready static file serving with Express
- **AI Service Architecture**: Dual-mode AI processing (cloud OpenAI + local Python services)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Driver**: @neondatabase/serverless for optimized serverless connections

### AI & Machine Learning
- **OpenAI API**: GPT-5 model for advanced image analysis, content generation, and multilingual processing
- **Python AI Stack**: OpenCV, NumPy, scikit-learn, Pillow, and SciPy for local computer vision processing
- **Computer Vision**: Multi-modal image analysis combining cloud AI and local Python models
- **Face Recognition**: Python-based facial feature extraction and similarity matching for lost person identification
- **Crowd Analysis**: Real-time density estimation, movement pattern detection, and risk assessment using Python CV libraries
- **Audio Processing**: Python-based audio transcription and natural language processing for incident reports

### Authentication Services
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Session Management**: PostgreSQL-backed session storage with automatic cleanup

### Real-time Communication
- **WebSocket**: Native WebSocket implementation for bidirectional communication
- **Push Notifications**: Real-time incident alerts and system status updates

### Mapping & Geospatial
- **Leaflet**: Open-source mapping library for interactive zone visualization
- **Geospatial Data**: Coordinate-based tracking for incidents and camera locations

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Comprehensive icon library for UI elements
- **Google Fonts**: Custom font loading for multilingual text rendering

### Development Tools
- **Vite**: Fast development server and build tool with plugin ecosystem
- **TypeScript**: Type safety across frontend and backend codebases
- **ESLint & Prettier**: Code quality and formatting tools (implicit)
- **Replit Integration**: Development environment optimizations and error handling