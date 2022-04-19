const express = require("express");
const { pool } = require("./dbConfig");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
require("dotenv").config();

const app = express();

const initializePassport = require("./passportConfig");

initializePassport(passport);

// middleware
app.use(express.json());
app.set("view engine", "ejs");
// parses details from a form
app.use(express.urlencoded({ extented: false }));
// serving the static files in public folder
app.use("/public", express.static(path.join(__dirname + "/public")));
app.use(
  session({
    // key we want to keep secret which will encrypt all our information
    secret: process.env.SESSION_SECRET,
    // resave our session variables on changes
    resave: false,
    // save empty value if there is no value which we do not want to have
    saveUninitialized: false,
  })
);

// function inside passport which intializes passport
app.use(passport.initialize());
//store our variables to be available across the whole session. works with app.use(session)
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  res.render("dashboard", { user: req.user.name });
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("index", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  let { name, phone, email, password, confirmPassword } = req.body;
  console.log({ name, phone, email, password, confirmPassword });

  let errors = [];

  if (!name || !phone || !email || !password || !confirmPassword) {
    errors.push({ message: "Please enter all the fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be alteast six characters" });
  }

  if (password != confirmPassword) {
    errors.push({ message: "Password doesnot match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // validation passed
    pool.query(
      "select email,phone from users where email = $1 or phone_number = $2",
      [email, phone],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows[0]);
        if (results.rows[0] != undefined) {
          if (results.rows[0].email === email) {
            errors.push({ message: "Email already exist" });
            res.render("register", { errors });
          } else if (results.rows[0].phone_number === phone) {
            errors.push({
              message:
                "Entered number is already associated with another account",
            });
            res.render("register", { errors });
          }
        } else {
          pool.query(
            "insert into users (name,phone_number,email,password) values($1,$2,$3,$4) returning id,password",
            [name, phone, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are registered. Please login");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

// app.post("/users/login", async (req, res) => {
//   let { email, password } = req.body;

//   let hashedPassword = await bcrypt.hash(password, 10);
//   console.log(email, hashedPassword);
// });

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
