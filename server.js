const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const session = require('express-session');
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');

app.use(session({
    secret: 'nothing',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: true }));
const userDataFilePath = path.join(__dirname, 'data', 'users.json');

function readUserData() {
  try {
    const data = fs.readFileSync(userDataFilePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUserData(users) {
  fs.writeFileSync(userDataFilePath, JSON.stringify(users, null, 2));
}

app.get('/', (req, res) => {
    if (!req.session.userLoggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('index', {userName: req.session.userName});
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/public/script.js');
});

app.get('/signUp', (req, res) => {
    res.render('signUp', {error: null});
});

app.post('/signUp', (req, res) => {
  const { firstName , lastName, userName , password, email } = req.body;
  const users = readUserData();
  const existingUser = users.find(u => (u.email === email)&&(u.userName === userName));

  if (existingUser) {
    res.render('signUp', {error: 'User already exists'});
  } else {
    const newUser = { firstName , lastName , userName , password, email };
    users.push(newUser);
    writeUserData(users);
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
    res.render('login', {error: null});
});


app.post('/login', (req, res) => {

  const { userName, password } = req.body;
  const users = readUserData();
  const user = users.find(u => u.userName === userName && u.password === password);

  if (user) {
    req.session.userLoggedIn = true;
    req.session.userName = user.userName;
    res.redirect('/');
  } else {
    const errorMessage = 'Invalid username or password';
    res.render('login', {error: errorMessage});
  }   
});

app.get("/about", (req, res) => {
    if (!req.session.userLoggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('about',{userName:req.session.userName})
});

app.get('/contact', (req, res) => {
    if (!req.session.userLoggedIn) {
        res.redirect('/login');
        return;
    }

    res.render('contact',{userName:req.session.userName})
});

app.get('/support', (req, res) => {
    if (!req.session.userLoggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('support',{userName:req.session.userName})
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


server.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});

