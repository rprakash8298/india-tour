const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../models/User')
const Place = require('../models/places')
const auth = require('../authenticate/auth')
router.get('/register', (req, res) => {
    res.render('main/register')
})

router.get('/landingPage', (req, res) => {
    res.render('main/landing')
 })

router.post('/data', async (req, res) => { 
    const { name, email, phone, password, password2 } = req.body
    const errors = []
     if (!name || !email || !phone || !password || !password2) {
        errors.push({msg:'please fill all details'})
    }
    if (password !== password2) {
        errors.push({msg:'password should be same'})
    }
    if (password.length < 6) {
        errors.push({msg:'password should be greater than 6 char'})
    }
    if (errors.length > 0) {
        res.render('main/register', { errors, name, email, phone, password, password2 })
    } else { 
        const user = await User.findOne({ email })
        if (user) {
            errors.push({ msg: 'email already exist' })
            res.render('main/register', { errors, name, email, phone, password, password2})
        } else {
            const newuser = new User({ name, email, phone, password })
            try {
                await newuser.save()
                const token = await newuser.genAuthToken()
                res.cookie('jwt', token )
                res.redirect('/users/login')
            } catch (e) {
                console.log(e)
            }
         }
    }
    
})
router.get('/login', (req, res) => { 
    res.render('main/login')
})

router.post('/login', async (req, res) => {
     const { email, password } = req.body
        const error1 = []
    try {
       
        const user = await User.findOne({ email })
        // console.log(user)
        if (!user) {
            error1.push({ msg1: 'Email Is Invalid' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            error1.push({ msg1: 'Password Is Incorrect' })
        }
        if (error1.length > 0) {
            res.render('main/login', { error1, user:user })
        } else {
            const token= await user.genAuthToken()
            res.cookie('jwt',token )
            res.redirect('/users/dashboard')
        }
    } catch (e) {
        console.log(e)
     }
    
})
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => { 
            return token.token !==req.token
        })
        await req.user.save()
                res.clearCookie('jwt')
        res.redirect('/users/login')
    } catch (e) {
       console.log(e) 
    }
 })

router.post('/logoutAll', auth, async (req, res) => {
       try {
           req.user.tokens = []
           await req.user.save()
                   res.clearCookie('jwt')
           res.redirect('/users/login')
       } catch (e) {
           
       }
 })

router.get('/dashboard', auth, async (req, res) => {
    const allplace = await Place.find() 
    res.render('main/dashboard', {allplace:allplace})
 })

router.get('/edit',auth ,(req, res) => {
    res.render('main/edit')
 })

router.put('/update',auth, async (req, res) => { 
    try {
    const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password:req.body.password
      }
        // console.log(req.user.id)
        // req.user.data.save()
        await User.findByIdAndUpdate(req.user.id, data)
        res.redirect('/users/login')
    } catch (e) {
        console.log(e)
        res.redirect('/users/edit')
    }
    
})

router.get('/profile', auth, async (req, res) => { 
    try {
        const places = await Place.find({ owner: req.user._id })
        res.render('main/userProfile', {places:places})
   } catch (e) {
      console.log(e) 
   }
    
})
router.delete('/me',auth, async (req, res) => { 
    try {
        await req.user.remove()
                res.clearCookie('jwt')
        
    res.redirect('/users/register')
    } catch (e) {
        res.send(e)
    }

})
module.exports = router