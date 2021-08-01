var dotenv = require("dotenv").config(),
            express = require("express"),
            app = express(),
            session = require('express-session'),
            // app = httpsLocalhost(),
            // expressSanitizer = require("express-sanitizer"),
            methodOverride = require("method-override"),
            mongoose = require("mongoose"),
            passport = require("passport"),
            LocalStrategy = require("passport-local"),
            User = require("./models/user"),
            serveStatic = require("serve-static"),
            nodemailer = require("nodemailer"),
            request = require("request"),
            router = express.Router(),
            httpsLocalhost = require("https-localhost"),
            serveStatic = require("serve-static");

//ssl must be configured on the application level --here
//uncomment this block when deploying, see code at the bottom of this file

if (process.env.ENVIRONMENT === "prod") {
  app.use(function (req, res, next) {
    if (req.get("X-Forwarded-Proto") !== "https") {
      res.redirect("https://" + req.get("Host") + req.url);
    } else next();
  });
}

mongoose.connect( process.env.DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
     .then(() => console.log( 'Database Connected' ))
     .catch(err => console.log( err ));

// mongoose.set("useFindAndModify", false);


app.set("view engine", "ejs");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
// app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(express.static("public/"));

//passport config
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

  //from npm docs

  var sess = {
    secret: process.env.secret,
    cookie: {}
  }
  
  if (app.get(process.env.ENVIRONMENT) === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }
  
  app.use(session(sess))


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//BLOG ROUTES
//Mongoose/model config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
});



var Blog = mongoose.model("Blog", blogSchema);



app.get("/index", function (req, res) {
  console.log(req.user || "no user logged in");
  // get newest blog post to display first
  Blog.find({}, null, { sort: { created: -1 } }, function (err, blogs) {
    if (err) {
      console.log("ERROR");
    } else {
      res.render("index", {
        blogs: blogs,
        currentUser: req.user
      });
    }
  });
});

app.get("/new", isLoggedIn, function (req, res) {
  res.render("new");
});

//create blog route
app.post("/index", isLoggedIn, function (req, res) {
  console.log(req.body);
  // req.body.blog.body = req.sanitize(req.body.blog.body);
  var formData = req.body.blog;
  Blog.create(formData, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/index");
    }
  });
});

//blog show page
app.get("/index/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, blog) {
    if (err) {
      res.redirect("/index");
    } else {
      res.render("show", {
        blog: blog
      });
    }
  });
});

//edit route
app.get("/index/:id/edit", isLoggedIn, function (req, res) {
  Blog.findById(req.params.id, function (err, blog) {
    if (err) {
      res.redirect("/index");
    } else {
      res.render("edit", {
        blog: blog
      });
    }
  });
});

//update route
app.put("/index/:id", isLoggedIn, function (req, res) {
  // req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, blog) {
    if (err) {
      console.log(err);
    } else {
      var showUrl = "/index/" + blog._id;
      res.redirect(showUrl);
    }
  });
});

//destroy route
app.delete("/blogs/:id", isLoggedIn, function (req, res) {
  Blog.findById(req.params.id, function (err, blog) {
    if (err) {
      console.log(err);
    } else {
      blog.remove();
      res.redirect("/index");
    }
  });
});


//AUTH ROUTES

//show register form
app.get("/register", function (req, res) {
  res.render("register");
});

//handle sign up logic
app.post("/register", function (req, res) {
  var newUser = new User({
    username: req.body.username
  });
  if (req.body.adminCode === process.env.isAdmin) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      // alert("a user with the given username already exists");
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/index");
    });
  });
});

//show login form
app.get("/login", function (req, res) {
  res.render("login");
});

//handle login logic
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/login"
  }),
  function (req, res) { }
);

//logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/index");
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

//BIO PAGE

app.get("/bio", function (req, res) {
  res.render("bio");
});

app.get("/", function (req, res) {
  res.render("landing");
});

// app.set('port', (process.env.PORT || 5000));



// app.use("/contact", contactRoutes);

// app.get("/contactMe", function (req, res) {
//   res.render("contactMe");
// });


if (process.env.ENVIRONMENT === "prod") {
  // sets port 8080 to default or unless otherwise specified in the environment
  app.set("port", process.env.PORT || 80);
  app.listen(app.get("port"));
} else {
  app.listen(8080, "0.0.0.0");
}


// if (process.env.ENVIRONMENT === "prod") {
//   app.listen(process.env.PORT || 5000);
// }
