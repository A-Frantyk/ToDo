const http = require('http');
const https = require('https');

// Function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.port === 443 ? https : http;
        
        const req = protocol.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({ statusCode: res.statusCode, data: parsedData });
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${responseData}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testAuth() {
    try {
        // Register a new user
        console.log('1. Testing user registration...');
        const registerOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const registerData = {
            username: 'testuser',
            password: 'password123'
        };
        
        const registerResponse = await makeRequest(registerOptions, registerData);
        console.log(`Register Status Code: ${registerResponse.statusCode}`);
        console.log('Response:', registerResponse.data);
        
        if (!registerResponse.data.token) {
            console.log('Registration failed or no token received. Trying login...');
            
            // Login with the user
            console.log('\n2. Testing user login...');
            const loginOptions = {
                hostname: 'localhost',
                port: 4000,
                path: '/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const loginResponse = await makeRequest(loginOptions, registerData);
            console.log(`Login Status Code: ${loginResponse.statusCode}`);
            console.log('Response:', loginResponse.data);
            
            if (!loginResponse.data.token) {
                throw new Error('Login failed or no token received');
            }
            
            var token = loginResponse.data.token;
        } else {
            var token = registerResponse.data.token;
        }
        
        // Access protected route
        console.log('\n3. Testing protected route access...');
        const protectedOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/protected',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        
        const protectedResponse = await makeRequest(protectedOptions);
        console.log(`Protected Route Status Code: ${protectedResponse.statusCode}`);
        console.log('Response:', protectedResponse.data);
        
        // Try accessing without token
        console.log('\n4. Testing access without token (should fail)...');
        const noAuthOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/protected',
            method: 'GET'
        };
        
        const noAuthResponse = await makeRequest(noAuthOptions);
        console.log(`No Auth Status Code: ${noAuthResponse.statusCode}`);
        console.log('Response:', noAuthResponse.data);
        
        console.log('\nAuth testing complete!');
    } catch (error) {
        console.error('Error testing authentication:', error.message);
    }
}

// Run the test
testAuth();
