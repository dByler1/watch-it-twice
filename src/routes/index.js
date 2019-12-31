import express from 'express';
import Reviews from '../models/Reveiw';
import moment from 'moment';
const router = express.Router();

/* GET home page. */

//Movie Search
router.get('/', (req, res, next) => { 
  

  const niceDate = (arr) => {
    return new Promise( (resolve, reject) => {
      const reviews = arr.map( (el) => {
        el.date = moment(el.date).fromNow();
        return el
      }) 
      resolve(reviews)
    })
  } 

  Reviews.find({}).lean().exec()
    .then( data => {
      niceDate(data)
      .then(data => {
        res.render('index/search', { reviews: data })
      })
      .catch(err => {
        next(err);
      })
    })
    .catch(err => {
      next(err);
    })
});

//Movie search handle
router.post('/movie-search', (req, res) => {
  const name = req.body.search;
  res.redirect('/movie/list/' + name);

});

//Reviews List
router.get('/review-list', (req, res) => {
  res.render('index/review-list')
});

export default router;
