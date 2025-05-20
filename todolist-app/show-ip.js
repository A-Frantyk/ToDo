const { networkInterfaces } = require('os');

function getLocalIPAddress() {
  const interfaces = networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const interfaceInfo = interfaces[interfaceName];
    
    for (const info of interfaceInfo) {
      // Skip over internal and non-IPv4 addresses
      if (!info.internal && info.family === 'IPv4') {
        console.log(`\n🌐 Your IP Address: ${info.address}\n`);
        console.log(`✅ Update the SOCKET_URL in app/utils/socket.ts to:`);
        console.log(`   const SOCKET_URL = "http://${info.address}:4000";\n`);
        return;
      }
    }
  }
  
  console.log('Could not determine your IP address.');
}

getLocalIPAddress();
