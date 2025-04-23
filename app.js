                      const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');

const booksRoutes = require("./routes/Books")
const authRoutes = require("./routes/Auth"); 

const DB_PASSWORD="MnUp27XSl2vcC2qN"
const url = `mongodb+srv://admin69:${DB_PASSWORD}@cluster0.tfft8ge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`


mongoose
  .connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());

app.use("/images", express.static(path.join(__dirname,"images")));
app.use("/api/auth", authRoutes)
app.use("/api/books", booksRoutes)


module.exports = app;
