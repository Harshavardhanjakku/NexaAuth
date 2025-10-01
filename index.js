const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve OAuth callback handler
app.use(express.static('public'));

// Keycloak Configuration
const KEYCLOAK_CONFIG = {
  serverUrl: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'nexaauth',
  adminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
  adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'nexaauth-app'
};

// Helper Functions
const getKeycloakAdminToken = async () => {
  try {
    const response = await axios.post(
      `${KEYCLOAK_CONFIG.serverUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        username: KEYCLOAK_CONFIG.adminUser,
        password: KEYCLOAK_CONFIG.adminPassword,
        client_id: 'admin-cli',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    console.log('✅ Keycloak admin token obtained successfully');
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Failed to obtain Keycloak admin token:', err.response?.data || err.message);
    throw new Error(`Failed to obtain Keycloak admin token: ${err.message}`);
  }
};

// Helper function to sanitize names (remove spaces and special characters)
const sanitizeName = (name) => {
  console.log(`🔍 [DEBUG] sanitizeName input: "${name}"`);
  if (!name) {
    console.log(`🔍 [DEBUG] sanitizeName: name is empty, returning empty string`);
    return '';
  }
  const sanitized = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
    .trim();
  console.log(`🔍 [DEBUG] sanitizeName output: "${sanitized}"`);
  return sanitized;
};

// Extract name from email as fallback
const extractNameFromEmail = (email) => {
  console.log(`🔍 [DEBUG] extractNameFromEmail input: "${email}"`);
  const localPart = email.split('@')[0];
  console.log(`🔍 [DEBUG] extractNameFromEmail localPart: "${localPart}"`);
  const result = sanitizeName(localPart);
  console.log(`🔍 [DEBUG] extractNameFromEmail result: "${result}"`);
  return result;
};

const sanitizeOrgName = (name) => {
  console.log(`🔍 [DEBUG] sanitizeOrgName input: "${name}"`);
  const result = name.replace(/\s+/g, '-').toLowerCase();
  console.log(`🔍 [DEBUG] sanitizeOrgName output: "${result}"`);
  return result;
};

const generateDomain = (orgName) => {
  console.log(`🔍 [DEBUG] generateDomain input: "${orgName}"`);
  const result = `${orgName}.org`;
  console.log(`🔍 [DEBUG] generateDomain output: "${result}"`);
  return result;
};

// Create Keycloak Client
const createKeycloakClient = async (accessToken, clientId, userEmail) => {
  console.log(`🔍 [DEBUG] createKeycloakClient called with:`, { clientId, userEmail });
  try {
    const clientSecret = `${clientId}-secret-${Date.now()}`;
    console.log(`🔍 [DEBUG] Generated clientSecret: "${clientSecret}"`);
    
    const clientPayload = {
      clientId: clientId,
      enabled: true,
      protocol: 'openid-connect',
      secret: clientSecret,
      serviceAccountsEnabled: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      publicClient: false,
      redirectUris: ['*'],
      webOrigins: ['*'],
      attributes: {
        'user.info.response.signature.alg': 'RS256',
        'saml.assertion.signature': 'false',
        'saml.force.post.binding': 'false',
        'saml.multivalued.roles': 'false',
        'saml.encrypt': 'false',
        'saml.server.signature': 'false',
        'saml.server.signature.keyinfo.ext': 'false',
        'exclude.session.state.from.auth.response': 'false',
        'saml_force_name_id_format': 'false',
        'saml.client.signature': 'false',
        'tls.client.certificate.bound.access.tokens': 'false',
        'saml.authnstatement': 'false',
        'display.on.consent.screen': 'false',
        'saml.onetimeuse.condition': 'false'
      }
    };

    console.log(`🔍 [DEBUG] Client payload:`, JSON.stringify(clientPayload, null, 2));
    console.log(`🔍 [DEBUG] Making request to: ${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients`);

    const response = await axios.post(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients`,
      clientPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`🔍 [DEBUG] Client creation response status: ${response.status}`);
    console.log(`🔍 [DEBUG] Client creation response headers:`, response.headers);

    if (response.status === 201) {
      let clientUuid = null;
      if (response.headers.location) {
        const locationParts = response.headers.location.split('/');
        clientUuid = locationParts[locationParts.length - 1];
        console.log(`🔍 [DEBUG] Extracted clientUuid from location header: "${clientUuid}"`);
      }

      console.log('✅ Keycloak client created successfully:', {
        clientId: clientId,
        clientUuid: clientUuid,
        userEmail: userEmail
      });

      return {
        clientId: clientId,
        clientUuid: clientUuid,
        clientSecret: clientSecret,
      };
    } else {
      console.error(`🔍 [DEBUG] Unexpected status code: ${response.status}`);
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (err) {
    if (err?.response?.status === 409) {
      console.log(`ℹ️ Client '${clientId}' already exists, fetching existing client...`);
      // Try to get the existing client
      try {
        const existingClients = await axios.get(
          `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients?clientId=${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (existingClients.data && existingClients.data.length > 0) {
          const existingClient = existingClients.data[0];
          console.log(`✅ Found existing client:`, existingClient);
          return {
            clientId: existingClient.clientId,
            clientUuid: existingClient.id,
            clientSecret: `${clientId}-secret-existing`,
          };
        }
      } catch (fetchErr) {
        console.warn('⚠️ Failed to fetch existing client:', fetchErr.message);
      }
    }
    
    console.error('❌ Failed to create Keycloak client:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      clientId: clientId,
    });
    throw err;
  }
};

// Create Client Roles
const createClientRole = async (accessToken, clientUuid, roleName) => {
  console.log(`🔍 [DEBUG] createClientRole called with:`, { clientUuid, roleName });
  try {
    const rolePayload = {
      name: roleName,
      description: `${roleName} role for organization`,
    };
    console.log(`🔍 [DEBUG] Role payload:`, JSON.stringify(rolePayload, null, 2));
    console.log(`🔍 [DEBUG] Making request to: ${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients/${clientUuid}/roles`);
    
    const response = await axios.post(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients/${clientUuid}/roles`,
      rolePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log(`🔍 [DEBUG] Role creation response status: ${response.status}`);
    
    if (response.status === 201 || response.status === 204) {
      console.log(`✅ Client role '${roleName}' created for client ${clientUuid}`);
    } else {
      console.warn(`🔍 [DEBUG] Unexpected status for role creation: ${response.status}`);
    }
  } catch (err) {
    if (err?.response?.status === 409) {
      console.log(`ℹ️ Role '${roleName}' already exists for client ${clientUuid}`);
    } else {
      console.error(`❌ Failed to create client role '${roleName}':`, err?.response?.data || err.message);
    }
  }
};

// Get Client Role
const getClientRoleByName = async (accessToken, clientUuid, roleName) => {
  try {
    const response = await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients/${clientUuid}/roles/${encodeURIComponent(roleName)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(`❌ Failed to fetch role '${roleName}' for client ${clientUuid}:`, err?.response?.data || err.message);
    throw err;
  }
};

// Assign Client Role to User
const assignClientRoleToUser = async (accessToken, keycloakUserId, clientUuid, roleRepresentation) => {
  try {
    const payload = [
      {
        id: roleRepresentation.id,
        name: roleRepresentation.name,
        containerId: clientUuid,
        clientRole: true,
      },
    ];
    
    const response = await axios.post(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${keycloakUserId}/role-mappings/clients/${clientUuid}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.status === 204) {
      console.log(`✅ Assigned role '${roleRepresentation.name}' to user ${keycloakUserId} for client ${clientUuid}`);
    }
  } catch (err) {
    console.error(`❌ Failed to assign role '${roleRepresentation?.name}' to user ${keycloakUserId}:`, err?.response?.data || err.message);
    throw err;
  }
};

// Create Keycloak Organization
const createOrganization = async (accessToken, orgName, domain) => {
  console.log(`🔍 [DEBUG] createOrganization called with:`, { orgName, domain });
  try {
    const url = `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/organizations`;
    const payload = { 
      name: orgName,
      domains: [domain],
      attributes: {
        description: [`Organization: ${orgName}`],
        type: ['organization']
      }
    };
    
    console.log('🔍 [DEBUG] Creating Keycloak Organization:', { url, payload });
    console.log(`🔍 [DEBUG] Making request to: ${url}`);
    
    const response = await axios.post(url, payload, { 
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        'Content-Type': 'application/json' 
      } 
    });
    
    console.log('🔍 [DEBUG] Organization create response:', { 
      status: response.status, 
      headers: response.headers, 
      data: response.data 
    });
    
    if (response.status === 201) {
      if (response.data?.id) {
        console.log(`🔍 [DEBUG] Organization ID from response data: ${response.data.id}`);
        return response.data.id;
      }
      if (response.headers?.location) {
        const parts = response.headers.location.split('/');
        const orgId = parts[parts.length - 1];
        console.log(`🔍 [DEBUG] Organization ID from location header: ${orgId}`);
        return orgId;
      }
    }
    console.error(`🔍 [DEBUG] Unexpected status from org create: ${response.status}`);
    throw new Error(`Unexpected status from org create: ${response.status}`);
  } catch (err) {
    if (err?.response?.status === 409) {
      console.log(`ℹ️ Organization '${orgName}' already exists, fetching existing organization...`);
      // Try to get the existing organization
      try {
        const existingOrgs = await axios.get(
          `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/organizations?search=${orgName}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (existingOrgs.data && existingOrgs.data.length > 0) {
          const existingOrg = existingOrgs.data.find(org => org.name === orgName);
          if (existingOrg) {
            console.log(`✅ Found existing organization:`, existingOrg);
            return existingOrg.id;
          }
        }
      } catch (fetchErr) {
        console.warn('⚠️ Failed to fetch existing organization:', fetchErr.message);
      }
    }
    
    console.error('❌ Failed to create Keycloak organization:', err?.response?.data || err.message);
    console.error('🔍 [DEBUG] Organization creation error details:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
    throw err;
  }
};

// Add User to Organization
const addMemberToOrganization = async (accessToken, orgId, keycloakUserId) => {
  try {
    const url = `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/organizations/${orgId}/members`;
    const body = String(keycloakUserId);
    
    console.log('Adding member to Organization', { url, body });
    const response = await axios.post(url, body, { 
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        'Content-Type': 'application/json' 
      } 
    });
    
    console.log('Add member response', { 
      status: response.status, 
      data: response.data, 
      headers: response.headers 
    });
    
    if (response.status === 201 || response.status === 204) {
      console.log('✅ Added user to Keycloak organization', { keycloakUserId, orgId });
    } else {
      throw new Error(`Unexpected status from add member: ${response.status}`);
    }
  } catch (err) {
    console.warn('Failed to add user to Keycloak organization:', err?.response?.data || err.message);
    throw err;
  }
};

// Check if user exists in Keycloak
const checkUserExists = async (accessToken, keycloakId) => {
  try {
    await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${keycloakId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false;
    }
    console.warn('Error checking user existence in Keycloak:', err.message);
    return false;
  }
};

// Create a test user in Keycloak
const createTestUser = async (accessToken, userData) => {
  try {
    const { keycloakId, email, firstName, lastName } = userData;
    
    // Generate a proper username from email (avoid "google." prefix)
    const emailPrefix = email.split('@')[0];
    const cleanUsername = emailPrefix.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    
    const userPayload = {
      id: keycloakId,
      username: cleanUsername, // Use clean email prefix as username
      email: email,
      firstName: firstName || 'Test',
      lastName: lastName || 'User',
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: 'testpassword123',
        temporary: false
      }]
    };

    console.log(`🔍 [DEBUG] Creating user with payload:`, userPayload);

    const response = await axios.post(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users`,
      userPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      console.log('✅ Test user created in Keycloak:', { keycloakId, email, username: cleanUsername });
      return true;
    }
    return false;
  } catch (err) {
    if (err?.response?.status === 409) {
      console.log('ℹ️ Test user already exists in Keycloak');
      return true;
    }
    console.error('❌ Failed to create test user:', err?.response?.data || err.message);
    return false;
  }
};

// Function to find existing Google IDP user and get their details
const findGoogleIdpUser = async (accessToken, email) => {
  try {
    console.log(`🔍 [DEBUG] Searching for Google IDP user with email: ${email}`);
    
    const response = await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const user = response.data[0];
      console.log(`✅ Found Google IDP user:`, {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
      return user;
    }
    
    console.log(`ℹ️ No Google IDP user found with email: ${email}`);
    return null;
  } catch (err) {
    console.error('❌ Failed to search for Google IDP user:', err?.response?.data || err.message);
    return null;
  }
};

// Main Registration Handler
const handleUserRegistration = async (userData) => {
  const { keycloakId, email, firstName, lastName } = userData;
  
  console.log('🚀 [MAIN] Starting user registration process:', { keycloakId, email, firstName, lastName });
  console.log('🔍 [DEBUG] Raw input data:', {
    keycloakId: `"${keycloakId}"`,
    email: `"${email}"`,
    firstName: `"${firstName}"`,
    lastName: `"${lastName}"`
  });
  
  try {
    console.log('🔍 [DEBUG] Getting Keycloak admin token...');
    const accessToken = await getKeycloakAdminToken();
    console.log('🔍 [DEBUG] Admin token obtained successfully');
    
    // Use Google mappers: sanitize first and last names (remove spaces and special characters)
    console.log('🔍 [DEBUG] Sanitizing names using Google mappers...');
    const sanitizedFirstName = sanitizeName(firstName);
    const sanitizedLastName = sanitizeName(lastName);
    console.log('🔍 [DEBUG] Name sanitization complete:', {
      originalFirstName: `"${firstName}"`,
      sanitizedFirstName: `"${sanitizedFirstName}"`,
      originalLastName: `"${lastName}"`,
      sanitizedLastName: `"${sanitizedLastName}"`
    });
    
    // Generate organization and client names using sanitized firstname+lastname
    console.log('🔍 [DEBUG] Processing email for domain extraction...');
    const emailStr = String(email || '').toLowerCase();
    console.log('🔍 [DEBUG] Email string:', `"${emailStr}"`);
    const [localRaw, domainRaw] = emailStr.split('@');
    console.log('🔍 [DEBUG] Email parts:', { localRaw: `"${localRaw}"`, domainRaw: `"${domainRaw}"` });
    const domainPart = (domainRaw || 'example.com').split('.')[0].replace(/[^a-z0-9]+/g, '');
    console.log('🔍 [DEBUG] Domain part:', `"${domainPart}"`);
    
    // Create name from sanitized firstname+lastname
    const namePart = `${sanitizedFirstName}${sanitizedLastName}` || sanitizeName(localRaw);
    console.log('🔍 [DEBUG] Combined name part:', `"${namePart}"`);
    
    const clientId = `client-${domainPart}-${namePart}`;
    const orgName = sanitizeOrgName(`org-${domainPart}-${namePart}`);
    const domain = generateDomain(orgName);
    
    console.log('📝 [MAIN] Generated identifiers using Google mappers:', { 
      clientId, 
      orgName, 
      domain,
      sanitizedFirstName,
      sanitizedLastName,
      namePart,
      domainPart
    });
    
    // Create Keycloak Client
    console.log('🔍 [DEBUG] Starting client creation process...');
    let clientInfo = null;
    try {
      console.log('🔍 [DEBUG] Calling createKeycloakClient...');
      clientInfo = await createKeycloakClient(accessToken, clientId, email);
      console.log('🔍 [DEBUG] Client creation successful:', clientInfo);
      
      // Create default roles for the client
      if (clientInfo && clientInfo.clientUuid) {
        console.log('🔍 [DEBUG] Creating default roles for client...');
        const roles = ['orgAdmin', 'organizer', 'user'];
        for (const roleName of roles) {
          console.log(`🔍 [DEBUG] Creating role: ${roleName}`);
          await createClientRole(accessToken, clientInfo.clientUuid, roleName);
        }
        console.log('🔍 [DEBUG] All default roles created successfully');
        
        // Assign orgAdmin role to the user
        console.log('🔍 [DEBUG] Checking if user exists for role assignment...');
        const userExists = await checkUserExists(accessToken, keycloakId);
        console.log('🔍 [DEBUG] User exists check result:', userExists);
        
        if (userExists) {
          try {
            console.log('🔍 [DEBUG] Getting orgAdmin role for assignment...');
            const orgAdminRole = await getClientRoleByName(accessToken, clientInfo.clientUuid, 'orgAdmin');
            console.log('🔍 [DEBUG] OrgAdmin role retrieved:', orgAdminRole);
            console.log('🔍 [DEBUG] Assigning orgAdmin role to user...');
            await assignClientRoleToUser(accessToken, keycloakId, clientInfo.clientUuid, orgAdminRole);
            console.log('✅ Assigned orgAdmin role to user');
          } catch (roleErr) {
            console.warn('⚠️ Failed to assign orgAdmin role:', roleErr.message);
            console.error('🔍 [DEBUG] Role assignment error details:', roleErr);
          }
        } else {
          console.warn('⚠️ User does not exist, skipping role assignment');
        }
      } else {
        console.error('🔍 [DEBUG] Client creation failed - no clientUuid returned');
      }
    } catch (clientErr) {
      console.warn('⚠️ Client creation failed:', clientErr.message);
      console.error('🔍 [DEBUG] Client creation error details:', clientErr);
    }
    
    // Create Keycloak Organization
    console.log('🔍 [DEBUG] Starting organization creation process...');
    let orgInfo = null;
    try {
      console.log('🔍 [DEBUG] Calling createOrganization...');
      const orgId = await createOrganization(accessToken, orgName, domain);
      orgInfo = { id: orgId, name: orgName };
      console.log('✅ Keycloak organization created successfully:', { orgId: orgInfo.id, orgName: orgInfo.name });
      console.log('🔍 [DEBUG] Organization info:', orgInfo);
      
      // Add user to the organization (only if user exists)
      console.log('🔍 [DEBUG] Checking if user exists for organization membership...');
      const userExists = await checkUserExists(accessToken, keycloakId);
      console.log('🔍 [DEBUG] User exists check result for org membership:', userExists);
      
      if (userExists && orgInfo) {
        console.log('🔍 [DEBUG] Adding user to organization...');
        await addMemberToOrganization(accessToken, orgInfo.id, keycloakId);
        console.log('✅ User added to organization');
      } else {
        console.warn('⚠️ User does not exist in Keycloak, skipping organization membership:', { keycloakId });
      }
    } catch (orgErr) {
      console.warn('⚠️ Organization creation failed:', orgErr.message);
      console.error('🔍 [DEBUG] Organization creation error details:', orgErr);
    }
    
    // Return success response
    console.log('🔍 [DEBUG] Preparing success response...');
    const response = {
      success: true,
      message: 'User, organization, and client created successfully',
      data: {
        keycloakId,
        email,
        clientId: clientInfo?.clientId,
        clientUuid: clientInfo?.clientUuid,
        clientSecret: clientInfo?.clientSecret,
        organizationName: orgName,
        organizationId: orgInfo?.id,
        domain: domain
      }
    };
    console.log('🔍 [DEBUG] Success response prepared:', response);
    console.log('🎉 [MAIN] Registration process completed successfully!');
    return response;
    
  } catch (error) {
    console.error('❌ [MAIN] Registration process failed:', error.message);
    console.error('🔍 [DEBUG] Registration error details:', error);
    throw error;
  }
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test page for Google login flow
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/test-google-login.html');
});

// Root route - OAuth callback handler for Google login
app.get('/', (req, res) => {
  console.log('🔗 [CALLBACK] Google OAuth callback received');
  console.log('🔍 [DEBUG] Query parameters:', req.query);
  
  const { code, state, error } = req.query;
  
  if (error) {
    console.error('❌ [CALLBACK] OAuth error:', error);
    return res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; margin: 50px; text-align: center;">
          <h1>❌ Login Error</h1>
          <p>Error: ${error}</p>
          <p>Description: ${req.query.error_description || 'No description'}</p>
          <a href="http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid" 
             style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Try Again
          </a>
        </body>
      </html>
    `);
  }
  
  if (!code) {
    console.error('❌ [CALLBACK] No authorization code received');
    return res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; margin: 50px; text-align: center;">
          <h1>❌ No Authorization Code</h1>
          <p>No authorization code received from Google</p>
          <a href="http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid"
             style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Try Again
          </a>
        </body>
      </html>
    `);
  }
  
  console.log('✅ [CALLBACK] Authorization code received, serving OAuth callback handler');
  // Serve the OAuth callback handler that will automatically create org/client/user
  res.sendFile(__dirname + '/public/oauth-callback.html');
});

// User registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { keycloakId, email, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!keycloakId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: keycloakId and email are required'
      });
    }
    
    const result = await handleUserRegistration({
      keycloakId,
      email,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    
    res.status(201).json(result);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Google OAuth registration endpoint (for automatic registration)
app.post('/register-google', async (req, res) => {
  try {
    const { keycloakId, email, firstName, lastName } = req.body;
    
    console.log('🔗 Google OAuth registration request:', { keycloakId, email, firstName, lastName });
    
    // Validate required fields
    if (!keycloakId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: keycloakId and email are required'
      });
    }
    
    // Check if user already has organization (avoid duplicate creation)
    const accessToken = await getKeycloakAdminToken();
    const userExists = await checkUserExists(accessToken, keycloakId);
    
    if (!userExists) {
      return res.status(404).json({
        error: 'User does not exist in Keycloak',
        message: 'Please ensure user is created in Keycloak first'
      });
    }
    
    const result = await handleUserRegistration({
      keycloakId,
      email,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    
    console.log('✅ Google OAuth registration completed:', result.data);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('Google OAuth registration error:', error);
    res.status(500).json({
      error: 'Google OAuth registration failed',
      message: error.message
    });
  }
});

// Test endpoint for manual registration
app.post('/test-register', async (req, res) => {
  try {
    const testUser = {
      keycloakId: uuidv4(),
      email: `test-${Date.now()}@example.com`, // Unique email to avoid conflicts
      firstName: 'Test User', // Test with spaces and special characters
      lastName: 'Smith Jr.' // Test with spaces and special characters
    };
    
    console.log('🧪 Creating test user in Keycloak first...', testUser);
    const accessToken = await getKeycloakAdminToken();
    const userCreated = await createTestUser(accessToken, testUser);
    
    if (userCreated) {
      console.log('🧪 Test user created, now proceeding with registration...');
      const result = await handleUserRegistration(testUser);
      res.status(201).json(result);
    } else {
      res.status(500).json({
        error: 'Failed to create test user in Keycloak',
        message: 'Could not create test user'
      });
    }
    
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({
      error: 'Test registration failed',
      message: error.message
    });
  }
});

// Get user info endpoint
app.get('/user/:keycloakId', async (req, res) => {
  try {
    const { keycloakId } = req.params;
    const accessToken = await getKeycloakAdminToken();
    
    const response = await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${keycloakId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    res.json(response.data);
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user info',
      message: error.message
    });
  }
});

// Get user's organizations
app.get('/user/:keycloakId/organizations', async (req, res) => {
  try {
    const { keycloakId } = req.params;
    const accessToken = await getKeycloakAdminToken();
    
    // Get user's organizations
    const response = await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${keycloakId}/organizations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    res.json(response.data);
    
  } catch (error) {
    console.error('Get user organizations error:', error);
    res.status(500).json({
      error: 'Failed to get user organizations',
      message: error.message
    });
  }
});

// Get user's clients
app.get('/user/:keycloakId/clients', async (req, res) => {
  try {
    const { keycloakId } = req.params;
    const accessToken = await getKeycloakAdminToken();
    
    // Get user's role mappings
    const response = await axios.get(
      `${KEYCLOAK_CONFIG.serverUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${keycloakId}/role-mappings/clients`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    res.json(response.data);
    
  } catch (error) {
    console.error('Get user clients error:', error);
    res.status(500).json({
      error: 'Failed to get user clients',
      message: error.message
    });
  }
});

// Enhanced Google Identity Provider registration endpoint
app.post('/register-google-idp', async (req, res) => {
  console.log('🔗 [ENDPOINT] Google Identity Provider registration request received');
  try {
    const { keycloakId, email, firstName, lastName } = req.body;
    
    console.log('🔗 [ENDPOINT] Google Identity Provider registration request:', { keycloakId, email, firstName, lastName });
    console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!keycloakId || !email) {
      console.error('🔍 [DEBUG] Validation failed - missing required fields:', { keycloakId, email });
      return res.status(400).json({
        error: 'Missing required fields: keycloakId and email are required'
      });
    }
    
    console.log('🔍 [DEBUG] Validation passed, getting admin token...');
    // Check if user exists in Keycloak
    const accessToken = await getKeycloakAdminToken();
    console.log('🔍 [DEBUG] Admin token obtained, checking if user exists...');
    const userExists = await checkUserExists(accessToken, keycloakId);
    console.log('🔍 [DEBUG] User exists check result:', userExists);
    
    if (!userExists) {
      console.log('⚠️ [ENDPOINT] User does not exist in Keycloak, creating user first...');
      
      // Create user in Keycloak first
      const userCreated = await createTestUser(accessToken, {
        keycloakId,
        email,
        firstName: firstName || '',
        lastName: lastName || ''
      });
      
      console.log('🔍 [DEBUG] User creation result:', userCreated);
      
      if (!userCreated) {
        console.error('🔍 [DEBUG] User creation failed');
        return res.status(500).json({
          error: 'Failed to create user in Keycloak',
          message: 'Could not create user in Keycloak'
        });
      }
      console.log('✅ [ENDPOINT] User created successfully in Keycloak');
    } else {
      console.log('ℹ️ [ENDPOINT] User already exists in Keycloak');
    }
    
    // Now proceed with organization and client creation
    console.log('🔍 [DEBUG] Proceeding with organization and client creation...');
    const result = await handleUserRegistration({
      keycloakId,
      email,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    
    console.log('✅ [ENDPOINT] Google Identity Provider registration completed:', result.data);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('❌ [ENDPOINT] Google Identity Provider registration error:', error);
    console.error('🔍 [DEBUG] Endpoint error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      error: 'Google Identity Provider registration failed',
      message: error.message
    });
  }
});

// New endpoint for existing Google IDP users (who logged in through browser)
app.post('/register-existing-google-user', async (req, res) => {
  console.log('🔗 [ENDPOINT] Register existing Google IDP user request received');
  try {
    const { email } = req.body;
    
    console.log('🔗 [ENDPOINT] Register existing Google IDP user:', { email });
    console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!email) {
      console.error('🔍 [DEBUG] Validation failed - missing email field');
      return res.status(400).json({
        error: 'Missing required field: email is required'
      });
    }
    
    console.log('🔍 [DEBUG] Validation passed, getting admin token...');
    const accessToken = await getKeycloakAdminToken();
    
    // Find the existing Google IDP user
    console.log('🔍 [DEBUG] Searching for existing Google IDP user...');
    const existingUser = await findGoogleIdpUser(accessToken, email);
    
    if (!existingUser) {
      console.error('🔍 [DEBUG] No existing Google IDP user found');
      return res.status(404).json({
        error: 'Google IDP user not found',
        message: `No user found with email: ${email}. Please login through Google first.`
      });
    }
    
    console.log('✅ [ENDPOINT] Found existing Google IDP user:', {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName
    });
    
    // Now proceed with organization and client creation using the existing user's data
    console.log('🔍 [DEBUG] Proceeding with organization and client creation for existing user...');
    const result = await handleUserRegistration({
      keycloakId: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName || '',
      lastName: existingUser.lastName || ''
    });
    
    console.log('✅ [ENDPOINT] Existing Google IDP user registration completed:', result.data);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('❌ [ENDPOINT] Existing Google IDP user registration error:', error);
    console.error('🔍 [DEBUG] Endpoint error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      error: 'Existing Google IDP user registration failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NexaAuth Registration Service running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /register - Register new user with org/client creation`);
  console.log(`   POST /register-google - Google OAuth registration (existing user)`);
  console.log(`   POST /register-google-idp - Google Identity Provider registration (auto-create user)`);
  console.log(`   POST /register-existing-google-user - Register existing Google IDP user (browser login)`);
  console.log(`   POST /test-register - Test registration with sample data`);
  console.log(`   GET /user/:keycloakId - Get user info`);
  console.log(`   GET /user/:keycloakId/organizations - Get user's organizations`);
  console.log(`   GET /user/:keycloakId/clients - Get user's clients`);
  console.log(`   GET /health - Health check`);
  console.log(`\n🔧 Keycloak Configuration:`);
  console.log(`   Server: ${KEYCLOAK_CONFIG.serverUrl}`);
  console.log(`   Realm: ${KEYCLOAK_CONFIG.realm}`);
  console.log(`   Client ID: ${KEYCLOAK_CONFIG.clientId}`);
  console.log(`\n📝 Google Mappers Used:`);
  console.log(`   - google-email-mapper: Maps email from Google OAuth`);
  console.log(`   - google-firstname-mapper: Maps first name (sanitized)`);
  console.log(`   - google-lastname-mapper: Maps last name (sanitized)`);
  console.log(`   - Names are sanitized: spaces and special characters removed`);
  console.log(`\n🎯 AUTOMATIC GOOGLE LOGIN FLOW:`);
  console.log(`   1. Open: http://localhost:8080/realms/nexaauth/protocol/openid-connect/auth?client_id=nexaauth-app&redirect_uri=http://localhost:3000&response_type=code&scope=openid`);
  console.log(`   2. Click "Google" button in Keycloak`);
  console.log(`   3. Complete Google authentication`);
  console.log(`   4. System automatically creates user, organization, and client!`);
  console.log(`\n✨ NO MANUAL API CALLS NEEDED - Everything happens automatically!`);
  console.log(`\n🔧 Backend running on: http://localhost:3000`);
  console.log(`🔧 Test page: http://localhost:3000/test`);
});

module.exports = app;
