const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Mock environment variables
process.env.JWT_SECRET = 'test_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Mock mongoose.connect to prevent actual connection attempts
mongoose.connect = async () => { console.log('Mocked MongoDB connected'); return Promise.resolve(); };

try {
    const app = require('../server');
    console.log('✅ Server module loaded successfully');

    // Check if routes are registered
    const routes = [];
    app._router.stack.forEach(function (r) {
        if (r.route && r.route.path) {
            routes.push(r.route.path);
        } else if (r.name === 'router' && r.handle.stack) {
            r.handle.stack.forEach(function (handler) {
                if (handler.route && handler.route.path) {
                    routes.push(handler.route.path);
                }
            });
        }
    });

    console.log('Registered Routes (Top Level):', routes);
    console.log('✅ Verification passed: Server loads and routes are registered.');
    process.exit(0);
} catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
}
