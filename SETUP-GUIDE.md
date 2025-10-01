# 🚀 NexaAuth Setup Guide

## 📋 Prerequisites

Before setting up NexaAuth, ensure you have the following installed:

### Required Software
- **Node.js** 14.0.0 or higher
- **Docker** 20.10.0 or higher
- **Docker Compose** 1.29.0 or higher
- **Git** 2.30.0 or higher

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## 🔧 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/NexaAuth.git

# Navigate to the project directory
cd NexaAuth
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

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

### Step 4: Start Keycloak

```bash
# Start Keycloak using Docker Compose
docker-compose up -d

# Verify Keycloak is running
docker-compose ps
```

**Expected Output:**
```
Name                Command               State           Ports
------------------------------------------------------------
nexaauth   quay.io/keycloak/keycloak:26.3.1   Up      0.0.0.0:8080->8080/tcp
```

### Step 5: Configure Keycloak

#### 5.1 Access Keycloak Admin Console

1. Open your browser and navigate to: http://localhost:8080/admin
2. Login with credentials:
   - **Username**: `admin`
   - **Password**: `admin`

#### 5.2 Create Realm

1. Click on **"Create Realm"** button
2. Enter realm name: `nexaauth`
3. Click **"Create"**

#### 5.3 Configure Client

1. Navigate to **Clients** → **Create**
2. Fill in the client details:
   - **Client ID**: `nexaauth-app`
   - **Client Protocol**: `openid-connect`
   - **Root URL**: `http://localhost:3000`
3. Click **"Save"**

#### 5.4 Configure Client Settings

1. Go to **Settings** tab
2. Configure the following:
   - **Root URL**: `http://localhost:3000`
   - **Home URL**: `http://localhost:3000`
   - **Valid Redirect URIs**: `http://localhost:3000/*`
   - **Valid Post Logout Redirect URIs**: `http://localhost:3000/*`
   - **Web Origins**: `http://localhost:3000`
3. Click **"Save"**

#### 5.5 Configure Google Identity Provider

1. Navigate to **Identity Providers** → **Add provider** → **Google**
2. Configure Google OAuth:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
3. Click **"Save"**

### Step 6: Start NexaAuth Backend

```bash
# Start the NexaAuth backend service
npm start
```

**Expected Output:**
```
🚀 NexaAuth Backend Service Started!
📡 Server running on: http://localhost:3000
🔧 Keycloak Server: http://localhost:8080
🔧 Keycloak Realm: nexaauth
🔧 Keycloak Client: nexaauth-app

🎯 AUTOMATIC GOOGLE LOGIN FLOW:
   1. Open: http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid
   2. Click "Google" button in Keycloak
   3. Complete Google authentication
   4. System automatically creates user, organization, and client!

✨ NO MANUAL API CALLS NEEDED - Everything happens automatically!
```

## 🧪 Testing the Setup

### Test 1: Health Check

```bash
# Test backend health
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-10T10:30:00.000Z"
}
```

### Test 2: Service Information

```bash
# Get service information
curl http://localhost:3000/
```

**Expected Response:**
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

### Test 3: Google Login Flow

1. Open browser and navigate to: http://localhost:3000/test
2. Click **"Test Google Login"** button
3. Complete Google authentication
4. Verify success page with organization and client details

### Test 4: API Registration

```bash
# Test user registration
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "keycloakId": "test-uuid-123",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User, organization, and client created successfully",
  "data": {
    "keycloakId": "test-uuid-123",
    "email": "test@example.com",
    "clientId": "client-example-testuser",
    "clientUuid": "client-uuid-here",
    "clientSecret": "client-secret-here",
    "organizationName": "org-example-testuser",
    "organizationId": "org-uuid-here",
    "domain": "org-example-testuser.org"
  }
}
```

## 🔧 Configuration Options

### Advanced Keycloak Configuration

#### Custom Realm Settings

1. **Access Keycloak Admin**: http://localhost:8080/admin
2. **Select Realm**: nexaauth
3. **Go to Realm Settings** → **General**
4. **Configure**:
   - **Display name**: NexaAuth
   - **HTML display name**: NexaAuth
   - **Frontend URL**: http://localhost:3000

#### User Federation

1. **Go to User Federation**
2. **Add provider** → **LDAP** (if using LDAP)
3. **Configure LDAP settings**

#### Client Scopes

1. **Go to Client Scopes**
2. **Create** custom scopes for your application
3. **Assign** scopes to clients

### Environment Variables

#### Development Environment

```env
# Development settings
NODE_ENV=development
PORT=3000
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=nexaauth
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_CLIENT_ID=nexaauth-app
DEBUG=nexaauth:*
```

#### Production Environment

```env
# Production settings
NODE_ENV=production
PORT=3000
KEYCLOAK_SERVER_URL=https://your-keycloak-domain.com
KEYCLOAK_REALM=production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=secure-password
KEYCLOAK_CLIENT_ID=nexaauth-app
```

## 🐳 Docker Configuration

### Docker Compose Services

```yaml
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

volumes:
  keycloak_data:
    driver: local
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Remove all data
docker-compose down -v
```

## 🚀 Production Deployment

### Prerequisites for Production

- **Domain name** with SSL certificate
- **Production Keycloak** instance
- **Database** (PostgreSQL/MySQL)
- **Load balancer** (optional)
- **Monitoring** tools

### Production Setup

#### 1. Configure Production Keycloak

```env
# Production Keycloak settings
KEYCLOAK_SERVER_URL=https://auth.yourdomain.com
KEYCLOAK_REALM=production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=secure-password
KEYCLOAK_CLIENT_ID=nexaauth-app
```

#### 2. SSL Configuration

```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

#### 3. Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Process Management

```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start index.js --name nexaauth

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Keycloak Not Starting

**Problem**: Keycloak container fails to start

**Solution**:
```bash
# Check Docker logs
docker-compose logs keycloak

# Restart Keycloak
docker-compose restart keycloak

# Check port availability
netstat -tulpn | grep 8080
```

#### 2. Connection Refused Error

**Problem**: Cannot connect to Keycloak

**Solution**:
```bash
# Check if Keycloak is running
docker-compose ps

# Verify port mapping
docker port nexaauth

# Test connectivity
curl http://localhost:8080/realms/nexaauth
```

#### 3. Invalid Redirect URI Error

**Problem**: OAuth redirect fails

**Solution**:
1. Check Keycloak client configuration
2. Ensure redirect URI is: `http://localhost:3000/*`
3. Verify client settings in Keycloak admin

#### 4. Token Exchange Failed

**Problem**: Cannot exchange authorization code for token

**Solution**:
```bash
# Check Keycloak logs
docker-compose logs keycloak

# Verify client configuration
# Check if client is properly configured
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=nexaauth:* npm start

# Check specific logs
tail -f logs/nexaauth.log
```

### Performance Issues

#### High Memory Usage

```bash
# Monitor memory usage
docker stats

# Increase memory limits
docker-compose up -d --scale keycloak=1
```

#### Slow Response Times

```bash
# Check database performance
# Optimize Keycloak database
# Implement caching
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Keycloak health
curl http://localhost:8080/realms/nexaauth
```

### Log Monitoring

```bash
# View application logs
tail -f logs/nexaauth.log

# View Keycloak logs
docker-compose logs -f keycloak
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor Docker containers
docker stats
```

## 🔒 Security Considerations

### Production Security

1. **Change default passwords**
2. **Use HTTPS in production**
3. **Configure firewall rules**
4. **Regular security updates**
5. **Monitor access logs**

### Keycloak Security

1. **Enable SSL/TLS**
2. **Configure proper CORS**
3. **Use strong passwords**
4. **Enable audit logging**
5. **Regular backups**

## 📞 Support

### Getting Help

- **Documentation**: This guide and API documentation
- **Issues**: GitHub Issues
- **Email**: support@nexaauth.com
- **Discord**: [Join our Discord](https://discord.gg/nexaauth)

### Community Resources

- **GitHub**: [NexaAuth Repository](https://github.com/yourusername/NexaAuth)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/NexaAuth/discussions)
- **Wiki**: [Project Wiki](https://github.com/yourusername/NexaAuth/wiki)

---

<div align="center">

**NexaAuth Setup Guide**  
*Complete installation and configuration guide*

</div>
