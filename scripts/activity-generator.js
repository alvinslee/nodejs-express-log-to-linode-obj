const axios = require('axios');
const faker = require('faker');

const API_BASE = 'http://localhost:3000/api/users';

async function randomGetAllUsers() {
  try {
    await axios.get(API_BASE);
    console.log(`[${new Date().toISOString()}] GET /api/users`);
  } catch (err) {
    console.error('GET all users failed:', err.message);
  }
}

async function randomGetUser() {
  const id = Math.floor(Math.random() * 20) + 1;
  try {
    await axios.get(`${API_BASE}/${id}`);
    console.log(`[${new Date().toISOString()}] GET /api/users/${id}`);
  } catch (err) {
    // Ignore 404s
  }
}

async function randomCreateUser() {
  const user = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    age: Math.floor(Math.random() * 40) + 18,
    role: faker.name.jobType().toLowerCase()
  };
  try {
    await axios.post(API_BASE, user);
    console.log(`[${new Date().toISOString()}] POST /api/users`);
  } catch (err) {
    // Ignore duplicate email errors
  }
}

async function randomDeleteUser() {
  // Try to delete a random user in the first 25 IDs
  const id = Math.floor(Math.random() * 25) + 1;
  try {
    await axios.delete(`${API_BASE}/${id}`);
    console.log(`[${new Date().toISOString()}] DELETE /api/users/${id}`);
  } catch (err) {
    // Ignore 404s
  }
}

async function mainLoop() {
  while (true) {
    await randomGetAllUsers();
    await randomGetUser();
    await randomCreateUser();
    await randomDeleteUser();
    // Wait 15 seconds before next batch
    await new Promise(r => setTimeout(r, 15000));
  }
}

mainLoop(); 