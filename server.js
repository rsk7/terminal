var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var spawn = require("child_process").spawn;

var emit = false;
var storeUntilConnect = "";

var result = function(type) {
    return function(data) {
        if(emit) io.emit(type, data.toString());
        else storeUntilConnect += data;
    };
};

var cmd = spawn("cmd");
cmd.stdout.on("data", result("stdout"));
cmd.stderr.on("data", result("stderr"));
cmd.on("close", result("close"));

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

var port = 7777;

http.listen(port, function() {
    console.log("listening on " + port);
});

io.on("connection", function(socket) {
    socket.emit("stdout", storeUntilConnect);
    emit = true;

    socket.on("input", function(command) {
        cmd.stdin.write(command + "\n");
    });
});

