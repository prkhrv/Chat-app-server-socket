'use strict';
var  mongoose = require('mongoose');


var Schema = mongoose.Schema;


// Product Schema

var ChatSchema = new Schema({
    
    _id:{ 
      type: String,
      auto: true
    },

    messages:[{
    	username: String,
    	message: String,
    	Date: {
    		type:Date,
    		default:Date.now,

    	},
    }]

  
});

module.exports = mongoose.model('Chat_messages',ChatSchema);
