import express from 'express';
const router = express.Router();
import passport from 'passport';
import csrf from 'csurf';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const csrfProtection = csrf();
router.use(csrfProtection);

import registerController from '../controllers/register-controller';
const { ensureAuthenticated } = require('../config/auth');
import Review from '../models/Reveiw';
import User from '../models/User';

//Login Page
router.get('/login', (req, res) => {
  res.render('users/login',
    { csrfToken: req.csrfToken() }
  )
});

//Forgot Password Page
router.get('/reset-password', (req, res) => {
  res.render('users/forgot-password',
    { csrfToken: req.csrfToken() }
  )
});

//New Password Page
router.get('/new-password/:token', (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetPasswordToken: token}, 'resetPasswordExpires' )
  .then(user => {
    if (user === null || moment(user.resetPasswordExpires).add(60, 'm').isBefore(Date.now())) {
      req.flash('error_msg', 'Password reset token is invalid or has expired.');
      res.render('users/new-password', { 
          csrfToken: req.csrfToken(),
          token: req.params.token 
        }
      );
    } else {
      res.render('users/new-password', { 
        token: req.params.token,
        csrfToken: req.csrfToken()
      });
    }
  })
  .catch(err => next(err))
  
});

//Register Page
router.get('/register', (req, res) => {
  res.render('users/register',
    { csrfToken: req.csrfToken() }
  )
});

//Dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res, next) => {

  Review.find({ user: req.user.id }).lean().exec()
  .then((data) => {
    const reviews = data.map(el => {
      el.date = moment(el.date).format("MMM Do YYYY");
      return el
    })

    res.render('users/dashboard', {
      user: req.user,
      reviews: reviews,
      csrfToken: req.csrfToken()
    })
    
  })
    .catch(err => {
      next(err);
    })
});

//Register Handle
router.post('/register', registerController.index);

//Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

//Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Change password handle
router.post('/change-password', (req, res, next) => {
  const id  = req.user._id;
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
    res.redirect('/users/dashboard', {
      errors,
      password
    });
  } else {
    //Hash Password
    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {next(err)}
        //set password to hashed
        password = hash;
        //save user
        User.findByIdAndUpdate(id, {password: password }).exec()
          .then(res.redirect('/users/logout'))
          .catch(err => next(err))
      })
    })
  }
});

//Change name handle
router.post('/change-name', (req, res, next) => {
  const name = req.body.name;
  User.findByIdAndUpdate(req.user._id, { name: name }).exec()
    .then( data => {
      Review.updateMany({ user: req.user._id }, { userName: name}).exec()
        .then( () => {
          req.flash('success_msg', 'Successfully changed name')
          res.redirect('/users/dashboard')
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

//Change email handle
router.post('/change-email', (req, res, next) => {
  const email = req.body.email;
  User.findByIdAndUpdate(req.user._id, { email: email }).exec()
    .then(() => {
      req.flash('success_msg', 'Successfully changed email')
      res.redirect('/users/dashboard')
    })
    .catch(err => next(err))
});


//User delete handle
router.post('/delete-account', (req, res, next) => {
  User.findByIdAndDelete(req.user._id).exec()
    .then(res.redirect('/users/register'))
    .catch(err => next(err))
});

//Get reset password token handle
router.post('/get-token', (req, res, next) => {
  
  const email = req.body.email;
  let token = crypto.randomBytes(20).toString('hex');
  token = token
  User.findOne({email: email})
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
    .then (user => {
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
        if(err) {next(err)}
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
  let {password, password2} = req.body;
  const token = req.params.token;

  if(password != password2) {
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
          User.findByIdAndUpdate(user._id, { password: password, resetPasswordToken: undefined, resetPasswordExpires: undefined}).exec()
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


export default router;
