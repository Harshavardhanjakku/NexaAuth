# 📚 NexaAuth API Documentation

## 🔗 Base URL
```
http://localhost:3000
```

## 🔐 Authentication & Google Identity Provider

### OAuth 2.0/OpenID Connect Flow

The NexaAuth system uses a sophisticated OAuth 2.0/OpenID Connect flow with Google Identity Provider integration:

1. **Authorization Code Flow**: Standard OAuth 2.0 authorization code flow
2. **JWT Token Exchange**: Authorization codes are exchanged for JWT access tokens
3. **User Information Extraction**: User details are extracted from JWT payload
4. **Automatic Resource Creation**: Organizations and clients are created automatically

### Google IDP Integration

The system seamlessly integrates with Google Identity Provider through Keycloak:

- **User Creation**: Google users are automatically created in Keycloak realm
- **Attribute Mapping**: Google user attributes are mapped to Keycloak user attributes
- **Organization Creation**: Organizations are created based on user email domain
- **Client Creation**: Clients are created for each organization
- **Role Assignment**: Users are automatically assigned appropriate roles

## 📋 Endpoints

### 1. Service Information
**GET** `/`

Returns information about the NexaAuth service and available endpoints.

**Request:**
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
  },
  "description": "Backend service for user, organization, and client creation via Keycloak"
}
```

### 2. Health Check
**GET** `/health`

Checks the health status of the service.

**Request:**
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

### 3. Test Page
**GET** `/test`

Returns a test page for Google login flow with debug information.

**Request:**
```http
GET http://localhost:3000/test
```

**Response:**
Returns HTML page for testing Google OAuth flow.

---

## 👤 User Management Endpoints

### 4. Register New User
**POST** `/register`

Creates a new user, organization, and client in Keycloak.

**Request Body:**
```json
{
  "keycloakId": "string (required)",
  "email": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Example Request:**
```http
POST http://localhost:3000/register
Content-Type: application/json

{
  "keycloakId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "clientId": "client-example-johndoe",
    "clientUuid": "client-uuid-here",
    "clientSecret": "client-secret-here",
    "organizationName": "org-example-johndoe",
    "organizationId": "org-uuid-here",
    "domain": "org-example-johndoe.org"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: keycloakId and email are required"
}
```

### 5. Register Google User
**POST** `/register-google`

Creates a new user from Google authentication data.

**Request Body:**
```json
{
  "email": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Example Request:**
```http
POST http://localhost:3000/register-google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "firstName": "Google",
  "lastName": "User"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "generated-uuid",
    "email": "user@gmail.com",
    "clientId": "client-gmail-user",
    "clientUuid": "client-uuid-here",
    "clientSecret": "client-secret-here",
    "organizationName": "org-gmail-user",
    "organizationId": "org-uuid-here",
    "domain": "org-gmail-user.org"
  }
}
```

### 6. Register Google IDP User
**POST** `/register-google-idp`

Creates a user from Google Identity Provider data with existing Keycloak ID.

**Request Body:**
```json
{
  "keycloakId": "string (required)",
  "email": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Example Request:**
```http
POST http://localhost:3000/register-google-idp
Content-Type: application/json

{
  "keycloakId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "clientId": "client-gmail-user",
    "clientUuid": "client-uuid-here",
    "clientSecret": "client-secret-here",
    "organizationName": "org-gmail-user",
    "organizationId": "org-uuid-here",
    "domain": "org-gmail-user.org"
  }
}
```

### 7. Register Existing Google User
**POST** `/register-existing-google-user`

Creates organization and client for an existing Google user in Keycloak.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Example Request:**
```http
POST http://localhost:3000/register-existing-google-user
Content-Type: application/json

{
  "email": "existing.user@gmail.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "existing-user-uuid",
    "email": "existing.user@gmail.com",
    "clientId": "client-gmail-existinguser",
    "clientUuid": "client-uuid-here",
    "clientSecret": "client-secret-here",
    "organizationName": "org-gmail-existinguser",
    "organizationId": "org-uuid-here",
    "domain": "org-gmail-existinguser.org"
  }
}
```

**Error Response (404):**
```json
{
  "error": "User not found",
  "message": "No user found with email: nonexistent@gmail.com"
}
```

---

## 🔄 Google Identity Provider Workflow

### Complete OAuth Flow with Google IDP

#### **Step 1: User Initiates Login**
```http
GET http://localhost:3000/test
```
- Returns HTML page with Google login button
- User clicks "Test Google Login"
- Redirects to Keycloak Google IDP

#### **Step 2: Google Authentication**
```http
GET http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid
```
- Keycloak redirects to Google OAuth
- User authenticates with Google
- Google validates credentials

#### **Step 3: Authorization Code Exchange**
```http
GET http://localhost:3000/?code=AUTHORIZATION_CODE&state=STATE_VALUE
```
- Keycloak redirects back with authorization code
- Backend exchanges code for JWT token
- User information extracted from JWT

#### **Step 4: Automatic Resource Creation**
```http
POST http://localhost:3000/register-google-idp
Content-Type: application/json

{
  "keycloakId": "extracted-from-jwt",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Google IDP Attribute Mapping

| Google OAuth Attribute | Keycloak User Attribute | Description |
|------------------------|-------------------------|-------------|
| `sub` | `keycloakId` | Unique Google user identifier |
| `email` | `email` | User's email address |
| `given_name` | `firstName` | User's first name |
| `family_name` | `lastName` | User's last name |
| `name` | `fullName` | User's full name |
| `picture` | `picture` | User's profile picture URL |
| `email_verified` | `emailVerified` | Email verification status |
| `locale` | `locale` | User's locale preference |

### Automatic Resource Naming Convention

#### **Organization Creation**
```javascript
// Input: john.doe@gmail.com
// Domain extraction: "gmail"
// Name sanitization: "johndoe"
// Organization name: "org-gmail-johndoe"
// Domain: "org-gmail-johndoe.org"
```

#### **Client Creation**
```javascript
// Input: john.doe@gmail.com
// Domain extraction: "gmail"
// Name sanitization: "johndoe"
// Client ID: "client-gmail-johndoe"
// Client name: "Client for John Doe"
```

#### **Role Assignment**
```javascript
// Automatic role creation and assignment
// Role name: "admin"
// Role description: "Administrator role for organization"
// Assigned to: User
```

### Debug Logging for Google IDP Flow

The system provides comprehensive debug logging:

```javascript
// Example debug output
[DEBUG] OAuth callback received with code: abc123...
[DEBUG] Exchanging authorization code for token...
[DEBUG] Token exchange successful
[DEBUG] Extracting user information from JWT...
[DEBUG] User ID: 550e8400-e29b-41d4-a716-446655440000
[DEBUG] Email: john.doe@gmail.com
[DEBUG] First name: John
[DEBUG] Last name: Doe
[DEBUG] Creating organization: org-gmail-johndoe
[DEBUG] Creating client: client-gmail-johndoe
[DEBUG] Assigning admin role to user
[DEBUG] All resources created successfully
```

---

## 🔧 OAuth Callback Endpoint

### 8. OAuth Callback Handler
**GET** `/` (with query parameters)

Handles OAuth callbacks from Keycloak after Google authentication.

**Request:**
```http
GET http://localhost:3000/?code=authorization_code&state=state_value
```

**Query Parameters:**
- `code` (string): Authorization code from Keycloak
- `state` (string): State parameter for security
- `error` (string, optional): Error code if authentication failed
- `error_description` (string, optional): Error description

**Success Flow:**
1. User completes Google authentication
2. Keycloak redirects to this endpoint with authorization code
3. System exchanges code for access token
4. System extracts user information from token
5. System creates user, organization, and client
6. System displays success page

**Error Flow:**
1. If `error` parameter is present, displays error page
2. If no `code` parameter, displays error message
3. If token exchange fails, displays error with retry option

---

## 📊 Response Formats

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "keycloakId": "string",
    "email": "string",
    "clientId": "string",
    "clientUuid": "string",
    "clientSecret": "string",
    "organizationName": "string",
    "organizationId": "string",
    "domain": "string"
  }
}
```

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400,
  "timestamp": "2024-01-10T10:30:00.000Z"
}
```

### Common Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `Validation Error` | 400 | Missing or invalid required fields |
| `User Not Found` | 404 | User does not exist in Keycloak |
| `Keycloak Error` | 500 | Error communicating with Keycloak |
| `Authentication Error` | 401 | Invalid or expired authentication |
| `Conflict Error` | 409 | Resource already exists |

---

## 🧪 Testing Examples

### cURL Examples

#### Health Check
```bash
curl -X GET http://localhost:3000/health
```

#### Register New User
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "keycloakId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Register Google User
```bash
curl -X POST http://localhost:3000/register-google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "firstName": "Google",
    "lastName": "User"
  }'
```

#### Register Existing Google User
```bash
curl -X POST http://localhost:3000/register-existing-google-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@gmail.com"
  }'
```

### PowerShell Examples

#### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

#### Register New User
```powershell
$body = @{
    keycloakId = "550e8400-e29b-41d4-a716-446655440000"
    email = "test@example.com"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body $body
```

#### Register Google User
```powershell
$body = @{
    email = "test@gmail.com"
    firstName = "Google"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/register-google" -Method POST -ContentType "application/json" -Body $body
```

### JavaScript Examples

#### Using Fetch API
```javascript
// Health check
fetch('http://localhost:3000/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Register new user
fetch('http://localhost:3000/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    keycloakId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Using Axios
```javascript
const axios = require('axios');

// Health check
axios.get('http://localhost:3000/health')
  .then(response => console.log(response.data));

// Register new user
axios.post('http://localhost:3000/register', {
  keycloakId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
})
.then(response => console.log(response.data));
```

---

## 🔒 Security Considerations

### Authentication
- All endpoints require proper Keycloak authentication
- OAuth 2.0/OpenID Connect for secure token exchange
- JWT tokens for stateless authentication

### Input Validation
- All input parameters are validated
- Email format validation
- Name sanitization (removes special characters)
- Required field validation

### Error Handling
- Detailed error messages for debugging
- Proper HTTP status codes
- No sensitive information in error responses

### Rate Limiting
- Consider implementing rate limiting for production
- Monitor API usage and implement throttling

---

## 📈 Performance Considerations

### Caching
- Keycloak admin tokens are cached
- Consider implementing Redis for production caching

### Database Optimization
- Keycloak database indexes for better performance
- Connection pooling for database connections

### Monitoring
- Health check endpoint for monitoring
- Comprehensive logging for debugging
- Performance metrics collection

---

## 🚀 Production Deployment

### Environment Variables
```env
PORT=3000
KEYCLOAK_SERVER_URL=https://your-keycloak-domain.com
KEYCLOAK_REALM=production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=secure-password
KEYCLOAK_CLIENT_ID=nexaauth-app
```

### SSL/TLS
- Use HTTPS in production
- Configure SSL certificates
- Enable HSTS headers

### Load Balancing
- Deploy multiple instances
- Use load balancer for high availability
- Configure health checks

---

## 📞 Support

For API support and questions:
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Email**: support@nexaauth.com

---

<div align="center">

**NexaAuth API Documentation**  
*Version 1.0.0*

</div>
