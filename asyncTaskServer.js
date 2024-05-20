const express = require("express");

const asyncController = require("./controllers/asyncController");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

app.get("/I/want/title", asyncController.asyncTask);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
