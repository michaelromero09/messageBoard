var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/message_board_db');

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    message: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');

var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Message'},
    name: {type: String, required: true, minlength: 4},
    comment: {type: String, required: true},
});
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get('/', function(req, res) {
    Comment.find({}, function(err, comment){
        console.log(comment);
    });
    Message.populate('comments').exec(function(err){});
    Message.find({}, function(err, message){
        console.log('All Messages');
        console.log(message);
        res.render("index", {messages: message});
    });
});

app.post('/post_message', function(req, res) {
    console.log("POST DATA \n\n", req.body);
    var message = new Message({name: req.body.name, message: req.body.message});
    message.save(function(err) {
        if(err) {
            console.log('You goofed!');
        } else {
            console.log('Message received');
            res.redirect('/');
        };
    });
});

app.post('/post_comment', function(req, res) {
    console.log('COMMENTING');
    messageID = req.body.message_id;
    Message.findOne({_id: messageID}, function(err, message){
        var comment = new Comment({name: req.body.name, comment: req.body.comment});
        comment._post = messageID;
        comment.save(function(err){
            message.comments.push(comment);
            message.save(function(err){
                if(err) {
                    console.log('error');
                } else {
                    res.redirect('/');
                };
            });
        });
    });
});





app.listen(5000, function() {
  console.log("listening on port 5000");
});