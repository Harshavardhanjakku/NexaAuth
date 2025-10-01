# 🚀 NexaAuth - Complete Authentication & Multi-Tenant Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-26.3.1-blue.svg)](https://www.keycloak.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-black.svg)](https://expressjs.com/)

> **NexaAuth** is a powerful, production-ready authentication and multi-tenant management system built with **Keycloak** and **Express.js**. It automatically creates users, organizations, and clients when users authenticate through Google IDP, providing a seamless multi-tenant experience.

## ✨ Features

- 🔐 **Google OAuth Integration** - Seamless Google login with automatic user provisioning
- 🏢 **Multi-Tenant Architecture** - Automatic organization and client creation
- 🛡️ **Keycloak Integration** - Enterprise-grade authentication and authorization
- 🚀 **RESTful API** - Complete API for user, organization, and client management
- 📱 **Responsive UI** - Beautiful OAuth callback handling
- 🔧 **Docker Support** - Easy deployment with Docker Compose
- 📊 **Comprehensive Logging** - Detailed debug information for troubleshooting
- 🎯 **Production Ready** - Built for scalability and reliability

## 🚀 Quick Start

### Prerequisites

- **Node.js** 14+ 
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/NexaAuth.git
cd NexaAuth
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Keycloak

```bash
docker-compose up -d
```

### 4. Start NexaAuth Backend

```bash
npm start
```

### 5. Access the System

- **Keycloak Admin**: http://localhost:8080/admin (admin/admin)
- **NexaAuth Backend**: http://localhost:3000
- **Google Login**: http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid

## 📋 API Endpoints

### 🔐 Google Identity Provider Endpoints

#### **Primary Google IDP Endpoint**
**POST** `/register-google-idp`
- **Purpose**: Main endpoint for Google IDP user registration
- **Triggered**: Automatically by OAuth callback flow
- **Process**: Creates organization and client for existing Google user
- **Input**: `keycloakId`, `email`, `firstName`, `lastName`
- **Output**: Complete user, organization, and client details

#### **Existing Google User Endpoint**
**POST** `/register-existing-google-user`
- **Purpose**: Create org/client for existing Google users
- **Use Case**: Manual registration of users who already exist in Keycloak
- **Input**: `email` only
- **Process**: Finds existing user, creates organization and client

#### **OAuth Callback Handler**
**GET** `/` (with query parameters)
- **Purpose**: Handles OAuth redirect from Keycloak
- **Process**: Exchanges authorization code for token, extracts user info, calls registration API
- **Query Params**: `code`, `state`, `error`
- **Response**: HTML page with success/error status

#### **Test Google Login**
**GET** `/test`
- **Purpose**: Provides test interface for Google login flow
- **Response**: HTML page with Google login button
- **Use Case**: Manual testing of complete OAuth flow

### 🔐 Authentication Endpoints

#### `GET /`
**Service Information**
```http
GET http://localhost:3000/
```

**Response:**
```json
{
  "message": "NexaAuth Backend Service",
  "status": "running",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health",
    "register": "POST /register",
    "register-google": "POST /register-google",
    "register-google-idp": "POST /register-google-idp",
    "register-existing-google-user": "POST /register-existing-google-user"
  }
}
```

#### `GET /health`
**Health Check**
```http
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-10T10:30:00.000Z"
}
```

### 👤 User Management Endpoints

#### `POST /register`
**Register New User**
```http
POST http://localhost:3000/register
Content-Type: application/json

{
  "keycloakId": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "uuid-string",
    "email": "user@example.com",
    "clientId": "client-example-user",
    "clientUuid": "client-uuid",
    "clientSecret": "client-secret",
    "organizationName": "org-example-user",
    "organizationId": "org-uuid",
    "domain": "org-example-user.org"
  }
}
```

#### `POST /register-google`
**Register Google User**
```http
POST http://localhost:3000/register-google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### `POST /register-google-idp`
**Register Google IDP User**
```http
POST http://localhost:3000/register-google-idp
Content-Type: application/json

{
  "keycloakId": "uuid-string",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### `POST /register-existing-google-user`
**Register Existing Google User**
```http
POST http://localhost:3000/register-existing-google-user
Content-Type: application/json

{
  "email": "user@gmail.com"
}
```

### 🧪 Testing Endpoints

#### `GET /test`
**Test Page**
```http
GET http://localhost:3000/test
```
Returns a test page for Google login flow with debug information.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=nexaauth
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_CLIENT_ID=nexaauth-app
```

### Keycloak Client Configuration

1. **Access Keycloak Admin**: http://localhost:8080/admin
2. **Login**: admin/admin
3. **Select Realm**: nexaauth
4. **Go to Clients** → `nexaauth-app`
5. **Configure Settings**:
   - **Root URL**: `http://localhost:3000`
   - **Home URL**: `http://localhost:3000`
   - **Valid Redirect URIs**: `http://localhost:3000/*`
   - **Valid Post Logout Redirect URIs**: `http://localhost:3000/*`
   - **Web Origins**: `http://localhost:3000`

## 🎯 Google Identity Provider (IDP) Workflow

### 🔄 Complete Authentication Flow

#### **Step-by-Step Process:**

1. **🚀 User Initiates Login**
   - User opens: `http://localhost:3000/test`
   - Clicks "Test Google Login" button
   - Redirected to Keycloak Google IDP

2. **🔐 Google Authentication**
   - Keycloak redirects to Google OAuth
   - User authenticates with Google credentials
   - Google validates user identity

3. **🔄 Token Exchange**
   - Google redirects back to Keycloak with authorization code
   - Keycloak exchanges code for access token
   - Keycloak creates/finds user in realm

4. **📡 Backend Processing**
   - Keycloak redirects to NexaAuth backend (`http://localhost:3000`)
   - Backend receives authorization code
   - Backend exchanges code for JWT token
   - Backend extracts user information from JWT

5. **🏢 Automatic Resource Creation**
   - **User**: Already exists (created by Google IDP)
   - **Organization**: Created automatically based on user data
   - **Client**: Created automatically for the organization
   - **Roles**: Assigned automatically to user

6. **✅ Success Response**
   - Success page displayed with all created resources
   - User can now access their organization and client

### 🔧 Google IDP Configuration

#### **Keycloak Identity Provider Setup:**

1. **Access Keycloak Admin**: http://localhost:8080/admin
2. **Select Realm**: nexaauth
3. **Go to Identity Providers** → **Add provider** → **Google**
4. **Configure Google OAuth**:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
   - **Default Scopes**: `openid profile email`

#### **Google IDP Mappers:**

The system automatically maps Google user attributes:

| Google Attribute | Keycloak Attribute | Description |
|------------------|-------------------|-------------|
| `sub` | `keycloakId` | Unique Google user identifier |
| `email` | `email` | User's email address |
| `given_name` | `firstName` | User's first name |
| `family_name` | `lastName` | User's last name |
| `name` | `fullName` | User's full name |
| `picture` | `picture` | User's profile picture URL |

#### **Automatic Resource Naming:**

- **Organization Name**: `org-{domain}-{sanitized-name}`
  - Example: `org-gmail-johndoe` (for john.doe@gmail.com)
- **Client ID**: `client-{domain}-{sanitized-name}`
  - Example: `client-gmail-johndoe`
- **Domain**: `{sanitized-org-name}.org`
  - Example: `org-gmail-johndoe.org`

#### **Name Sanitization Process:**

```javascript
// Input: "John Doe" (firstName + lastName)
// Output: "johndoe" (lowercase, no spaces, no special chars)

// Input: "john.doe@gmail.com"
// Domain: "gmail"
// Sanitized: "johndoe"
// Final: "org-gmail-johndoe"
```

## 🛠️ Development

### Project Structure

```
NexaAuth/
├── 📁 public/                          # Static files and frontend assets
│   ├── oauth-callback.html            # OAuth callback handler with debug logging
│   └── test-google-login.html         # Test page for Google login flow
├── 📁 docker/                         # Docker configuration files
├── 📁 node_modules/                   # Node.js dependencies (ignored by git)
├── 📄 .env                            # Environment variables (ignored by git)
├── 📄 .gitignore                      # Git ignore rules
├── 📄 docker-compose.yml              # Docker services configuration
├── 📄 index.js                        # Main application file
├── 📄 package.json                    # Node.js dependencies and scripts
├── 📄 package-lock.json              # Dependency lock file
├── 📄 README.md                       # Main project documentation
├── 📄 API-DOCUMENTATION.md            # Complete API reference
├── 📄 SETUP-GUIDE.md                  # Installation and configuration guide
├── 📄 PROJECT-STRUCTURE.md            # Project organization overview
└── 📄 NexaAuth-API.postman_collection.json  # Postman collection for testing
```

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Install dependencies
npm install
```

### Development Workflow

1. **Start Keycloak**: `docker-compose up -d`
2. **Start Backend**: `npm run dev`
3. **Test Google Login**: http://localhost:3000/test
4. **Check Logs**: Monitor console for debug information

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services

- **Keycloak**: Authentication server
- **NexaAuth**: Backend API service

## 📊 Monitoring & Debugging

### Debug Logging

The system provides comprehensive logging:

```javascript
// Example debug output
[DEBUG] sanitizeName input: "John Doe"
[DEBUG] sanitizeName output: "johndoe"
[MAIN] Creating Keycloak client: client-gmail-johndoe
[MAIN] Creating organization: org-gmail-johndoe
[MAIN] Adding member to organization: user@example.com
```

### Health Monitoring

```bash
# Check backend health
curl http://localhost:3000/health

# Check Keycloak status
curl http://localhost:8080/realms/nexaauth
```

## 🧪 Testing

### Manual Testing

1. **Start Services**:
   ```bash
   docker-compose up -d
   npm start
   ```

2. **Test Google Login**:
   - Open: http://localhost:3000/test
   - Click "Test Google Login"
   - Complete Google authentication
   - Verify user, organization, and client creation

3. **Test API Endpoints**:
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Register user
   curl -X POST http://localhost:3000/register \
     -H "Content-Type: application/json" \
     -d '{"keycloakId":"test","email":"test@example.com","firstName":"Test","lastName":"User"}'
   ```

## 📚 Documentation

### 📖 Complete Documentation
- **[API Documentation](API-DOCUMENTATION.md)** - Complete API reference with examples
- **[Setup Guide](SETUP-GUIDE.md)** - Detailed installation and configuration guide
- **[Project Structure](PROJECT-STRUCTURE.md)** - Complete project organization overview
- **[README](README.md)** - This file (overview and quick start)

### 🔗 Quick Links
- **API Endpoints**: [API-DOCUMENTATION.md](API-DOCUMENTATION.md#endpoints)
- **Setup Instructions**: [SETUP-GUIDE.md](SETUP-GUIDE.md#installation-steps)
- **Troubleshooting**: [SETUP-GUIDE.md](SETUP-GUIDE.md#troubleshooting)
- **Production Deployment**: [SETUP-GUIDE.md](SETUP-GUIDE.md#production-deployment)

### 📋 Complete API Reference

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/` | Service information | None |
| `GET` | `/health` | Health check | None |
| `GET` | `/test` | Test page | None |
| `POST` | `/register` | Register user | `keycloakId`, `email`, `firstName`, `lastName` |
| `POST` | `/register-google` | Register Google user | `email`, `firstName`, `lastName` |
| `POST` | `/register-google-idp` | Register Google IDP user | `keycloakId`, `email`, `firstName`, `lastName` |
| `POST` | `/register-existing-google-user` | Register existing user | `email` |

### Error Handling

```json
{
  "error": "Validation Error",
  "message": "Missing required fields: keycloakId and email are required",
  "status": 400,
  "timestamp": "2024-01-10T10:30:00.000Z"
}
```

## 🆘 Troubleshooting

### Common Issues

#### 1. "Connection Refused" Error
```bash
# Check if Keycloak is running
docker-compose ps

# Restart Keycloak
docker-compose restart keycloak
```

#### 2. "Invalid redirect_uri" Error
```bash
# Check Keycloak client configuration
# Ensure redirect URI is: http://localhost:3000/*
```

#### 3. "Token Exchange Failed" Error
```bash
# Check Keycloak logs
docker-compose logs keycloak

# Verify client configuration
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
PORT=3000
KEYCLOAK_SERVER_URL=https://your-keycloak-domain.com
KEYCLOAK_REALM=production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=secure-password
KEYCLOAK_CLIENT_ID=nexaauth-app
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Keycloak** - Enterprise identity and access management
- **Express.js** - Fast, unopinionated web framework
- **Google OAuth** - Secure authentication provider
- **Docker** - Containerization platform

---

<div align="center">

**Made with ❤️ by the NexaAuth Team**

[⭐ Star this repo](https://github.com/yourusername/NexaAuth) | [🐛 Report Bug](https://github.com/yourusername/NexaAuth/issues) | [💡 Request Feature](https://github.com/yourusername/NexaAuth/issues)

</div>