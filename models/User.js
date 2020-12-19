const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('email is invalid')
            }
        }
    },
    phone: {
        type: Number,
        required:true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
    tokens: [{
        token: {
            type: String,
            required:true
        }
    }]
})

userSchema.virtual('places', {
    ref: 'Place',
    localField: '_id',
    foreignField:'owner'
})

userSchema.methods.genAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, `${process.env.JWT_KEY}`, {expiresIn:'15 minute'})
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token

 }

userSchema.pre('save', async function (next){ 
    const user = this
    if (user.isModified('password')) { 
        user.password =await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User