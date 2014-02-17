var express = require('express'),
    passport = require('passport'),
    util = require('util'),
    GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "xxx";

var GITHUB_CLIENT_SECRET = "xxx";

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    scope: "repo"
}, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            profile.token = accessToken;
            profile.refresh = refreshToken;
            return done(null, profile);
        });
    }
));


var app = express();

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user });
});

app.get('/auth/github',passport.authenticate('github'));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('back');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    req.session.redirectUrl = req.url;

    res.redirect('/login')
}