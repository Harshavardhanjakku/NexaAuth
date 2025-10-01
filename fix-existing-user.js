const axios = require('axios');

async function fixExistingUser() {
  try {
    console.log('🔍 Finding existing Google user: fayazmohammed9985@gmail.com\n');
    
    // Get admin token
    const tokenResponse = await axios.post(
      'http://localhost:8080/realms/master/protocol/openid-connect/token',
      new URLSearchParams({
        grant_type: 'password',
        username: 'admin',
        password: 'admin',
        client_id: 'admin-cli',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Admin token obtained');
    
    // Find the specific user
    const usersResponse = await axios.get(
      'http://localhost:8080/admin/realms/nexaauth/users?email=fayazmohammed9985@gmail.com',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (usersResponse.data && usersResponse.data.length > 0) {
      const user = usersResponse.data[0];
      console.log('👤 Found user:', {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      // Call backend API to create organization and client
      console.log('\n🏢 Creating organization and client for existing user...');
      
      const backendResponse = await axios.post('http://localhost:3000/register-existing-google-user', {
        email: user.email
      });
      
      console.log('✅ Organization and client created successfully!');
      console.log('📊 Response:', JSON.stringify(backendResponse.data, null, 2));
      
    } else {
      console.log('❌ User fayazmohammed9985@gmail.com not found in Keycloak');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixExistingUser();
