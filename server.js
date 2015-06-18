var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var spawn = require("child_process").spawn;
var cmd = spawn("cmd");

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

var port = 7777;

http.listen(port, function() {
    console.log("listening on " + port);
});

io.on("connection", function(socket) {
    socket.on("input", function(command) {
        cmd.stdin.write(command + "\n");
        cmd.stdout.on("data", result("stdout"));
        cmd.stderr.on("data", result("stderr"));
        cmd.on("clost", result("close"));
    });
});

var result = function(type) {
    return function(data) {
        io.emit(type, data.toString());
    };
};

