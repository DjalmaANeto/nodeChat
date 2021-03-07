var io = require('socket.io')(app);

var socket = io.connect();

$("form#chat").submit((e)=> {
   e.preventDefault();

   socket.emit("send message", $(this).find('#message_text').val(), ()=>{
       $("form#chat #message_text").val("");
   });
 
});

socket.on("update messages", ()=>{
    var formattedMessage = $("<p />").text(message); 
    $("#messages_history").append(formattedMessage);
});