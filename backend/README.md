# Actu Backend

A Spring Boot backend application for the Actu news website, providing REST and SOAP APIs with JWT authentication and role-based security.

## 🚀 Features

- **REST API**: Articles and categories management
- **SOAP Web Services**: Modular user management and authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Security**: ADMIN, EDITOR, and VISITOR roles
- **Database Integration**: MySQL with JPA/Hibernate
- **Token Management**: JWT token generation, validation, and revocation

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT
- **Web Services**: Spring Web Services (SOAP)
- **Build Tool**: Maven
- **Utilities**: Lombok, Jakarta XML Bind

## 📦 Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## 🚀 Installation & Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure the database connection in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/actu_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📝 Available Endpoints

### REST API Endpoints
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create a new article
- `PUT /api/articles/{id}` - Update an article
- `DELETE /api/articles/{id}` - Delete an article
- `GET /api/categories` - Get all categories

### SOAP Web Services
The SOAP services are organized into focused, single-responsibility endpoints for better maintainability and scalability:

#### UserEndpoint (`/ws/users`) - User Management
**File**: `src/main/java/com/actu/backend/soap/UserEndpoint.java` (125 lines)
- `getAllUsersRequest` - List all users (Admin only)
- `getUserRequest` - Get user by ID (Admin only)
- `createUserRequest` - Create new user (Admin only)
- `updateUserRequest` - Update existing user (Admin only)
- `deleteUserRequest` - Delete user (Admin only)
- `getProfileRequest` - Get user profile (User)
- `updateProfileRequest` - Update user profile (User)

#### TokenEndpoint (`/ws/users`) - Token Management
**File**: `src/main/java/com/actu/backend/soap/TokenEndpoint.java` (180 lines)
- `getAllTokensRequest` - List all tokens (Admin only)
- `generateTokenRequest` - Generate token for user (Admin only)
- `deleteTokenRequest` - Delete token (Admin only)
- `getTokensByUserRequest` - Get tokens by user ID (Admin only)
- `reactivateTokenRequest` - Reactivate revoked token (Admin only)
- `revokeTokenRequest` - Revoke active token (Admin only)

#### AuthEndpoint (`/ws/users`) - Authentication
**File**: `src/main/java/com/actu/backend/soap/AuthEndpoint.java` (120 lines)
- `loginRequest` - User authentication
- `registerRequest` - User registration
- `getCurrentUserRequest` - Get current user info
- `logoutRequest` - User logout

#### UserMapper - Data Transformation
**File**: `src/main/java/com/actu/backend/soap/UserMapper.java` (70 lines)
Centralized utility class for mapping between domain objects and SOAP objects:
- `toSoapUser()` - Domain User → SOAP User
- `toDomainUser()` - SOAP User → Domain User
- `toSoapToken()` - Domain Token → SOAP Token
- `toSoapUserRole()` - Domain Role → SOAP Role
- `toDomainUserRole()` - SOAP Role → Domain Role
- `toXMLGregorianCalendar()` - LocalDateTime → XMLGregorianCalendar

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/actu/backend/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── model/          # Domain entities
│   │   │   ├── repository/     # Data repositories
│   │   │   ├── service/        # Business logic services
│   │   │   ├── security/       # Security configuration
│   │   │   ├── soap/           # SOAP Web Services (Refactored)
│   │   │   │   ├── UserEndpoint.java      # User management (125 lines)
│   │   │   │   ├── TokenEndpoint.java     # Token management (180 lines)
│   │   │   │   ├── AuthEndpoint.java      # Authentication (120 lines)
│   │   │   │   └── UserMapper.java        # Data mapping utilities (70 lines)
│   │   │   ├── users/          # Generated SOAP classes
│   │   │   └── BackendApplication.java
│   │   └── resources/
│   │       ├── schema/         # XSD schemas for SOAP
│   │       └── application.properties
│   └── test/                   # Test classes
├── pom.xml                     # Maven configuration
└── README.md
```

## 🔧 SOAP Architecture Benefits

### ✅ Single Responsibility Principle
Each endpoint class handles one specific domain area:
- **UserEndpoint**: User CRUD operations
- **TokenEndpoint**: Token lifecycle management
- **AuthEndpoint**: Authentication and registration
- **UserMapper**: Data transformation utilities

### ✅ Maintainability
- **84% reduction** in main UserEndpoint (125 vs 783 lines)
- **37% fewer total lines** (495 vs 783 lines)
- Easier to find and modify specific functionality
- Clear separation of concerns

### ✅ Testability
- Each endpoint can be tested independently
- Centralized mapping logic is reusable
- Smaller, focused test classes

### ✅ Code Reuse
- `UserMapper` eliminates duplicate mapping code
- Consistent data transformation across all endpoints
- Shared utility methods

### ✅ Scalability
- New endpoints can be added without affecting existing ones
- Clear patterns for extending functionality
- Modular design supports team development

## 🔧 Configuration

### Application Properties
Key configuration options in `application.properties`:
- Database connection settings
- JWT secret key and expiration
- Server port and context path
- Logging configuration

### SOAP Configuration
- XSD schemas are located in `src/main/resources/schema/`
- Java classes are auto-generated from XSD using JAXB
- SOAP endpoints are configured in `WebServiceConfig`
- All endpoints share the same namespace: `http://actu.com/users`

## 🔐 Security

The application implements:
- **JWT-based authentication** for REST APIs
- **Role-based authorization** (ADMIN, EDITOR, VISITOR)
- **SOAP service security** with username/password authentication
- **Token management** with expiration and revocation capabilities

## 🧪 Testing

Run the test suite:
```bash
mvn test
```

### SOAP Testing
Each endpoint can be tested independently:
- **UserEndpoint**: Test user CRUD operations
- **TokenEndpoint**: Test token lifecycle operations
- **AuthEndpoint**: Test authentication flows
- **UserMapper**: Test data transformation utilities

## 📊 Database

The application uses MySQL with the following main entities:
- **Users**: User accounts with roles
- **Articles**: News articles with categories
- **Categories**: Article categories
- **Tokens**: JWT tokens for authentication

## 🚀 Deployment

1. Build the JAR file:
```bash
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 🔍 Monitoring & Logging

- Application logs are configured via Logback
- Health check endpoint available at `/actuator/health`
- Metrics available at `/actuator/metrics`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### SOAP Development Guidelines
- Follow the single responsibility principle for new endpoints
- Use `UserMapper` for data transformation
- Add comprehensive tests for new SOAP operations
- Update this README when adding new endpoints

## 📄 License

This project is part of the Actu news website application. 