const dotenv = require("dotenv").config(),
  express = require("express"),
  app = express(),
  router = express.Router(),
  httpsLocalhost = require("https-localhost"),
  serveStatic = require("serve-static");

//ssl must be configured on the application level --here
//uncomment this block when deploying see code at the bottom of this file
// if (process.env.ENVIRONMENT === "prod") {
//   app.use(function(req, res, next) {
//     if (req.get("X-Forwarded-Proto") !== "https") {
//       res.redirect("https://" + req.get("Host") + req.url);
//     } else next();
//   });
// }

app.set("view engine", "ejs");

app.use(express.static("public/"));

//MAIN ROUTES

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/bio", function(req, res) {
  res.render("bio");
});

app.get("/show", function(req, res) {
  res.render("show");
});

if (process.env.ENVIRONMENT === "prod") {
  // sets port 8080 to default or unless otherwise specified in the environment
  app.set("port", process.env.PORT || 80);
  app.listen(app.get("port"));
} else {
  app.listen(8080, "127.0.0.1");
}

//serve stylesheets/css files
app.use(express.static("public/"));

app.get("/", function(req, res) {
  console.log("Rendering Landing");
  res.render("landing");
});

app.get("#", function(req, res) {
  res.render("#");
});

app.get("/#", function(req, res) {
  res.render("#");
});

app.get("/#", function(req, res) {
  res.render("cars");
});

app.get("/cw", function(req, res) {
  res.render("cw");
});

app.get("/bio", function(req, res) {
  res.render("bio");
});

// app.use("/contact", contactRoutes);

app.listen(process.env.PORT, process.env.IP);

console.log("Grow Native is running on the local environment");
