const express = require('express');
const {
    body
} = require('express-validator');
const User = require('../models/User');
const authController = require('../controllers/auth');
const router = express.Router();

router.put('/signup', [body('email').isEmail().withMessage('Please enter a valid email')
    .custom(async (value, {
        req
    }) => {
        const userDoc = await User.findOne({
            email: value
        });
        if (userDoc) {
            return Promise.reject('Email already exists');
        }
    }).normalizeEmail(), body('password').trim().isLength({
        min: 5
    }), body('name').trim().not().isEmpty()
], authController.signUp);

router.post('/login',authController.login)
module.exports = router;