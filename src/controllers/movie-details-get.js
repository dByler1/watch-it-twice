import Review from '../models/Reveiw';
import User from '../models/User';
import axios from 'axios';
import moment from 'moment';

const get_data = {
    reviewsByMovieIDQuerry: async (req, next) => {
        const data = await Review.find({ movieID: req.params.id }).lean().exec()
            .catch(err => {
                next(err);
            })

        const reviews = await data.map(el => {
            el.date = moment(el.date).format("MMM Do YYYY"); 
            return el
        }) 
        
        return reviews   
    },
    movieQuery: (req, next) => {
        const data = axios.get(`http://www.omdbapi.com/?i=${req.params.id}&apikey=85f5c0de`)
        .catch(err => {
            next(err)
        })

        return data
    }  
}

exports.index = async (req, res, next) => {

   const [results, reviews] = await Promise.all([
       get_data.movieQuery(req, next),
       get_data.reviewsByMovieIDQuerry(req, next)
   ])
   .catch(err => {
       next(err)
   })

    return res.render('movie/movie-detail', {
        results: results.data,
        reviews: reviews,
        user: req.user
    })
    
}