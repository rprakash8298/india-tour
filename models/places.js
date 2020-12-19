const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
    postedBy: {
        type: String,
        required:true
    },
    images: {
        type: String,
        required:true
    },
    title: {
        type: String,
        required: true,
        trim:true
    },
    description: {
        type: String,
        required: true,
        trim:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    }
})

const Place = mongoose.model('Place', placeSchema)

module.exports = Place