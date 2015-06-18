var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var spawn = require("child_process").spawn;

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

http.listen(8080, function() {
    console.log("listening on " + 8080);
});

io.on("connection", function(socket) {
    socket.on("input", function(msg) {
        console.log(msg);
        run(msg.command, msg.args);
    });
});

var result = function(type) {
    return function(data) {
        io.emit(type, data.toString());
    };
};

var run = function(command, args) {
    var cmd = spawn(command, args);
    cmd.stdout.on("data", result("stdout"));
    cmd.stderr.on("data", result("stderr"));
    cmd.on("close", result("close"));
};
