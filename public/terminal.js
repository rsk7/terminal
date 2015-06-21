var socket = io();

var format = function(message) {
    return message
        .replace(/\n/g, "<br/>")
        .replace(/\s/g, "&nbsp;");
};

var htmlEncode = function (value){
    return $('<div/>').text(value).html();
};
 
var output = function(message) {
    $("#stdout").append(format(htmlEncode(message)));
    window.scrollTo(0, document.body.scrollHeight);
};

var send = function(value) {
    socket.emit("input", value);
};

var isClearCommand = function(value) {
    return value.toLowerCase() === "cls" || value.toLowerCase() === "clear";
};

var handleClearCommand = function(value) {
    $("#stdout").html("");
    send("");
};

$(function(){
    $("#messager").on("keydown", function(e) {
        if(e.which === 9) {
            e.preventDefault();
            socket.emit("tab", e.target.value);
        }
    });

    $("#messager").on("keypress", function(e) {
        if(e.which === 13) {
            e.preventDefault();
            var command = e.target.value;
            if(isClearCommand(command)) handleClearCommand(command);
            else send(command);
            e.target.value = "";
        }
    });

    socket.on("connect", function() {
        $("#status").html("connected")
            .removeClass("disconnected")
            .addClass("connected");
        $("#stdout").append("<br/><br/>");
    });

    socket.on("tabcomplete", function(message) {
        console.log(message);
    });

    
    socket.on("stdout", output);
    socket.on("stderr", output);

    socket.on("close", function(message) {
        output("exit code " + message + "\n");
    });

    socket.on("disconnect", function() {
        $("#status").html("disconnected")
            .removeClass("connected")
            .addClass("disconnected");
    });
});

