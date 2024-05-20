const express = require("express");
const http = require("http");
const https = require("https");
const callbackController = require("./controllers/callbackController");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

app.get("/I/want/title", callbackController.callbackTask);

app.get("/I/want/title", (req, res) => {});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//
