# Actu Backend

A Spring Boot backend application for the Actu news website, providing REST and SOAP APIs with JWT authentication and role-based security.

## 🚀 Features

- **REST API**: Articles and categories management
- **SOAP Web Services**: User management and authentication
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
- **User Management**: `/ws/users`
  - `getAllUsersRequest` - Get all users
  - `createUserRequest` - Create a new user
  - `updateUserRequest` - Update a user
  - `deleteUserRequest` - Delete a user
  - `loginRequest` - User authentication

- **Token Management**: `/ws/tokens`
  - `getAllTokensRequest` - Get all tokens
  - `generateTokenRequest` - Generate a new token
  - `deleteTokenRequest` - Delete a token
  - `getTokensByUserRequest` - Get tokens by user
  - `reactivateTokenRequest` - Reactivate a revoked token
  - `revokeTokenRequest` - Revoke a token

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/actu/backend/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── entity/         # JPA entities
│   │   │   ├── repository/     # Data repositories
│   │   │   ├── service/        # Business logic services
│   │   │   ├── security/       # Security configuration
│   │   │   ├── users/          # SOAP user services
│   │   │   └── BackendApplication.java
│   │   └── resources/
│   │       ├── schema/         # XSD schemas for SOAP
│   │       └── application.properties
│   └── test/                   # Test classes
├── pom.xml                     # Maven configuration
└── README.md
```

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

## 📄 License

This project is part of the Actu news website application. 