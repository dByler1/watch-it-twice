import express from 'express';
const router = express.Router();
import axios from 'axios';
var util = require('util')


router.get('/:search_method/:search_term', (req, res, next) => {
    const search_term = req.params.search_term ;
    const search_method = req.params.search_method;

    if (!search_method || !search_term) {
        res.status(400).send('Please send search term')
        return next();
    }

    if (search_method === 'term') {
        //https://github.com/axios/axios/issues/960

        axios.get(`http://www.omdbapi.com/?s=${search_term}&apikey=${process.env.OMDB_Key}`)
            .then(function (done) {
                //fine and can get done.data
                return res.send(done.data);
            })
            .catch(function (err) {
                //catch the error, check it has a response object with lodash 
                if (_.has(err, 'response')) {
                    console.log(err.response.status);
                    console.log(err.response.data);
                    res.status(400).send(err.response.data);
                    return next(err.response.data)
                }
                else {
                    res.status(400).json({ msg: 'error response property is undefined. Most likely a server timeout or an internet connection error'})
                    return next();
                }
            }); 
        } else if (search_method === 'id') {

        axios.get(`http://www.omdbapi.com/?i=${search_term}&apikey=${process.env.OMDB_Key}`)
            .then(function (done) {
                //fine and can get done.data
                return res.status(200).send(done.data);
            })
            .catch(function (err) {
                //catch the error, check it has a response object with lodash 
                if (_.has(err, 'response')) {
                    console.log(err.response.status);
                    console.log(err.response.data);
                    res.status(400).send(err.response.data);
                    return next(err.response.data);
                }
                else {
                    res.status(400).json({ msg: 'error response property is undefined. Most likely a server timeout or an internet connection error' })
                    return next();
                }
            });
    }
})

//search by id
// router.get('/id/:search_term', (req, res, next) => {
//     const search_term = req.params.search_term;

//     axios.get(`http://www.omdbapi.com/?s=${search_term}&apikey=${process.env.OMDB_Key}`)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(err => {
//             res.send(400).send(err)
//             next(err)
//         })

// })



export default router;