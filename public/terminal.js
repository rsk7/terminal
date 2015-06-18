var socket = io();

socket.on("connect", function() {
    console.log("connected");
});

socket.on("stdout", function(message) {
    console.log(message.toString());
});

socket.on("stderr", function(message) {
    console.log(message.toString());
});

socket.on("close", function(message) {
    console.log("exit code " + message);
});

socket.on("disconnect", function() {
    console.log("disconnected");
});

var setup = function() {
    var input = document.getElementById("messager");
    input.addEventListener("keypress", function(e) {
        if(event.which == 13) {
            event.preventDefault();
            var lineInput = input.value;
            var split = input.value.split(/\s+/);
            var command = split.shift();
            socket.emit("input", {
                command: command,
                args: split
            });
        }
    });
};

document.addEventListener("DOMContentLoaded", setup);

