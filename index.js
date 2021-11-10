const express = require('express');
const path = require('path');
const session = require('express-session')
const passport = require('passport');
const localStrategy = require('passport-local')
const User = require('./models/user')
const Slot = require('./models/slots')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const { isLoggedIn } = require('./middleware');
const flash = require('connect-flash')
const methodOverride = require('method-override')
const nodemailer = require('nodemailer');
const routes = require('./routes/allroutes')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    socket.on('slotbooked', (data) => {
        socket.broadcast.emit('slotbooked', data)
    })

    socket.on('slotleft', (data) => {
        socket.broadcast.emit('slotleft', data)
    })
});

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
app.use(methodOverride('_method'))

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', routes)

server.listen(3000, () => {
    console.log("Listening on port 3000")
});
