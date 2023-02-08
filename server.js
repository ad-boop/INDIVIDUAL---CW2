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
    console.log("In comes a " + req.method + " request to " + req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})
// app.use((req, res, next) => {
    
//     next();
// });

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

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(JSON.stringify(results));
  });
});



app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insertOne(req.body, (e, results) => {
    if (e) return next(e);
    // object identifier
    res.send(results.ops);
    console.log(req.body)
  });
});

app.get("/collection/:collectionName/:search", (req, res, next) => {
  console.log(req.params.search);
  // //Create a PHP array with our search criteria
  req.collection.find({$or: [ {subject: { $regex: '^'+req.params.search, $options: "i" }}, {location: { $regex: '^'+req.params.search, $options: "i" }}]}).toArray((e, results) => {
    if (e) return next(e);
    console.log(results);
    res.send(JSON.parse(JSON.stringify(results)));
  });
});


const ObjectID = require('mongodb').ObjectID;
//GET request to find a collection with a given ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
  if (e) return next(e)
  res.send(result)
  })
  })

app.put("/collection/:collectionName/:id", (req, res, next) => {
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


//If an image does not exist in the static folder, the error message is displayed.
app.use(function(req, res){
  res.status(404);
  res.send("File not Found! try again...");
});   

//deploying the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log("Server running...");
});


