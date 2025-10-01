module.exports = {
  // Keycloak Configuration
  KEYCLOAK_SERVER_URL: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'nexaauth',
  KEYCLOAK_ADMIN_USER: process.env.KEYCLOAK_ADMIN_USER || 'admin',
  KEYCLOAK_ADMIN_PASSWORD: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'nexaauth-app',
  
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
