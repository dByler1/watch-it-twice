import express from 'express';
const router = express.Router();

import authCheck from '../config/check-auth-token';
import Review from '../models/Reveiw';
import User from '../models/User';


router.get('/get-email/:userID', authCheck, (req, res, next) => {
  const userID = req.params.userID;
  User.findById(userID, 'email').exec()
  .then(data => {
    res.status(200).send(data)
  })
  .catch(err => {
    res.status(401).send(err)
    next(err)
  })

})

//Change name handle
router.post('/change-name', authCheck, (req, res, next) => {
  const name = req.body.name;
  console.log(req.body)
  User.findByIdAndUpdate(req.body.userID, { name: name }).exec()
    .then( data => {
      console.log(data)
      Review.updateMany({ user: req.body.userID }, { userName: name}).exec()
        .then( () => {
          res.status(200).send(data)
        })
        .catch(err => {
          res.status(400).send(err)
          next(err)
        })
    })
    .catch(err => {
      res.status(400).send(err)
      next(err)
    })
});

//Change email handle
router.post('/change-email', authCheck, (req, res, next) => {
  const email = req.body.email;
  User.findByIdAndUpdate(req.body.userID, { email: email }).exec()
    .then((data) => {
      res.status(200).send(data)
    })
    .catch(err => {
      res.status(400).send(err)
      next(err)
    })
});


//User delete handle
router.post('/delete-account', authCheck, (req, res, next) => {
  User.findByIdAndDelete(req.body.userID).exec()
    .then((data) => {
      res.status(200).send(data)
    })
    .catch(err => {
      res.status(400).send(err)
      next(err)
    })
});

// GET user data 
router.get('/data', authCheck, (req, res, next) => {
  const userID = req.decoded.userID;
  User.findById(userID, 'name email').exec()
    .then(data => {
      res.status(200).send(data)
    })
    .catch(err => {
      res.status(401).send(err)
      next(err)
    })
})


export default router;
