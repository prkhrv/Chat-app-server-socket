var app = require('express')();
var port = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require('socket.io')(http);
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var path = require('path'); 
const axios = require('axios');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
const dbConfig = require('./config/database.config.js');
// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify:false,
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
})


// ************************************************************************
var ChatSchema = require('./api/models/chat_group_model');
var Chat = mongoose.model('Chat_messages');



// ************************************************************************

// Get available rooms

// const getRooms = async() =>{

//   console.log("getRooms called");
//   return await axios.get('https://selacious-cloud-siteapi.herokuapp.com/chats');
// }


// const getRooms2 = async ()=>{
//   var abc = await getRooms()

//   console.log(abc.data[0].room_name);
// }

// getRooms2();









// ************************************************************************



const myrooms = ["node","python"];
var rooms = {};
var room = '';


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

app.get('/:room', function(req, res){
  room = req.params.room;
  res.sendFile(__dirname + '/index.html');
    // res.json({ ON: room });
});


app.get('/getmsg/:room',function(req,res){
	Chat.findById({_id: req.params.room}, function(err, chat_group) {
      if (err)
        res.send(err);
      res.json(chat_group);
    });
});

app.post('/', function(req, res){
    room = req.body.room;
    console.log("recieved");
    console.log(room);
  // res.sendFile(__dirname + '/index.html');
    res.json({ ON: room });
});

var users = 0;
io.on("connection",(socket)=>{

	users++;

  rooms[socket.id] = room;
  console.log("chat app connected");
  console.log("total users" + users);
  io.emit("welcome","hello");

  //Join room
  socket.on("joinRoom",(room)=>{
    	console.log("join success");	
      socket.join(room);
      return socket.emit("success","you have joined the room "+ room);
  });


    socket.on("chat message",(msg)=>{
      console.log("you can now send messages");
      console.log(msg);
	  io.sockets.in(rooms[socket.id]).emit("chat message",msg);

	  // *********************
	  var new_chat_group = new Chat({_id:rooms[socket.id],messages:{username:"Computer",message:"hi"}});
    		new_chat_group.save()
	  	// Chat.findOneAndUpdate({_id:rooms[socket.id]},{$push: {messages:{message:msg.message,username:msg.user}}},{new:true},function(err,chat_group){

	  	// 	if (err)
    //     	console.log(err);
    //   		// res.json(chat_group);

	  	// });
  });

  });





http.listen(port,()=>{
console.log("Server started on "+ port);
});
