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

var stderrListener = function(data) {
    io.emit("stderr", data.toString());
};

var closeListener = function(data) {
    io.emit("close", data.toString());
};

var cmd = spawn("cmd");
cmd.stdout.on("data", stdoutListener);
cmd.stderr.on("data", closeListener);
cmd.on("close", closeListener);

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

var port = process.argv[2] || 7777;

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
            var stringData = data.toString();

            var isLsCommand = function(str) { 
                return str === "ls -a\n";
            };

            var isPrompt = function(str) { 
                return stringData.indexOf(":") > 0 &&
                    stringData.indexOf(">") > 0;
            };

            if(isPrompt(stringData)) {
                io.emit("dir", stringData);
            } else if (!isLsCommand(stringData)) {
                io.emit("tabcomplete", stringData);
            }

            // swapping out stdout listener
            // waiting for prompt. need to figure out a better way for 
            // this whole tab complete thing.
            if(isPrompt(stringData)) {
                cmd.stdout.removeListener("data", tabRequestListener);
                cmd.stdout.on("data", stdoutListener);
            }
        };

        // adding tab request listener
        cmd.stdout.on("data", tabRequestListener);

        // get list of contents
        cmd.stdin.write("ls -a\n");
    });
});

