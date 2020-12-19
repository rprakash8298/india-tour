const express = require('express')
const router = express.Router()
const Place = require('../models/places')
const auth = require('../authenticate/auth')
const multer = require('multer')
const cloudinary = require('cloudinary')

router.get('/formUpload',auth, (req, res) => {
    res.render('main/places')
 })

var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function (req, file, cb) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter })
cloudinary.config({
    cloud_name: 'do1ztuacw',
    api_key: '149988255623473',
    api_secret:'dG8X7emndqfcqgWpGNLs2s4Iikg'
})
router.post('/data',upload.single('images'),auth ,async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path)
    let place = new Place({
        postedBy:req.body.postedBy,
        images:result.secure_url,
        title: req.body.title,
        description: req.body.description,
        owner:req.user._id
    })
    try {
        await place.save()
        res.redirect('/users/dashboard')
    } catch (e) {
        console.log(e)
        res.render('main/places', {place:place})
    }
})

router.get('/placeEdit/:id', auth, async (req, res) => {
    const place = await Place.findById(req.params.id)
    res.render('main/editPlace', {place:place})
 })

router.put('/edit/:id', upload.single('images'),auth, async (req, res) => {
    try {
    const results = await cloudinary.uploader.upload(req.file.path)
        const place = {
         postedBy:req.body.postedBy,
        images:results.secure_url,
        title: req.body.title,
        description: req.body.description,
        }
        await Place.findByIdAndUpdate(req.params.id, place)
        res.render('main/dashboard')
    } catch (e) {
        res.redirect('/places/placeEdit')
         }       
})

router.delete('/placeDel/:id', auth, async (req, res) => {
    await Place.findByIdAndDelete(req.params.id)
    res.redirect('/users/dashboard')
 } )

module.exports = router