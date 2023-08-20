const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, getUserByEmail, getUserById){
  //func to auth users
  const authenticateUsers = async (email, password, done) => {
    // get users by email
    const user = getUserByEmail(email)

    //check if user exist
    if(user == null){    /* если user нету завершаем цикл */
      return done(null, false, {message: "No user found"})
    }
    try{
      if(await bcrypt.compare(password, user.password)){
        return done(null, user)
      } else{
          return done(null,false, {message: "Password wrong"})
      }
    }catch (e){
      console.log(e);
      return done(e)
    }
  }

  passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize