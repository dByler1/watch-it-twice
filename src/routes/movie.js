import express from 'express';
import axios from 'axios';

import Review from '../models/Reveiw';
import movieGetController from '../controllers/movie-details-get';

const router = express.Router();

//Movie List
router.get('/list/:name', (req, res) => {
    axios.get(`http://www.omdbapi.com/?s=${req.params.name}&apikey=85f5c0de`)
    .then(data => {
        res.render('movie/movie-list', {
            results: data.data.Search,
            search_term: req.params.name
        })
    })
});

//Movie Detail
router.get('/detail/:id', movieGetController.index);

//Review Handle
router.post('/add-review', (req, res, next) => {
    const { reviewString, rating, movieID, movieName, imgURL } = req.body;
    const user = req.user;
    let errors = [];
    let userName = req.user.name;

    //check required fields
    if (!reviewString || !rating ) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        res.redirect(`/movie/detail/${movieID}`,{
            errors,
            reviewString,
            rating
        });
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
            req.flash('success_msg', 'Review successfully added');
            res.redirect(`/movie/detail/${movieID}`);
        })
        .catch(err => next(err))         
    }
});



export default router;