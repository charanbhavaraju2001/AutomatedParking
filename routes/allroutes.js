const express = require("express");
const router = express.Router();
const path = require('path');
const session = require('express-session')
const passport = require('passport');
const localStrategy = require('passport-local')
const User = require('../models/user')
const Slot = require('../models/slots')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const { isLoggedIn } = require('../middleware');
const flash = require('connect-flash')
const methodOverride = require('method-override')
const nodemailer = require('nodemailer');

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success',`Welcome Back ${req.user.username}!`)
    res.redirect('/home');
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, password, email, pno, carno } = req.body;
        const user = new User({ email, username, pno, carno });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to ParkMate!');
            console.log(registeredUser);
            res.redirect('/home')
        })

    } catch (e) {
        req.flash('success', e.message);
        res.redirect('/register')
    }

}))

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/login');
})

router.get('/home', isLoggedIn, catchAsync(async (req, res) => {
    if (req.session.flag != 1) {
        const slots = await Slot.find({})
        res.render('home', { slots });
    } else {
        const slots = await Slot.find({})
        const id = req.session.slotid
        res.render('booked', { slots, id });
    }


}))

//book
router.put('/home', catchAsync(async (req, res) => {

    const { slotid } = req.body
    const updatedslot = await Slot.findOneAndUpdate({ slotid: slotid }, {
        status: 'occupied',
        user: req.user.username,
        enteredat: new Date()
    })
    console.log(updatedslot)
    req.session.flag = 1
    req.session.slotid = slotid
    res.redirect('/home')
}))

//leave
router.put('/booked', catchAsync(async (req, res) => {

    const slotid = req.session.slotid;
    const updatedslot = await Slot.findOneAndUpdate({ slotid: slotid }, {
        status: 'unoccupied',
        user: '',
        leftat: new Date()
    }, { new: true })
    const timeparked = updatedslot.leftat.getTime() - updatedslot.enteredat.getTime()
    const parkingfee = Math.floor(timeparked/(1000))
    console.log(updatedslot)
    console.log(parkingfee)
    req.session.flag = 0
    req.session.slotid = null

    //sending email


    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parkmatehelp@gmail.com',
        pass: 'parkmate123'
    }
    });

    const mailOptions = {
    from: 'parkmatehelp@gmail.com',
    to: req.user.email,
    subject: 'Parking Fee',
    text: `Hi ${req.user.username},\n
            These are the timestamps of your visit ${updatedslot.enteredat} - ${updatedslot.leftat} \n
            Your parking fee is : ${parkingfee}\n
            Thankyou for your visit!`
    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });


    const resetslot = await Slot.findOneAndUpdate({ slotid: slotid }, {
        status: 'unoccupied',
        user: '',
        enteredat: null,
        leftat: null
    })
    res.redirect('/home')
}))

router.get('/about', (req, res) => {
    res.render('about')
})


router.get('*', (req, res) => {
    req.flash("error",'There was an error/That page does not exist')
    res.redirect('home')
})

module.exports = router;