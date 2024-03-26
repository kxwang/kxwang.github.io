var fs = require("fs");
var host = "0.0.0.0";
var port = 3000;
var express = require("express");

var app = express();

app.use(express.static(__dirname)); //use static files in current folder

app.get("/", function(request, response){ //root dir
    response.send("Hello!!");
});

app.listen(port, host);