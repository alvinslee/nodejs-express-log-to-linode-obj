require('dotenv').config();
const { testConnection } = require('../src/utils/objectStorage');

console.log('Environment variables:');
console.log('ENDPOINT:', process.env.ENDPOINT);
console.log('BUCKET:', process.env.BUCKET);
console.log('CLUSTER:', process.env.CLUSTER);
console.log('ACCESS_KEY:', process.env.ACCESS_KEY ? '***' + process.env.ACCESS_KEY.slice(-4) : 'NOT SET');
console.log('SECRET_ACCESS_KEY:', process.env.SECRET_ACCESS_KEY ? '***' + process.env.SECRET_ACCESS_KEY.slice(-4) : 'NOT SET');

async function runTest() {
  try {
    console.log('\nTesting connection using application objectStorage utility...');
    await testConnection();
  } catch (error) {
    console.error('Test script error:', error.message);
    console.error('Full error:', error);
  }
}

runTest(); 
