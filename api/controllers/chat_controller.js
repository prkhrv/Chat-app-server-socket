'use strict';


// Models
var mongoose = require('mongoose'),
  Chat = mongoose.model('Chat_Group');

exports.list_all_chat_groups = function(req, res) {
    Chat.find({}, function(err, chat_group) {
      if (err)
        res.send(err);
      res.json(chat_group);
    });
  };

exports.create_a_chat_group = function(req, res,) {
    var new_chat_group = new Chat(req.body);
    new_chat_group.save(function(err, chat_group) {
      if (err)
        res.send(err);
      res.json(chat_group);

    });


  };

exports.read_a_chat_group = function(req, res) {
    Chat.findById(req.params.chatId, function(err, chat_group) {
      if (err)
        res.send(err);
      res.json(chat_group);
    });
  };

exports.update_a_chat_group = function(req, res) {
    Chat.findOneAndUpdate({_id: req.params.chatId}, req.body, {new: true}, function(err, chat_group) {
      if (err)
        res.send(err);
      res.json(chat_group);
    });
  };

exports.delete_a_chat_group = function(req, res) {
  Chat.deleteOne({
      _id: req.params.chatId
    }, function(err, chat_group) {
      if (err)
        res.send(err);
      res.json({ message: 'chat_group successfully deleted' });
    });
  };
