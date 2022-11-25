require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// My answer starts here
let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a Person model
const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  short: {
    type: Number,
  },
});

// Create and save a Person
let Url = mongoose.model("Url", urlSchema);

let bodyParser = require("body-parser");
let bodyParserUrlencoded = bodyParser.urlencoded({ extended: false });


app.post("/api/shorturl", bodyParserUrlencoded, (req, res) => {
  let answer = {};
  let urlInput = req.body["url"];
  console.log("This is url input:  " + urlInput)
  let urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/



  if (urlRegex.test(urlInput)) {
    console.log("Collect URL");
    answer["original_url"] = urlInput;
    let shortNum = 1;
    Url.findOne({})
      .sort({ short: "desc" })
      .exec((err, result) => {
        if (err) return console.error(err);
        if (!err && result != undefined) shortNum = result.short + 1;
        Url.findOneAndUpdate(
          { url: urlInput },
          { url: urlInput, short: shortNum },
          { new: true, upsert: true },
          (err, result) => {
            if (err) return console.error(err);
            answer["short_url"] = result.short;
            res.json(answer);
            console.log(answer)
          }
        );
      });
  } else {
    console.log("Wrong URL")
    answer = { error: "invalid url" }
    res.json(answer);
    console.log(answer)
  }
});

app.get("/api/shorturl/:input", (req, res) => {
  let input = req.params.input
  console.log(input)
  Url.findOne({short: input}, (err, result) => {
    if (!err && result != undefined) {
      console.log(result.url)
      res.redirect(result.url)
    }else{
      res.json("URL not found")
    }
  })
})
