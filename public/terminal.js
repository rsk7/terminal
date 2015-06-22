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
    var errOut = $("<span/>").addClass("error").html(format(htmlEncode(message)));
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

var handleTabDown = function(e) {
    if(e.which === 9) {
        e.preventDefault();
        socket.emit("tab", e.target.value);
    }
};

var handleEnter = function(e) {
    if(e.which === 13) {
        e.preventDefault();
        var command = e.target.value;
        if(isClearCommand(command)) handleClearCommand(command);
        else send(command);
        e.target.value = "";
    }
};

var connectHandler = function() {
    $("#status").html("connected")
        .removeClass("disconnected")
        .addClass("connected");
    $("#stdout").append("<br/><br/>");
};

var disconnectHandler = function() {
    $("#status").html("disconnected")
        .removeClass("connected")
        .addClass("disconnected");
};

// trim and split on spaces
var trsp = function(str) {
    return str.trim().split(/\s+/);
};

var getCandidates = function(input, list, lastResult) {
    return list.filter(function(item) {
        return item.indexOf(input) === 0;
    }).filter(function(item) {
        return !lastResult ||
            item !== trsp(lastResult).slice(-1)[0];
    });
};

var tabComplete = function(input, list, lastResult) {
    var candidates = getCandidates(input, list, lastResult);
    if(input.length && candidates.length) return candidates[0];
};

var tabHandlerProvider = function() {
    var tabResult;
    var inputToComplete;
    return function(message) {
        var tabList = message.trim().split(/\s+/);
        var currentInput = $("#messager").val();
        inputToComplete = (currentInput !== tabResult) ?
            trsp(currentInput).slice(-1)[0] :
            inputToComplete;
        var result = tabComplete(inputToComplete, tabList, tabResult);
        if(result) {
            tabResult = trsp(currentInput).slice(0, -1).join(" ") + " " + result;
            $("#messager").val(tabResult);
        }
    };
};

$(function(){
    $("#messager").on("keydown", handleTabDown);
    $("#messager").on("keypress", handleEnter);
    socket.on("connect", connectHandler);
    socket.on("tabcomplete", tabHandlerProvider());
    socket.on("stdout", output);
    socket.on("stderr", err);
    socket.on("close", output);
    socket.on("disconnect", disconnectHandler);
});

