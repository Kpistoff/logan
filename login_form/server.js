if(process.env.NODE_ENV !== "production"){
  require("dotenv").config()
}

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const initializePassport = require("./passport-config");
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require("method-override")

// сервер остановился
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)


const users = []
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))


// post запросы
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPassword,
    })
    console.log(users); //new users in console
    res.redirect("/login")

  }catch{
    console.log(e);
    res.redirect("/register")
  }
});

app.post('/login', checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));


// Маршруты и обработчики запросов
app.get('/', checkAuthenticated, (req, res) => {
  res.render("index.ejs", {name: req.user.name});
});
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.delete("/logout", (req, res) =>{
  req.logout(req.user, err => {
    if(err) return next(err)
    res.redirect("/")
  })
  
})




function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    res.redirect("/")
  }
  next()
}


// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});