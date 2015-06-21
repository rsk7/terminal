var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var spawn = require("child_process").spawn;

var emit = false;
var storeUntilConnect = "";

var stdoutListener = function(data) {
    if(emit) io.emit("stdout", data.toString());
    else storeUntilConnect += data;
};

var closeListener = function(data) {
    io.emit("close", data.toString());
};

var cmd = spawn("cmd");
cmd.stdout.on("data", stdoutListener);
// cmd.stderr.on("data", result("stderr"));
cmd.on("close", closeListener);

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

    socket.on("tab", function(tabRequest) {

        // removing stdout listener
        cmd.stdout.removeListener("data", stdoutListener);

        var tabRequestListener = function(data) {
            console.log(data.toString());
            var contentOutput = data.toString();
            var splitContents = contentOutput.split("\n");
            var list = splitContents.map(function(line) {
                return line.split(/\s/).slice(-1)[0];
            });
            io.emit("tabcomplete", list);

            // swapping out stdout listener
            if(data.toString() !== "ls -al\n") {
                cmd.stdout.removeListener("data", tabRequestListener);
                cmd.stdout.on("data", stdoutListener);
            }
        };

        // adding tab request listener
        cmd.stdout.on("data", tabRequestListener);

        // get list of contents
        cmd.stdin.write("ls -al\n");
    });
});

