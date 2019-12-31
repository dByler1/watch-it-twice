import bcrypt from 'bcryptjs';

import User from '../models/User';

exports.index = (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //Check if password1 and password2 match
    if (password != password2) {
        errors.push({ msg: 'Please confirm the password' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation passed

        User.findOne({ email: email })
            .then(user => {

                if (user) {
                    //User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('users/register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
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
                                    req.flash('success_msg', 'You are registered and can now login');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err))
                        })
                    })
                }
        });
    }
}