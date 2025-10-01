# 📁 NexaAuth Project Structure

## 🏗️ Complete Project Overview

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
├── 📄 package.json                       # Node.js dependencies and scripts
├── 📄 package-lock.json              # Dependency lock file
├── 📄 README.md                       # Main project documentation
├── 📄 API-DOCUMENTATION.md            # Complete API reference
├── 📄 SETUP-GUIDE.md                  # Installation and configuration guide
├── 📄 PROJECT-STRUCTURE.md            # This file
└── 📄 NexaAuth-API.postman_collection.json  # Postman collection for testing
```

## 📋 File Descriptions

### 🚀 Core Application Files

#### `index.js` - Main Application
- **Purpose**: Main Express.js application with all API endpoints
- **Size**: ~1,083 lines
- **Key Features**:
  - Express.js server setup
  - Keycloak integration
  - User, organization, and client creation
  - OAuth callback handling
  - Comprehensive debug logging
  - Error handling and validation

#### `package.json` - Dependencies
- **Purpose**: Node.js project configuration
- **Dependencies**:
  - `express`: Web framework
  - `axios`: HTTP client for Keycloak API
  - `cors`: Cross-origin resource sharing
  - `dotenv`: Environment variable management
  - `uuid`: UUID generation
- **Scripts**:
  - `npm start`: Production server
  - `npm run dev`: Development server with nodemon

### 🐳 Docker Configuration

#### `docker-compose.yml` - Services
- **Purpose**: Docker services configuration
- **Services**:
  - **Keycloak**: Authentication server
    - Image: `quay.io/keycloak/keycloak:26.3.1`
    - Port: `8080:8080`
    - Environment: Admin credentials and database
    - Volumes: Persistent data storage

#### `docker/` - Docker Files
- **Purpose**: Additional Docker configuration files
- **Contents**: Custom Docker configurations if needed

### 🌐 Frontend Files

#### `public/oauth-callback.html` - OAuth Handler
- **Purpose**: Handles OAuth callbacks from Keycloak
- **Features**:
  - Beautiful responsive UI
  - Comprehensive debug logging
  - Error handling and display
  - Automatic organization/client creation
  - Success/error page display

#### `public/test-google-login.html` - Test Page
- **Purpose**: Test page for Google login flow
- **Features**:
  - Google login button
  - Debug console logging
  - Step-by-step process display
  - Error handling and retry options

### 📚 Documentation Files

#### `README.md` - Main Documentation
- **Purpose**: Project overview and quick start guide
- **Contents**:
  - Features and architecture
  - Quick start instructions
  - API endpoints overview
  - Configuration guide
  - Troubleshooting

#### `API-DOCUMENTATION.md` - API Reference
- **Purpose**: Complete API documentation
- **Contents**:
  - All endpoints with examples
  - Request/response formats
  - Error handling
  - Testing examples (cURL, PowerShell, JavaScript)
  - Security considerations

#### `SETUP-GUIDE.md` - Setup Instructions
- **Purpose**: Detailed installation and configuration
- **Contents**:
  - Prerequisites and system requirements
  - Step-by-step installation
  - Keycloak configuration
  - Testing procedures
  - Production deployment
  - Troubleshooting guide

#### `PROJECT-STRUCTURE.md` - This File
- **Purpose**: Complete project structure overview
- **Contents**:
  - File descriptions
  - Directory structure
  - Development workflow
  - Best practices

### 🔧 Configuration Files

#### `.env` - Environment Variables
- **Purpose**: Environment-specific configuration
- **Contents**:
  - Server port configuration
  - Keycloak connection settings
  - Admin credentials
  - Client configuration

#### `.gitignore` - Git Ignore Rules
- **Purpose**: Exclude files from version control
- **Excluded**:
  - `node_modules/` - Dependencies
  - `.env` - Environment variables
  - `*.log` - Log files
  - `dist/` - Build outputs
  - IDE files and OS files

### 🧪 Testing Files

#### `NexaAuth-API.postman_collection.json` - Postman Collection
- **Purpose**: API testing collection
- **Contents**:
  - All API endpoints
  - Request examples
  - Environment variables
  - Test scripts

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone https://github.com/yourusername/NexaAuth.git
cd NexaAuth

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Development Environment
```bash
# Start Keycloak
docker-compose up -d

# Start development server
npm run dev

# Test endpoints
curl http://localhost:3000/health
```

### 3. Testing
```bash
# Test Google login flow
open http://localhost:3000/test

# Test API endpoints
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"keycloakId":"test","email":"test@example.com","firstName":"Test","lastName":"User"}'
```

### 4. Production Deployment
```bash
# Build for production
npm install --production

# Start production server
npm start

# Monitor logs
pm2 logs nexaauth
```

## 📊 Code Organization

### Express.js Application Structure

```javascript
// index.js structure
const express = require('express');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const KEYCLOAK_CONFIG = { ... };

// Helper Functions
const getKeycloakAdminToken = async () => { ... };
const sanitizeName = (name) => { ... };
const createKeycloakClient = async (clientData) => { ... };
const createOrganization = async (orgData) => { ... };

// API Routes
app.get('/', (req, res) => { ... });
app.get('/health', (req, res) => { ... });
app.get('/test', (req, res) => { ... });
app.post('/register', async (req, res) => { ... });
app.post('/register-google', async (req, res) => { ... });
app.post('/register-google-idp', async (req, res) => { ... });
app.post('/register-existing-google-user', async (req, res) => { ... });

// Server startup
app.listen(PORT, () => { ... });
```

### Key Functions

#### Authentication Functions
- `getKeycloakAdminToken()` - Get admin access token
- `checkUserExists(email)` - Check if user exists
- `findGoogleIdpUser(email)` - Find Google IDP user

#### User Management Functions
- `createTestUser(userData)` - Create test user
- `handleUserRegistration(userData)` - Handle user registration
- `sanitizeName(name)` - Sanitize user names

#### Organization Functions
- `createOrganization(orgData)` - Create organization
- `addMemberToOrganization(orgId, userId)` - Add member to organization

#### Client Functions
- `createKeycloakClient(clientData)` - Create Keycloak client
- `createClientRole(clientId, roleName)` - Create client role
- `assignClientRoleToUser(userId, clientId, roleName)` - Assign role to user

## 🔧 Configuration Management

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=nexaauth
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_CLIENT_ID=nexaauth-app
```

### Docker Configuration

```yaml
# docker-compose.yml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.3.1
    container_name: nexaauth
    restart: unless-stopped
    command: start-dev
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_DB=dev-file
      - KC_LOG_LEVEL=INFO
    volumes:
      - keycloak_data:/opt/keycloak/data
```

## 📈 Performance Considerations

### Code Optimization
- **Async/Await**: All Keycloak API calls are asynchronous
- **Error Handling**: Comprehensive error handling and logging
- **Input Validation**: All inputs are validated and sanitized
- **Caching**: Keycloak admin tokens are cached

### Database Optimization
- **Keycloak Database**: Optimized for user management
- **Indexes**: Proper database indexes for performance
- **Connection Pooling**: Efficient database connections

### Monitoring
- **Health Checks**: `/health` endpoint for monitoring
- **Debug Logging**: Comprehensive logging for troubleshooting
- **Error Tracking**: Detailed error messages and stack traces

## 🔒 Security Features

### Authentication Security
- **OAuth 2.0/OpenID Connect**: Industry-standard authentication
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Cross-origin request security

### Input Security
- **Input Sanitization**: Automatic name sanitization
- **Validation**: All inputs are validated
- **SQL Injection Protection**: Parameterized queries

### Environment Security
- **Environment Variables**: Secure configuration management
- **Git Ignore**: Sensitive files excluded from version control
- **Docker Security**: Containerized services

## 🚀 Deployment Strategies

### Development Deployment
```bash
# Local development
npm run dev
docker-compose up -d
```

### Production Deployment
```bash
# Production setup
npm install --production
pm2 start index.js --name nexaauth
nginx -s reload
```

### Docker Deployment
```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support and Maintenance

### Documentation
- **README.md**: Main project documentation
- **API-DOCUMENTATION.md**: Complete API reference
- **SETUP-GUIDE.md**: Installation and configuration guide
- **PROJECT-STRUCTURE.md**: This file

### Testing
- **Manual Testing**: Browser-based testing
- **API Testing**: cURL and Postman collection
- **Integration Testing**: End-to-end testing

### Monitoring
- **Health Checks**: Service health monitoring
- **Log Monitoring**: Application and error logs
- **Performance Monitoring**: Resource usage tracking

---

<div align="center">

**NexaAuth Project Structure**  
*Complete overview of project organization and architecture*

</div>
