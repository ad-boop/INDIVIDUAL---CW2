var express = require("express");
var app = express();

// Requires the modules needed
var path = require("path");
var fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://adora:1234@getting-started.i2rya2y.mongodb.net",
  (err, client) => {
    db = client.db("schoolPlanner");
  }
);

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

// static file middlewear
app.use(function (req, res, next) {
  // Uses path.join to find the path where the file should be
  var filePath = path.join(__dirname, "static", req.url);
  // Built-in fs.stat gets info about a file
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }

    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

// the 'logger' middleware
app.use(function (req, res, next) {
  console.log("Request IP: " + req.url);
  //   console.log("Request date: " + newDate());
  next();
});

// Starts the app on port 3000 and display a message when it’s started
app.listen(3000, function () {
  console.log("App started on port 3000");
});
