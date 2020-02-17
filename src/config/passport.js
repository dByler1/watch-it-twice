import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcryptjs';

import passportJWT from 'passport-jwt'
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

//Load User Model
import User from '../models/User';

passport.serializeUser( (user, done) => {
    done(null, user.id);
});

passport.deserializeUser( (id, done) => {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


// passport.use( new JwtStrategy({
//     jwtFromRequest: ExtractJwt.fromAuthheaderAsBearerToken(),
//     secretOrKey: process.env.JWT_Pass
//     }, (jwtPayload, cb) => {

//     //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
//     return User.findOneById(jwtPayload.id)
//         .then(user => {
//             return cb(null, user);
//         })
//         .catch(err => {
//             return cb(err);
//         });
//     }
// ));


module.exports = function(passport) {
    passport.use( new LocalStrategy({ 
    usernameField: 'email',
    passwordField: 'password'
    }, (email, password, done) => {
        // Match user
        User.findOne({
            email: email
        }).then(user => {
            if (!user) {
                return done(null, false, { message: 'That email is not registered' });
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user), {message: 'Logged in successfully'};
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        });
    }));
}

