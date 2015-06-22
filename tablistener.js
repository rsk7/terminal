var ls = "ls -a\n";

var isLsCommand = function(str) {
    return str === ls;
};

var isPrompt = function(str) {
    return str.indexOf(":") > 0 &&
        str.indexOf(">") > 0;
};

var tabRequestHandler = function(socket, cmd, stdoutListener) {
    return function() {
        // removing stdout listener
        cmd.stdout.removeListener("data", stdoutListener);
        
        // adding tab request listener
        cmd.stdout.on("data", function tabRequestListener(data) {
            var str = data.toString();
            if(!isLsCommand(str)) socket.emit("tabcomplete", str);
            if(isPrompt(str)) {
                cmd.stdout.removeListener("data", tabRequestListener);
                cmd.stdout.on("data", stdoutListener);
            }
        });

        // get list of contents
        cmd.stdin.write(ls);
    };
};

module.exports = tabRequestHandler;
