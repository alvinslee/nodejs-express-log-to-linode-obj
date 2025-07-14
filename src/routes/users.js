const express = require('express');
const router = express.Router();
const userService = require('../data/users');
const logger = require('../utils/logger');

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    const users = userService.getAllUsers();
    const count = userService.getCount();
    
    logger.info('Retrieved all users', {
      count: count,
      query: req.query
    });
    
    res.json({
      success: true,
      data: users,
      count: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving users', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = userService.getUserById(userId);
    
    if (!user) {
      logger.warn('User not found', {
        userId: userId,
        path: req.path
      });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        userId: userId
      });
    }
    
    logger.info('Retrieved user by ID', {
      userId: userId,
      userName: user.name
    });
    
    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving user by ID', {
      error: error.message,
      userId: req.params.id,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  try {
    const { name, email, age, role } = req.body;
    
    // Basic validation
    if (!name || !email) {
      logger.warn('Invalid user data provided', {
        providedData: req.body,
        missingFields: !name ? 'name' : !email ? 'email' : 'none'
      });
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
        providedData: req.body
      });
    }
    
    // Check if email already exists
    const existingUser = userService.getAllUsers().find(u => u.email === email);
    if (existingUser) {
      logger.warn('Attempted to create user with existing email', {
        email: email,
        existingUserId: existingUser.id
      });
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        email: email
      });
    }
    
    const newUser = userService.createUser({
      name,
      email,
      age: age || null,
      role: role || 'user'
    });
    
    logger.info('Created new user', {
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email
    });
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating user', {
      error: error.message,
      requestBody: req.body,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Check if user exists
    const existingUser = userService.getUserById(userId);
    if (!existingUser) {
      logger.warn('Attempted to update non-existent user', {
        userId: userId,
        updateData: updateData
      });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        userId: userId
      });
    }
    
    // Check if email is being updated and if it conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailConflict = userService.getAllUsers().find(u => u.email === updateData.email);
      if (emailConflict) {
        logger.warn('Attempted to update user with existing email', {
          userId: userId,
          newEmail: updateData.email,
          conflictingUserId: emailConflict.id
        });
        return res.status(409).json({
          success: false,
          error: 'Email already in use by another user',
          email: updateData.email
        });
      }
    }
    
    const updatedUser = userService.updateUser(userId, updateData);
    
    logger.info('Updated user', {
      userId: userId,
      userName: updatedUser.name,
      updatedFields: Object.keys(updateData)
    });
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating user', {
      error: error.message,
      userId: req.params.id,
      updateData: req.body,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = userService.getUserById(userId);
    if (!existingUser) {
      logger.warn('Attempted to delete non-existent user', {
        userId: userId
      });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        userId: userId
      });
    }
    
    const deleted = userService.deleteUser(userId);
    
    if (deleted) {
      logger.info('Deleted user', {
        userId: userId,
        userName: existingUser.name,
        userEmail: existingUser.email
      });
      
      res.json({
        success: true,
        message: 'User deleted successfully',
        deletedUser: existingUser,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  } catch (error) {
    logger.error('Error deleting user', {
      error: error.message,
      userId: req.params.id,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// POST /api/users/reset - Reset to initial data
router.post('/reset', (req, res) => {
  try {
    const initialUsers = userService.resetToInitial();
    
    logger.info('Reset users to initial data', {
      count: initialUsers.length,
      action: 'reset'
    });
    
    res.json({
      success: true,
      message: 'Users reset to initial data',
      count: initialUsers.length,
      data: initialUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error resetting users', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to reset users'
    });
  }
});

module.exports = router; 