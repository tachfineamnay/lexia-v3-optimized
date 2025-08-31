const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur introuvable' 
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, name } = req.body;
    
    // Build update object - harmoniser avec le frontend
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (name) {
      const nameParts = name.trim().split(/\s+/);
      updateFields.firstName = nameParts[0];
      updateFields.lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }
    if (email) updateFields.email = email;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur introuvable' 
      });
    }
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur introuvable' 
      });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Mot de passe actuel incorrect' 
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Mot de passe modifié avec succès' 
    });
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete user account
router.delete('/', authMiddleware, async (req, res) => {
  try {
    // Remove user
    await User.findByIdAndDelete(req.user.userId);
    res.json({ 
      success: true,
      message: 'Compte utilisateur supprimé avec succès' 
    });
  } catch (err) {
    console.error('Erreur lors de la suppression du compte:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 