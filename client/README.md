# Actu Client

A Python command-line interface (CLI) application for managing users and tokens in the Actu news website system via SOAP web services.

## 🚀 Features

- **User Management**: Create, read, update, and delete users
- **Token Management**: Generate, revoke, and manage JWT tokens
- **SOAP Integration**: Full integration with backend SOAP web services
- **Interactive CLI**: User-friendly command-line interface
- **Role-Based Operations**: Support for ADMIN, EDITOR, and VISITOR roles
- **Authentication**: Secure login system with role validation

## 🛠️ Tech Stack

- **Language**: Python 3.x
- **SOAP Client**: Zeep library
- **HTTP Requests**: Requests library
- **CLI Interface**: Custom interactive menu system

## 📦 Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## 🚀 Installation & Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python main.py
```

## 📝 Available Operations

### 👥 User Management
1. **📋 List all users** - Display all registered users in the system
2. **➕ Create a new user** - Add a new user with specified role and details
3. **✏️ Modify a user** - Update existing user information
4. **🗑️ Delete a user** - Remove a user from the system

### 🔑 Token Management
5. **🔑 List all tokens** - Display all JWT tokens in the system
6. **➕ Generate a token** - Create a new JWT token for a specific user
7. **🗑️ Delete a token** - Permanently remove a token
8. **👤 View user tokens** - List all tokens belonging to a specific user
9. **🔄 Reactivate a token** - Reactivate a previously revoked token
10. **❌ Revoke a token** - Revoke a token without deleting it

### ⚙️ Other Operations
11. **🔄 Refresh** - Refresh the display and reload data
12. **🚪 Quit** - Exit the application

## 🔐 Authentication

The application requires authentication with valid credentials:
- **Username**: Your system username
- **Password**: Your system password
- **Role**: Determines available operations (ADMIN has full access)

### Default Credentials
- Username: `admin`
- Password: `password`
- Role: `ADMIN`

## 💻 Usage Example

```
🔧 APPLICATION CLIENT - GESTION DES UTILISATEURS SOAP
============================================================

🔐 AUTHENTIFICATION
------------------------------
Nom d'utilisateur: admin
Mot de passe: password
✅ Authentification réussie - Rôle: ADMIN
✅ Bienvenue admin (ADMIN)

============================================================
📋 MENU PRINCIPAL - GESTION DES UTILISATEURS ET TOKENS
============================================================
👥 GESTION DES UTILISATEURS:
  1. 📋 Lister tous les utilisateurs
  2. ➕ Créer un nouvel utilisateur
  3. ✏️  Modifier un utilisateur
  4. 🗑️  Supprimer un utilisateur

🔑 GESTION DES TOKENS:
  5. 🔑 Lister tous les tokens
  6. ➕ Générer un token pour un utilisateur
  7. 🗑️  Supprimer un token
  8. 👤 Voir les tokens d'un utilisateur
  9. 🔄 Réactiver un token
  10. ❌ Révoquer un token

⚙️  AUTRES:
  11. 🔄 Rafraîchir
  12. 🚪 Quitter

Votre choix (1-12): 1

📋 LISTE DES UTILISATEURS
----------------------------------------
ID   Username        Email                     Rôle      
------------------------------------------------------------
1    admin           admin@actu.com            ADMIN     
2    editor          editor@actu.com           EDITOR    
3    visitor         visitor@actu.com          VISITOR   
```

## 🔧 Configuration

### Backend Connection
The client connects to the backend SOAP services. Ensure the backend is running on the expected URL (default: `http://localhost:8080/ws/`).

### Environment Variables
You can configure the backend URL by setting environment variables or modifying the connection settings in the code.

## 🏗️ Project Structure

```
client/
├── main.py              # Main application entry point
├── requirements.txt     # Python dependencies
├── venv/               # Virtual environment (created locally)
└── README.md           # This documentation
```

## 🔍 SOAP Operations

The application supports the following SOAP operations:

### User Management
- `loginRequest` - User authentication
- `getAllUsersRequest` - Retrieve all users
- `createUserRequest` - Create a new user
- `updateUserRequest` - Update user information
- `deleteUserRequest` - Delete a user

### Token Management
- `getAllTokensRequest` - Retrieve all tokens
- `generateTokenRequest` - Generate a new token
- `deleteTokenRequest` - Delete a token
- `getTokensByUserRequest` - Get tokens by user ID
- `reactivateTokenRequest` - Reactivate a revoked token
- `revokeTokenRequest` - Revoke a token

## 🚀 Development

### Running in Development Mode
```bash
# Activate virtual environment
source venv/bin/activate

# Run the application
python main.py
```

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Input validation for user data
- Connection error handling
- Authentication verification
- Role-based access control

## 📊 Data Format

### User Data Structure
- **ID**: Unique user identifier
- **Username**: Login username
- **Email**: User email address
- **Role**: User role (ADMIN, EDITOR, VISITOR)

### Token Data Structure
- **ID**: Unique token identifier
- **User ID**: Associated user ID
- **Created**: Token creation timestamp
- **Expires**: Token expiration timestamp
- **Revoked**: Token revocation status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add error handling and validation
5. Test with different user roles
6. Submit a pull request

## 📄 License

This project is part of the Actu news website application.

## 🆘 Troubleshooting

### Common Issues
- **Connection Error**: Ensure the backend server is running
- **Authentication Failed**: Verify username and password
- **Permission Denied**: Check user role and permissions
- **SOAP Error**: Verify backend SOAP service configuration 