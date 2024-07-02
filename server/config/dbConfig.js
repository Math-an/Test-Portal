const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://rmathan2404:Mathan@cluster0.rnq628h.mongodb.net/testportal?retryWrites=true&w=majority&appName=Cluster0");

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("Mongo Db Connection Successful");
});

connection.on("error", (err) => {
  console.log("Mongo Db Connection Failed");
});

module.exports = connection;
