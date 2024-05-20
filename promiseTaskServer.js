const express = require("express");
const promiseController = require("./controllers/promiseController");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

app.get("/I/want/title", promiseController.promiseTask);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
