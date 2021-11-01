const express = require('express');
const path = require('path');
const session = require('express-session')
const passport = require('passport');
const localStrategy = require('passport-local')
const User = require('./models/user')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const {isLoggedIn} = require('./middleware');
const flash = require('connect-flash')
const app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://charan:charan@cluster0.qbshq.mongodb.net/testDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sessionConfig = {
    secret: 'automatedparkingsystem',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }
}

app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

//Setting up the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

//setting up the statics path 
app.use(express.static(path.join(__dirname, '/public')));

//to parse req.body object
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//login route
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    res.redirect('/home');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, password, email, pno, carno } = req.body;
        const user = new User({ email, username, pno, carno });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to ParkingAssistant');
            console.log(registeredUser);
            res.redirect('/home')
        })

    } catch (e) {
        req.flash('success', e.message);
        res.redirect('/register')
    }

}))

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/login');
})

app.get('/home',isLoggedIn, (req, res) => {
    res.render('home');
})


app.get('*', (req, res) => {
    res.send("Error!")
})


app.listen(3000, () => {
    console.log("Listening on port 3000");
})