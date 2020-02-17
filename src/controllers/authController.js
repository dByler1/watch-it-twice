import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

import { validationResult } from 'express-validator';

exports.register = function (req, res, next) {

    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()})
    }

    const newUser = new User({
        name,
        email,
        password
    })

    //Hash Password
    bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hashed
            newUser.password = hash;
            //save user
            newUser.save()
                .then(user => {
                    return res.status(201).json({userName: user.name, email: user.email});
                })
                .catch(err => {
                    if(!err.statusCode) {
                        err.statusCode = 500;
                        next(err)
                    }
                })
        })
    })
};

exports.login = (req, res, next) => {

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [email, password] = new Buffer(b64auth, 'base64').toString().split(':')

    console.log(req.headers.authorization)
    let loadedUser;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            const error = new Error('A user with this email address could not be found');
            error.statusText = 'A user with this email address could not be found'
            res.status(401).send(error)
            throw error
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if (!isEqual) {
            const error = new Error('Wrong password');
            error.statusText = "Wrong password"
            res.status(401).send(error)
            throw error
        }

        const token = jwt.sign({
            userID: loadedUser._id.toString(),
            iss: "Watch It Twice"
            }, 
            process.env.JWT_Pass, 
            { expiresIn: '1h' }
        );
        res.status(200).json({token: token })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}
