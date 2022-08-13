const express = require("express");
const app = express();

// Importing Routes
const booksRoute = require("./Routes/books");

app.use("/", booksRoute);

app.listen(3000, () => console.log("Server Running"));