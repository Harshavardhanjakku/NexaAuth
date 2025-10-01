const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE = 'http://localhost:3001';

// Test data that matches your existing user "jakkusunitha24@gmail.com"
const testUser = {
  keycloakId: uuidv4(), // Generate new UUID for testing
  email: 'jakkusunitha24@gmail.com',
  firstName: 'Jakku',
  lastName: 'Sunitha'
};

async function testGoogleRegistration() {
  console.log('🧪 Testing Google Identity Provider Registration with Debug Logging\n');
  console.log('📋 Test User Data:');
  console.log(`   Keycloak ID: ${testUser.keycloakId}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   First Name: "${testUser.firstName}"`);
  console.log(`   Last Name: "${testUser.lastName}"`);
  console.log('\n🔍 Expected Name Sanitization:');
  console.log(`   Sanitized First Name: "${testUser.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}"`);
  console.log(`   Sanitized Last Name: "${testUser.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}"`);
  console.log(`   Combined Name Part: "${testUser.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${testUser.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}"`);
  console.log(`   Expected Client ID: "client-gmail-jakkusunitha"`);
  console.log(`   Expected Org Name: "org-gmail-jakkusunitha"`);
  console.log(`   Expected Domain: "org-gmail-jakkusunitha.org"`);
  
  console.log('\n🚀 Making API request to /register-google-idp...\n');
  
  try {
    const response = await axios.post(`${API_BASE}/register-google-idp`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Registration successful!');
    console.log('📊 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verify the created resources
    console.log('\n🔍 Verification:');
    console.log(`   ✅ User created: ${response.data.data.keycloakId}`);
    console.log(`   ✅ Client created: ${response.data.data.clientId}`);
    console.log(`   ✅ Organization created: ${response.data.data.organizationName}`);
    console.log(`   ✅ Domain: ${response.data.data.domain}`);
    
  } catch (error) {
    console.error('\n❌ Registration failed!');
    console.error('Error Details:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Message: ${error.message}`);
    }
  }
}

// Test with different name variations
async function testNameVariations() {
  console.log('\n\n🧪 Testing Name Variations\n');
  
  const testCases = [
    {
      name: 'Simple Names',
      firstName: 'John',
      lastName: 'Doe'
    },
    {
      name: 'Names with Spaces',
      firstName: 'John Michael',
      lastName: 'Doe Smith'
    },
    {
      name: 'Names with Special Characters',
      firstName: 'Jean-Pierre',
      lastName: "O'Connor"
    },
    {
      name: 'Names with Numbers',
      firstName: 'John2',
      lastName: 'Doe3'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`Input: "${testCase.firstName}" "${testCase.lastName}"`);
    
    const sanitizedFirst = testCase.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedLast = testCase.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const combined = `${sanitizedFirst}${sanitizedLast}`;
    
    console.log(`Expected Output: "${sanitizedFirst}" "${sanitizedLast}" -> "${combined}"`);
  }
}

// Run the tests
async function runTests() {
  await testGoogleRegistration();
  await testNameVariations();
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check the console output above for detailed debug logs');
  console.log('2. Verify in Keycloak Admin Console:');
  console.log('   - Users: http://localhost:8080/admin/master/console/#/nexaauth/users');
  console.log('   - Clients: http://localhost:8080/admin/master/console/#/nexaauth/clients');
  console.log('   - Organizations: http://localhost:8080/realms/nexaauth/account');
  console.log('3. Look for any error messages in the debug logs');
}

runTests().catch(console.error);
