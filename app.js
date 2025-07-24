const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const projectRoutes = require('./routes/project');
const membershipRoute = require('./routes/member')
const app = express();

app.use(express.json()); 
app.use(cors());
app.use('/api/project/', projectRoutes);
app.use('/api', membershipRoute)

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });
  
  module.exports = app;