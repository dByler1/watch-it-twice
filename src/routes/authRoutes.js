const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

import User from '../models/User'
import authController from '../controllers/authController';

// Register Handle
router.post('/register',[
    body('name').not().isEmpty().trim().withMessage('Please provide a name'),
    body('email').isEmail().normalizeEmail().custom((value, {req} ) => {
        return User.findOne({ email: value })
        .then(user => {
            if(user) {
                return Promise.reject('E-mail already in use');
            }
        })
    }),
    body('password').not().isEmpty().trim().withMessage('Please enter a password'),
    body('password2').not().isEmpty().trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
], authController.register)


// Login Handle
router.post('/login', authController.login)

//Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    // res.send('/users/login');
});

//Change password handle
router.post('/change-password', (req, res, next) => {
    const id = req.body.userID;
    const password2 = req.body.password2;
    let password = req.body.password;
    let errors = [];

    //check required fields
    if (!password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //Check if password1 and password2 match
    if (password != password2) {
        errors.push({ msg: 'Please confirm the password' });
    }

    if (errors.length > 0) {
        res.status(400).send(errors)
    } else {
        //Hash Password
        bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) { next(err) }
                //set password to hashed
                password = hash;
                //save user
                User.findByIdAndUpdate(id, { password: password }).exec()
                    .then(res.status(200).send('success'))
                    .catch(err => {
                        res.status(400).send(err)
                        next(err)
                    })
            })
        })
    }
});

module.exports = router;


