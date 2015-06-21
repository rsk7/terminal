var spawn = require("child_process").spawn;
var cmd = spawn("cmd");

var emit = false;
var storeUntilConnect = "";

var stdoutListener = function(io) {
    return function(data) {
        if(emit) io.emit("stdout", data.toString());
        else storeUntilConnect += data;
    };
};

var stderrListener = function(io) {
    return function(data) {
        io.emit("stderr", data.toString());
    };
};

var closeListener = function(io) {
    return function(data) {
        io.emit("close", data.toString());
    };
};

var input = function(socket) {
    socket.on("input", function(command) {
        cmd.stdin.write(command + "\n");
    });
};

var tab = function(socket, cmd, stdoutListenerRef) {
    var tabListener = requrie("./tablistener.js");
    socket.on("tab", tabListener(socket, cmd, stdoutListenerRef));
};

var init = function(socket) {
    emit = true;
    socket.emit("stdout", storeUntilConnect);
};

var start = function(cmd, stdoutListenerRef) {
    return function(socket) {
        init(socket);
        input(socket);
        tab(socket, cmd, stdoutListenerRef);
    };
};

var serv = function(io) {
    var stdoutListenerRef = stdoutListener(io);
    cmd.stdout.on("data", stdoutListenerRef);
    cmd.stderr.on("data", stderrListener(io));
    cmd.on("close", closeListener(io));
    io.on("connection", start(cmd, stdoutListenerRef));
};

module.exports = serv;

