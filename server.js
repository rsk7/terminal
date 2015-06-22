var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var serv = require("./serv_terminal.js")(io);

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

var port = process.argv[2] || 7777;

http.listen(port, function() {
    console.log("listening on " + port);
});


