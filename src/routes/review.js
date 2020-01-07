import express from 'express';
const router = express.Router();

import Reviews from '../models/Reveiw';

//Review edit handle
router.post('/edit', (req, res, next) => {
    const {reviewString, rating, id, path} = req.body;
    console.log(req.body)
    Reviews.findByIdAndUpdate(id, {reviewString: reviewString, rating: rating}).exec()
    .then(res.redirect(path))
    .catch(err => next(err))

});

//Review delete handle
router.post('/delete', (req, res, next) => {
    console.log(req.body)
    Reviews.findByIdAndDelete(req.body.id).exec()
    .then(res.redirect(req.body.path))
    .catch(err => next(err))

});

export default router;