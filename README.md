# Actu - News Website Application

A comprehensive news website application built with modern technologies, featuring a microservices architecture with REST and SOAP APIs, a modern React frontend, and a Python CLI client.

## 🏗️ Architecture Overview

The Actu project consists of three main applications:

- **🎨 Frontend** (`actu-frontend/`) - Next.js React application with modern UI
- **🔧 Backend** (`backend/`) - Spring Boot application with REST and SOAP APIs
- **💻 Client** (`client/`) - Python CLI for system administration

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **Python 3.7+** (for client)
- **MySQL 8.0+** (database)
- **Maven 3.6+** (build tool)

### 1. Start the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### 2. Start the Frontend

```bash
cd actu-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Use the Client

```bash
cd client
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 📋 Features

### 🌐 Frontend Features
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **SOAP Integration**: Client-side SOAP requests for user management
- **Responsive Design**: Mobile-first approach with modern UI components
- **Component Library**: Uses Radix UI primitives for accessible components

### 🔧 Backend Features
- **REST API**: Articles and categories management
- **SOAP Web Services**: Modular user management and authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Security**: ADMIN, EDITOR, and VISITOR roles
- **Database Integration**: MySQL with JPA/Hibernate
- **Token Management**: JWT token generation, validation, and revocation

### 💻 Client Features
- **User Management**: Create, read, update, and delete users
- **Token Management**: Generate, revoke, and manage JWT tokens
- **SOAP Integration**: Full integration with backend SOAP web services
- **Interactive CLI**: User-friendly command-line interface
- **Role-Based Operations**: Support for ADMIN, EDITOR, and VISITOR roles

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React icons
- **SOAP Client**: easy-soap-request, fast-xml-parser

### Backend
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT
- **Web Services**: Spring Web Services (SOAP)
- **Build Tool**: Maven

### Client
- **Language**: Python 3.x
- **SOAP Client**: Zeep library
- **HTTP Requests**: Requests library
- **CLI Interface**: Custom interactive menu system

## 📁 Project Structure

```
actu/
├── actu-frontend/          # Next.js React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/                # Spring Boot backend
│   ├── src/main/java/com/actu/backend/
│   │   ├── soap/          # SOAP Web Services
│   │   │   ├── UserEndpoint.java      # User management (125 lines)
│   │   │   ├── TokenEndpoint.java     # Token management (180 lines)
│   │   │   ├── AuthEndpoint.java      # Authentication (120 lines)
│   │   │   └── UserMapper.java        # Data mapping utilities (70 lines)
│   │   ├── model/         # Domain entities
│   │   ├── repository/    # Data access layer
│   │   └── security/      # JWT and security
│   ├── pom.xml
│   └── README.md
├── client/                 # Python CLI client
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── .gitignore
└── README.md              # This file
```

## 🔐 Authentication & Security

### User Roles
- **ADMIN**: Full access to all features
- **EDITOR**: Can manage articles and limited user operations
- **VISITOR**: Read-only access to articles

### Authentication Methods
- **JWT Tokens**: For REST API authentication
- **Username/Password**: For SOAP services and CLI client
- **Role-Based Access Control**: Different permissions per role

## 🌐 API Endpoints

### REST API (Backend)
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create a new article
- `PUT /api/articles/{id}` - Update an article
- `DELETE /api/articles/{id}` - Delete an article
- `GET /api/categories` - Get all categories

### SOAP Web Services (Backend)
The SOAP services are organized into focused, single-responsibility endpoints:

#### UserEndpoint (`/ws/users`)
- `getAllUsersRequest` - List all users (Admin only)
- `getUserRequest` - Get user by ID (Admin only)
- `createUserRequest` - Create new user (Admin only)
- `updateUserRequest` - Update existing user (Admin only)
- `deleteUserRequest` - Delete user (Admin only)
- `getProfileRequest` - Get user profile (User)
- `updateProfileRequest` - Update user profile (User)

#### TokenEndpoint (`/ws/users`)
- `getAllTokensRequest` - List all tokens (Admin only)
- `generateTokenRequest` - Generate token for user (Admin only)
- `deleteTokenRequest` - Delete token (Admin only)
- `getTokensByUserRequest` - Get tokens by user ID (Admin only)
- `reactivateTokenRequest` - Reactivate revoked token (Admin only)
- `revokeTokenRequest` - Revoke active token (Admin only)

#### AuthEndpoint (`/ws/users`)
- `loginRequest` - User authentication
- `registerRequest` - User registration
- `getCurrentUserRequest` - Get current user info
- `logoutRequest` - User logout

#### Architecture Benefits
- **Single Responsibility**: Each endpoint handles one domain area
- **Maintainability**: Easier to find and modify specific functionality
- **Testability**: Each endpoint can be tested independently
- **Code Reuse**: Centralized `UserMapper` for consistent data transformation
- **Scalability**: New endpoints can be added without affecting existing ones

## 🗄️ Database Schema

The application uses MySQL with the following main entities:
- **Users**: User accounts with roles and authentication
- **Articles**: News articles with categories and content
- **Categories**: Article categories for organization
- **Tokens**: JWT tokens for authentication and session management

## 🚀 Deployment

### Development
Each application can be run independently in development mode. See individual README files for specific instructions.

### Production
For production deployment:
1. Build the backend JAR file
2. Deploy the frontend to a static hosting service
3. Configure environment variables
4. Set up a production MySQL database

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd actu-frontend
npm run lint
```

### Client Testing
The client includes comprehensive error handling and validation for all operations.

## 🔧 Configuration

### Environment Variables
Each application has its own configuration:
- **Backend**: `application.properties` for database and JWT settings
- **Frontend**: `.env.local` for API endpoints and environment settings
- **Client**: Connection settings in the main application file

### Database Configuration
Configure MySQL connection in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/actu_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch for each application
3. Make your changes
4. Add tests where applicable
5. Update documentation
6. Submit pull requests for each application

## 📄 License

This project is licensed under the MIT License - see the individual application directories for specific license information.

## 🆘 Support

For issues and questions:
1. Check the individual application README files
2. Review the troubleshooting sections
3. Check the application logs for error details
4. Ensure all prerequisites are met

## 🔄 Development Workflow

1. **Backend First**: Start with the backend as it provides APIs for other applications
2. **Database Setup**: Ensure MySQL is running and configured
3. **Frontend Development**: Use the backend APIs for frontend development
4. **Client Testing**: Use the CLI client to test user and token management
5. **Integration Testing**: Test the complete workflow across all applications 
