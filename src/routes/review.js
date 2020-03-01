import express from 'express';
const router = express.Router();
import moment from 'moment';
import authCheck from '../config/check-auth-token';
import axios from 'axios';
import _ from 'lodash';

import Review from '../models/Reveiw';

// Get all reviews
router.get('/all-reviews', (req, res, next) => {
    Review.find().lean().exec()
        .then(data => {
            data = data.map(el => {
                el.date = moment(el.date).format("MMM Do YYYY");
                return el
            })
            res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            res.status(400).json({
                error: err
            })
        })
})

const api = async (uri, data) => {
    try {
        const { data: response } = await axios({
            url: domain + uri,
            method: 'POST',
            data,
        });

        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get reviews by movie ID
router.get('/reviews-by-id/:id', (req, res, next) => {
    Review.find({ movieID: req.params.id }).lean().exec()
    .then(data => {
        res.status(200).json({
            data: data
        })
    })
    .catch(err => {
        res.status(400).json({
            error: err
        })
    })
})

//get review by userID
router.get('/reviews-by-user/:userID', (req, res, next) => {
    const userID = req.params.userID;
  Review.find({ user: userID }).lean().exec()
  .then((data) => {
    const reviews = data.map(el => {
      el.date = moment(el.date).format("MMM Do YYYY");
      return el
    })
    console.log(reviews)
    res.status(200).send(reviews) 

  })
    .catch(err => {
        res.status(400).send(err)
        next(err);
    })
});


//Review Handle
router.post('/add-review', authCheck, (req, res, next) => {
    const { reviewString, rating, movieID, movieName, imgURL, userName } = req.body;
    console.log(req.body)
    const user = req.decoded.userID;
    let errors = [];
    
    //check required fields
    if (!rating) {
        errors.push({ msg: 'Please add a rating' });
    }

    if (!reviewString && !rating) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        return res.status(406).send(errors)
    } else {

        //Validation passed    
        const newReview = new Review({
            reviewString,
            rating,
            movieID,
            movieName,
            user,
            userName,
            imgURL
        })

        newReview.save()
            .then(review => {
                res.status(200).send(review);
            })
            .catch(err => {
                res.status(400).send(err)
                next(err)
            })
    }
});

//Review edit handle
router.post('/edit-review', authCheck, (req, res, next) => {
    const {reviewString, rating, id} = req.body;

    let errors = [];

    //check required fields

    if (!rating) {
        errors.push({ msg: 'Please add a rating' });
    }

    if (!reviewString && !rating) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        return res.status(406).send(errors)
    } else { 
        Review.findByIdAndUpdate(id, {reviewString: reviewString, rating: rating}).exec()
        .then( data => {
            res.status(200).send(data)
        })
        .catch(err => {
            res.status(400).send(err)
            next(err)
        })
    }

    
});

//Review delete handle
router.post('/delete-review', authCheck, (req, res, next) => {

    Review.findByIdAndDelete(req.body.id).exec()
    .then( data => {
        res.status(200).send(data)
    })
    .catch(err => {
        res.status(400).send(err)
        next(err)
    })

});

export default router;