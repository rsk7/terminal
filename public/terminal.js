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

var err = function(message) {
    var errOut = $("<span/>").addClass("error").text(format(htmlEncode(message)));
    $("#stdout").append(errOut);
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

    var dir = "";
    var tabList = [];
    var tabResult;
    var inputToComplete;

    socket.on("dir", function(data) {
        dir = data.toString();
    });

    socket.on("tabcomplete", function(message) {
        var tabList = message.trim().split(/\s+/);
        var currentInput = $("#messager").val();
        if(currentInput !== tabResult) {
            inputToComplete = currentInput.trim().split(/\s+/).slice(-1)[0];
        }
        
        if(inputToComplete.length) {
            var candidates = tabList.filter(function(item) {
                return item.indexOf(inputToComplete) === 0;
            }).filter(function(item) {
                return !tabResult || item !== tabResult.trim().split(/\s+/).slice(-1)[0];
            });

            if(candidates.length) {
                var updatedInput = currentInput.trim().split(/\s+/).slice(0, -1).join(" ");
                updatedInput += " " + candidates[0];
                tabResult = updatedInput;
                $("#messager").val(updatedInput);
            }
        }
    });

    socket.on("stdout", output);
    socket.on("stderr", err);
    socket.on("close", output);

    socket.on("disconnect", function() {
        $("#status").html("disconnected")
            .removeClass("connected")
            .addClass("disconnected");
    });
});

