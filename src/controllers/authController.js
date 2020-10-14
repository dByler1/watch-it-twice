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
            if (err) {
                res.status(400).json({msg: 'Error hashing password', error: err})
                return next(err)
            }

            //set password to hashed
            newUser.password = hash;
            //save user
            newUser.save()
                .then(user => {
                    return res.status(201).json({userName: user.name, email: user.email});
                })
                .catch(err => {
                    res.status(400).json({ msg: 'Error hashing password', error: err })
                    return next(err)
                })
        })
    })
};

exports.login = (req, res, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [email, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    let loadedUser;

    User.findOne({email: email})
    .then(user => {
        if (!user) {
            res.status(401).send('A user with this email address could not be found')
            return next('A user with this email address could not be found')
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if (!isEqual) {
            res.status(401).send("Wrong password")
            return next('Wrong password')
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
        res.status(500).send(err)
        return next(err)
    })
}
