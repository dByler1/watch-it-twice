import express from 'express';
const router = express.Router();

import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import moment from 'moment';

import User from '../models/User';

//Get reset password token handle
router.post('/get-token', (req, res, next) => {

    const email = req.body.email;
    let token = crypto.randomBytes(20).toString('hex');
    token = token
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'That email is not registered')
                res.redirect('/users/reset-password')
            } else {
                console.log(token)
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            }

            user.save()
                .then(user => {
                    const smtpTransport = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'watchittwicehelp@gmail.com',
                            pass: process.env.EMAIL_PASS
                        }
                    });
                    const mailOptions = {
                        to: user.email,
                        from: 'watchittwicehelp@gmail.com',
                        subject: 'Watch It Twice Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://' + req.headers.host + '/users/new-password/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    smtpTransport.sendMail(mailOptions, (err) => {
                        if (err) { next(err) }
                        req.flash('success_msg', 'An email has been sent to ' + user.email + ' with further instructions')
                        res.redirect('/users/reset-password')
                    })
                })
                .catch(err => next(err))

        })
        .catch(err => next(err))

});

//Reset Password handle
router.post('/new-password/:token', (req, res, next) => {
    let { password, password2 } = req.body;
    const token = req.params.token;

    if (password != password2) {
        req.flash('error_msg', "Please confirm the password match");
        return res.redirect('/users/new-password/' + token);
    }

    User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
            }
            //Hash Password
            bcrypt.genSalt(12, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) { next(err) }
                    //set password to hashed
                    password = hash;
                    //save user
                    User.findByIdAndUpdate(user._id, { password: password, resetPasswordToken: undefined, resetPasswordExpires: undefined }).exec()
                        .then(user => {
                            const smtpTransport = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: 'watchittwicehelp@gmail.com',
                                    pass: process.env.EMAIL_PASS
                                }
                            });

                            const mailOptions = {
                                to: user.email,
                                from: 'watchittwicehelp@gmail.com',
                                subject: 'Your password has been changed',
                                text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                            };

                            smtpTransport.sendMail(mailOptions);

                            req.flash('success_msg', 'Password successfully changed. Login to continue.')
                            res.redirect('/users/login')
                        })
                        .catch(err => next(err))
                })
            })
        })
        .catch(err => next(err))
});

//New Password Page
router.get('/new-password/:token', (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetPasswordToken: token }, 'resetPasswordExpires')
        .then(user => {
            if (user === null || moment(user.resetPasswordExpires).add(60, 'm').isBefore(Date.now())) {
                req.flash('error_msg', 'Password reset token is invalid or has expired.');
                res.render('users/new-password', {
                    csrfToken: req.csrfToken(),
                    token: req.params.token
                }
                );
            } else {
                // res.render('users/new-password', { 
                //   token: req.params.token,
                //   csrfToken: req.csrfToken()
                // });
            }
        })
        .catch(err => next(err))

});


export default router;