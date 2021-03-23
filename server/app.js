var app = require('http').createServer(response);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(app);
var users = [];
var last_messages = [];

app.listen(3030);
console.log("Application on air...");

function response(req, res) {
    var archive = "";
    if (req.url == "/") {
        archive = path.resolve('interface/index.html');
    } else {
        archive = path.resolve('interface') + req.url;
    }

    fs.readFile(archive, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Error to load page.');
        }

        res.writeHead(200);
        res.end(data);
    });

};

io.on("connection", socket => {
    socket.on("enter", (nickname, callback) => {
        if (!(nickname in users)) {
            socket.nickname = nickname;
            users[nickname] = socket;
            
            for(index in last_messages){
                socket.emit("update messages", last_messages[index]);
            }

            var messages = "[ " + cathActualDate() + " ] " + nickname + " just enter the room ʕ · ᴥ · ʔ";
            var message_obj = {msg: messages, type: "system"};

            io.sockets.emit("update users", Object.keys(users));
            io.sockets.emit("update messages", message_obj);

            saveMessages(message_obj);

            callback(true);
        } else {
            callback(false);
        }
    });

    socket.on("send message", function (data, callback) {

        var message_sent = data.msg;
        var user = data.use;
        if (user == null)
            user = '';

        message_sent = "[ " + cathActualDate() + " ] " + socket.nickname + " says: " + message_sent;
        var message_obj = {msg: message_sent, type=""}

        if (user == '') {
            io.sockets.emit("update messages", message_obj);
            saveMessages(message_obj);
        } else {
            message_obj.type = 'private';
            socket.emit("update messages", message_obj);
            users[user].emit("update messages", message_obj);
        }

        callback();
    });

    

    socket.on("disconnect", () => {
        delete users[socket.nickname];
        var message = "[ " + cathActualDate() + " ] " + socket.nickname + " left the room ʕ ꈍᴥꈍʔ";
        var message_obj = {msg: message, type:"system" };

        io.sockets.emit("update users", Object.keys(users));
        io.sockets.emit("update messages", message_obj);

        saveMessages(message_obj);
    });
});

function cathActualDate() {
    var actualDate = new Date();
    var day = ((actualDate.getDate() + 1) < 10 ? '0' : '') + (actualDate.getMonth() + 1);
    var month = ((actualDate.getMonth() + 1) < 10 ? '0' : '') + (actualDate.getMonth() + 1);
    var year = actualDate.getFullYear();
    var hour = (actualDate.getHours() < 10 ? '0' : '') + actualDate.getHours();
    var minute = (actualDate.getMinutes() < 10 ? '0' : '') + actualDate.getMinutes();
    var second = (actualDate.getSeconds() < 10 ? '0' : '') + actualDate.getSeconds();

    var formattedDate = day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;

    return formattedDate;
}

function saveMessages(message) {
    if (last_messages.length > 5) {
        last_messages.shift();
    }
    last_messages.push(message);
}
