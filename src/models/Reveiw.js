import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReviewSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    reviewString: {
        type: String
    },
    rating: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    movieID: {
        type: String,
        required: true
    },
    movieName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    imgURL: {
        type: String,
        required: true
    }
})

//create model from the schema
const Review = mongoose.model('Review', ReviewSchema);

export default Review;