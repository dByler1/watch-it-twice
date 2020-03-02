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
    const user = req.decoded.userID;
    let errors = [];

    const checkForExistingReview = () => {
        return new Promise((resolve, reject) => {
            Review.find({ user: user, movieID: movieID }).lean().exec()
                .then(data => {
                    console.log('checking for duplicates ' + data )
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }
    
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
        //check for existing review 
        checkForExistingReview()
        .then(data => {
            console.log(data)
            if (data.length > 0) {
                return res.status(400).send('Aleady reviewed this movie')
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
                        return res.status(200).send(review);
                    })
                    .catch(err => {
                        res.status(400).send(err)
                        return next(err)
                    })
            }
            
        })
        .catch(err => {
            res.status(400).send(err)
            return next(err)
        })

        
    }
});

//Review edit handle
router.post('/edit-review', authCheck, (req, res, next) => {
    const {reviewString, rating, id} = req.body;

    let errors = [];

    const updateReview = (newString, newRating) => {
        return new Promise((resolve, reject) => {
            Review.findByIdAndUpdate(id, { reviewString: newString, rating: newRating }).exec()
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    //check required fields

    // if (!rating) {
    //     errors.push({ msg: 'Please add a rating' });
    // }

    if (!reviewString && !rating) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        res.status(406).send(errors)
        return next(errors);
    } else { 

        if (!rating) {
            console.log('no rating')
             Review.find({ _id: id }).lean().exec()
            .then(data => {
                console.log(data[0].rating)
                if (!data[0].rating) {
                    //throw an error
                    console.log('no old rating either')
                    return res.status(406).send('Please add a review')
                } else {
                    updateReview(reviewString, data[0].rating)
                    .then(data => {
                        console.log(data)
                        return res.status(200).send(data) 
                    })
                    .catch(err => {
                        res.status(400).send(err) 
                        return next(err.response)
                    })
                    
                }
            })
            .catch(err => {
                res.status(400).send(err)
                return next(err)
            }) 
        } else if (rating) {
            updateReview(reviewString, rating)
                .then(data => {
                    console.log(data)
                    return res.status(200).send(data)
                })
                .catch(err => {
                    res.status(400).send(err)
                    return next(err.response)
                })
        }

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