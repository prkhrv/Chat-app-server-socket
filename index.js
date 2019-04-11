var app = require('express')();
var port = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require('socket.io')(http);
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var path = require('path'); 
const axios = require('axios');


// Notification Code
var admin = require("firebase-admin");
var registrationToken = "eeFp-yuOXgE:APA91bHedgxaKY4-UedU8O-XXwoRqeYnHg2cQGSUvYb39rQ3zNg7yxI2AyvPP6awpmXFg4jQVM-L4ff1EfS3hnb6SvwgKa1km-a7hIzRHQWK5vZOscaQX1kuHgQw1w3_uiNtllTqJusH";
var serviceAccount = require("./key/serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mychatapp-66037.firebaseio.com"
});


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

app.get('/getmsg/:room/:id',function(req,res){
  Chat.find({_id:req.params.room,messages:{_id:req.params.id}},function(err,chat_message){
    if(err)
      res.send(err);
    res.json(chat_message);

  });
});

app.post('/', function(req, res){
    room = req.body.room;
    console.log("recieved");
    console.log(room);
  // res.sendFile(__dirname + '/index.html');
    res.json({ ON: room });
});

app.get('/mobile/:room',function(req,res){

	room = req.params.room;
	res.json({ON: room});

});

app.post('/mobile/notification', cors(), function(req,res){
  var payload = {
  notification: {
    title: "TravelKit",
    body: "Your Request has been Accepted",
  },
  token: req.body.user_token,
};




// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(payload)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });

  res.json({notification: sent});

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
	  // var new_chat_group = new Chat({_id:rooms[socket.id],messages:{username:"Computer",message:"Welcome To This New Room"}});
   //  		new_chat_group.save()
	  	Chat.findOneAndUpdate({_id:rooms[socket.id]},{$push: {messages:{message:msg.message,username:msg.user}}},{new:true},function(err,chat_group){
	  		if (err)
        	console.log(err);
      		// res.json(chat_group);
        });
      var payload = {
                notification: {
                    title: "You have a new message",
                    body: msg.message,
                  },
                  topic: rooms[socket.id],
              };

          var options = {
                priority: "High",
                importance: "Max",
                sound:"Enabled",
                timeToLive: 60 * 60 *24,
            };




// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(payload)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
  });

  });





http.listen(port,()=>{
console.log("Server started on "+ port);
});
