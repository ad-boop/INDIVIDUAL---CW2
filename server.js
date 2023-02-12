// Requires the modules needed

var express = require("express");
var app = express();
var cors = require('cors')
var path = require("path");
var fs = require("fs");
const MongoClient = require("mongodb").MongoClient;


app.use(express.json());
app.use(cors());
app.set('port', 3000)

//logger middleware. Logs all the incoming requests
app.use(function(req, res, next) {
    console.log("In comes a " + req.method + " with Request IP: " + req.url);
    console.log("Request date: " + new Date());
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// static file middlewear
app.use(function (req, res, next) {
  // Uses path.join to find the path where the file should be
  var filePath = path.join(__dirname, "static", req.url); //determines the file path
  // Built-in fs.stat gets info about a file
  fs.stat(filePath, function (err, fileInfo) {
    if (err) { //if error exists
      next();
      return;
    }

    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

let db;
MongoClient.connect(
  "mongodb+srv://adora:1234@getting-started.i2rya2y.mongodb.net",
  (err, client) => {
    db = client.db("schoolPlanner");
  }
);


app.get('/', (req, res, next) => {
  res.send('Select a collection, e.g., /collectionName');
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

// get route to retreive all the objects from the collection
app.get("/collection/:collectionName", (req, res, next) => {
  // find the data from the mongodb
  // toArray to get the actual results
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(JSON.stringify(results));
  });
});


// post route to add the object to the collection
app.post("/collection/:collectionName", (req, res, next) => {
  // insert one is to insert the object one at a time
  req.collection.insertOne(req.body, (e, results) => {
    if (e) return next(e);
    // object identifier
    res.send(results+" updated to db");
    console.log(req.body)
  });
});

// get route to be able to search as you type
app.get("/collection/:collectionName/:search", (req, res, next) => {
  console.log(req.params.search);
  // finding the objects using $or (or) condition with subject or location
  // using $regex to cgeck if a object contains the specific string or character
  // $options=i to check the Case insensitivity 
  req.collection.find({$or: [ {subject: { $regex: '^'+req.params.search, $options: "i" }}, {location: { $regex: '^'+req.params.search, $options: "i" }}]}).toArray((e, results) => {
    if (e) return next(e);
    console.log(results);
    res.send(JSON.parse(JSON.stringify(results)));
  });
});

// created the objectid object in mongodb
const ObjectID = require('mongodb').ObjectID;
//GET request to find a collection with a given ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
  // find the object with the given object id
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
  if (e) return next(e)
  res.send(result)
  })
  })

  // after finding object- using put route to update the object with specific id
app.put("/collection/:collectionName/:id", (req, res, next) => {
  // update() to update the object in mongodb database
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body }, 
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});


//If an image does not exist in the static folder, the error message is displayed.
// last middlewear
app.use(function(req, res){
  // sends if error of status code 404
  res.status(404).send("File not Found! try again...");
});   

//deploying the server
// getting port number from heroku
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log("Server running...");
});


