# NexaAuth Registration Service

This service automatically creates **Organization**, **Client**, and **User** when someone registers through Keycloak or Google OAuth.

## 🚀 Features

- ✅ **Automatic Organization Creation** - Creates Keycloak group for each user
- ✅ **Automatic Client Creation** - Creates dedicated client for each user
- ✅ **Automatic User Setup** - Assigns roles and permissions
- ✅ **Google OAuth Support** - Works with Google Identity Provider
- ✅ **Keycloak Registration Support** - Works with direct Keycloak registration
- ✅ **Naming Convention** - `client-{domain}-{username}` and `org-{domain}-{username}`

## 📋 Prerequisites

1. **Keycloak running** on `http://localhost:8080`
2. **Node.js** (version 14 or higher)
3. **NexaAuth realm** configured in Keycloak
4. **Google Identity Provider** configured (optional)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=nexaauth
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_CLIENT_ID=nexaauth-app

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3001`

## 🧪 Testing

### 1. Test Registration Endpoint

**POST** `http://localhost:3001/register`

```json
{
  "keycloakId": "user-uuid-from-keycloak",
  "email": "john.doe@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "user-uuid-from-keycloak",
    "email": "john.doe@gmail.com",
    "clientId": "client-gmail-johndoe",
    "clientUuid": "client-uuid-from-keycloak",
    "clientSecret": "client-gmail-johndoe-secret-1234567890",
    "organizationName": "org-gmail-johndoe",
    "organizationId": "group-uuid-from-keycloak",
    "domain": "org-gmail-johndoe.org"
  }
}
```

### 2. Test with Sample Data

**POST** `http://localhost:3001/test-register`

This creates a test user with sample data.

### 3. Get User Information

**GET** `http://localhost:3001/user/{keycloakId}`

**GET** `http://localhost:3001/user/{keycloakId}/groups`

**GET** `http://localhost:3001/user/{keycloakId}/clients`

## 🔧 Integration with Your App

### Frontend Integration

```javascript
// When user logs in through Keycloak or Google
const handleUserLogin = async (keycloakUser) => {
  try {
    const response = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keycloakId: keycloakUser.id,
        email: keycloakUser.email,
        firstName: keycloakUser.firstName,
        lastName: keycloakUser.lastName,
        username: keycloakUser.username
      })
    });
    
    const result = await response.json();
    console.log('Registration result:', result);
    
    // Store client info for API calls
    localStorage.setItem('clientId', result.data.clientId);
    localStorage.setItem('clientSecret', result.data.clientSecret);
    
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Backend Integration

```javascript
// In your existing users.js or similar
const registerUserWithOrg = async (userData) => {
  try {
    const response = await axios.post('http://localhost:3001/register', {
      keycloakId: userData.keycloak_id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create organization and client:', error);
    throw error;
  }
};
```

## 📊 What Gets Created

### 1. **Keycloak Client**
- **Client ID**: `client-{domain}-{username}` (e.g., `client-gmail-johndoe`)
- **Client Secret**: Auto-generated
- **Redirect URIs**: `*` (configurable)
- **Protocol**: `openid-connect`
- **Roles**: `orgAdmin`, `organizer`, `user`

### 2. **Keycloak Group (Organization)**
- **Group Name**: `org-{domain}-{username}` (e.g., `org-gmail-johndoe`)
- **Type**: `organization`
- **Description**: `Organization: org-gmail-johndoe`

### 3. **User Role Assignment**
- User gets `orgAdmin` role in their client
- User is added to their organization group

## 🔍 Monitoring

### Health Check
**GET** `http://localhost:3001/health`

### Logs
The service logs all operations:
- ✅ Successful operations
- ⚠️ Warnings for non-critical failures
- ❌ Errors for critical failures

## 🚨 Error Handling

The service handles various error scenarios:
- **User doesn't exist in Keycloak** - Logs warning, continues
- **Client creation fails** - Logs warning, continues
- **Group creation fails** - Logs warning, continues
- **Role assignment fails** - Logs warning, continues

## 🔧 Configuration

### Naming Convention
- **Client ID**: `client-{domain}-{username}`
- **Organization**: `org-{domain}-{username}`
- **Domain**: `{org-name}.org`

### Customization
Edit the helper functions in `index.js`:
- `extractNameFromEmail()` - How to extract name from email
- `sanitizeOrgName()` - How to sanitize organization names
- `generateDomain()` - How to generate domains

## 📝 API Reference

### POST /register
Register a new user with automatic org/client creation.

**Request Body:**
```json
{
  "keycloakId": "string (required)",
  "email": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "username": "string (optional)"
}
```

### POST /test-register
Test registration with sample data.

### GET /user/:keycloakId
Get user information from Keycloak.

### GET /user/:keycloakId/groups
Get user's organization groups.

### GET /user/:keycloakId/clients
Get user's client role mappings.

### GET /health
Health check endpoint.

## 🎯 Next Steps

1. **Start the service**: `npm start`
2. **Test with Postman**: Use the provided endpoints
3. **Integrate with your app**: Call `/register` when users log in
4. **Monitor logs**: Check console for success/error messages
5. **Customize naming**: Modify helper functions as needed

## 🆘 Troubleshooting

### Common Issues

1. **"Failed to obtain Keycloak admin token"**
   - Check Keycloak is running on `http://localhost:8080`
   - Verify admin credentials in `.env`

2. **"User does not exist in Keycloak"**
   - User must be created in Keycloak first
   - Check if user ID is correct

3. **"Client creation failed"**
   - Check Keycloak realm exists
   - Verify admin permissions

4. **"Group creation failed"**
   - Check Keycloak realm configuration
   - Verify admin permissions

### Debug Mode

Set `NODE_ENV=development` for detailed logging.

## 📞 Support

For issues or questions:
1. Check the logs for error messages
2. Verify Keycloak configuration
3. Test with `/test-register` endpoint
4. Check Keycloak admin console for created resources
