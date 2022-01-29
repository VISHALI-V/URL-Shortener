//This is the entry point file.

//To use Express.
const express = require("express");
const app = express();

//bodyParser : For tapping into the body of POST requests.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//To display all the static files like CSS.
app.use(express.static("public"));

//To use EJS.
app.set("view engine", "ejs");

//To use Mongoose.
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/urlShortener", {
  useNewUrlParser: true
});

//The Schema for our Database.
const urlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    unique: true,
    required: true
  },
  shortUrl: {
    type: String,
    unique: true,
    required: true
  },
  clickCount: {
    type: Number,
    required: true,
    default: 0
  }
});

const UrlModel = mongoose.model("shortUrl", urlSchema);

//GET request : Home page.
app.get("/", function(req, res) {
  res.render("home");
});

//GET request : To display the shortURL after a POST request has been made.
app.get("/showUrl/:url", function(req, res) {
  let resultURL = UrlModel.findOne({
    shortUrl: req.params.url
  }, function(err, data) {
    if (err) throw err;
    res.render("showurl", {
      resultUrl: data
    });
    //res.send("The shortened URL for the Long URL " + data.longUrl + "is http://localhost:3000/show/" + data.shortUrl);
  });
});


//GET request : To print all the url sets in the Database.
app.get("/views", function(req, res) {
  let allUrl = UrlModel.find(function(err, result) {
    res.render("viewurls", {
      urlResult: result
    });
  });
});

//GET request : To increment the clickCount value for a particular shortURL.
app.get("/show/:urlId", function(req, res) {
  UrlModel.findOne({
    shortUrl: req.params.urlId
  }, function(err, data) {
    if (err) console.log(err);
    console.log("data : " + data);
    UrlModel.findByIdAndUpdate({
      _id: data._id
    }, {
      $inc: {
        clickCount: 1
      }
    }, function(err, updatedData) {
      if (err) throw err;
      res.redirect(data.longUrl);
    })
  });
});

//GET request : For deleting a particular URL set data from the Database.
app.get("/delete/:id", function(req, res) {
  UrlModel.findByIdAndDelete({
    _id: req.params.id
  }, function(err, deletedData) {
    if (err) throw err;
    res.redirect("/views");
  });
});

//POST request : Checks if the Long URL already exists in the Database and creates a new one if needed.
app.post("/create-short-url", function(req, res) {
  console.log("Inside /create-short-url");
  UrlModel.findOne({
    longUrl: req.body.longurl
  }, function(err, present_data) {
    if (err) console.log(err);
    console.log("present_data : " + present_data);
    if (present_data) {
      res.redirect("/showUrl/" + present_data.shortUrl);
    } else {
      let urlShort = new UrlModel({
        longUrl: req.body.longurl,
        shortUrl: urlGenerator()
      })
      urlShort.save(function(err, data) {
        if (err) throw err;
        console.log(data.shortUrl);
        res.redirect("/showUrl/" + data.shortUrl);
      });
    }
  });
});

//Server is listening to port 3000 for incoming client connections.
app.listen(3000, function() {
  console.log("Server is listening to port 3000");
});

//Function that generates the random shortURL.
function urlGenerator() {
  var randResult = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var length = characters.length;

  for (var i = 0; i < 5; i++) {
    randResult += characters.charAt(
      Math.floor(Math.random() * length)
    );
  }
  console.log(randResult);
  return randResult;
}
