// Initial seeded users data
const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 28, role: 'developer' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 32, role: 'designer' },
  { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', age: 25, role: 'developer' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', age: 29, role: 'manager' },
  { id: 5, name: 'David Brown', email: 'david.brown@example.com', age: 35, role: 'developer' },
  { id: 6, name: 'Emily Davis', email: 'emily.davis@example.com', age: 27, role: 'designer' },
  { id: 7, name: 'Chris Miller', email: 'chris.miller@example.com', age: 31, role: 'developer' },
  { id: 8, name: 'Lisa Garcia', email: 'lisa.garcia@example.com', age: 26, role: 'designer' },
  { id: 9, name: 'Tom Anderson', email: 'tom.anderson@example.com', age: 33, role: 'manager' },
  { id: 10, name: 'Amy Taylor', email: 'amy.taylor@example.com', age: 24, role: 'developer' },
  { id: 11, name: 'Ryan Martinez', email: 'ryan.martinez@example.com', age: 30, role: 'developer' },
  { id: 12, name: 'Jessica Lee', email: 'jessica.lee@example.com', age: 28, role: 'designer' },
  { id: 13, name: 'Kevin White', email: 'kevin.white@example.com', age: 34, role: 'manager' },
  { id: 14, name: 'Rachel Green', email: 'rachel.green@example.com', age: 25, role: 'developer' },
  { id: 15, name: 'Daniel Clark', email: 'daniel.clark@example.com', age: 29, role: 'developer' },
  { id: 16, name: 'Michelle Hall', email: 'michelle.hall@example.com', age: 31, role: 'designer' },
  { id: 17, name: 'Andrew Lewis', email: 'andrew.lewis@example.com', age: 27, role: 'developer' },
  { id: 18, name: 'Stephanie Young', email: 'stephanie.young@example.com', age: 26, role: 'designer' },
  { id: 19, name: 'Robert King', email: 'robert.king@example.com', age: 32, role: 'manager' },
  { id: 20, name: 'Nicole Wright', email: 'nicole.wright@example.com', age: 28, role: 'developer' }
];

// In-memory users store
let users = [...initialUsers];
let nextId = 21;

// User service functions
const userService = {
  // Get all users
  getAllUsers: () => {
    return [...users];
  },

  // Get user by ID
  getUserById: (id) => {
    return users.find(user => user.id === parseInt(id));
  },

  // Create new user
  createUser: (userData) => {
    const newUser = {
      id: nextId++,
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  // Update user
  updateUser: (id, userData) => {
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    return users[index];
  },

  // Delete user
  deleteUser: (id) => {
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return false;
    
    users.splice(index, 1);
    return true;
  },

  // Reset to initial data
  resetToInitial: () => {
    users = [...initialUsers];
    nextId = 21;
    return users;
  },

  // Get users count
  getCount: () => {
    return users.length;
  }
};

module.exports = userService; 