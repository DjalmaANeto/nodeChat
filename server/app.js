var app = require('http').createServer(response);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(app);

app.listen(3030);
console.log("Application on air...");

function response(req, res) {
    var archive = "";
    if (req.url == "/") {
        archive = path.resolve('interface/index.html'); 
    } else {
        archive = path.resolve('interface') + req.url;
    }

    fs.readFile(archive, (err, data)=>{
        if (err) {
            res.writeHead(404);
            return res.end('Error to load page.');
        }

        res.writeHead(200);
        res.end(data);
    });

};



io.on("connection", socket => {
    socket.on("send message", (message_sent, callback)=>{
        message_sent = "[" + cathActualDate() +  "]:" + message_sent;

        io.sockets.emit("update messages", message_sent);
        callback();
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



