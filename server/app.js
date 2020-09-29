const express = require('express');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const helmet = require('helmet');

const authRoutes = require('./router/auth');
const userRoutes = require('./router/user');
const trainee = require('./models/trainee');

const app = express();


app.use(helmet());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth',authRoutes);
app.use('/user',userRoutes);


mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-rzv4d.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  ).then(() => { 
    server = app.listen(process.env.PORT || 8080);
    const io = require('socket.io')(server); 
    let connectedPeers = new Map();
    
    //Socketサーバー接続時
    io.on('connection', socket => {
      console.log(socket.id);
      socket.emit('connection-success',{success: socket.id})
      connectedPeers.set(socket.id, socket);
      let roomName;

      socket.on('join',(data) => {
        roomName = data.roomName; 
        socket.join(roomName);
        io.sockets.emit("info", "全員に送信")
        if(data.user === trainee){
          io.to(data.id).emit('join',roomName);
        }
      });

      //コネクションが切れた時
      socket.on('disconnect',() => {
        console.log('disconnected');
        connectedPeers.delete(socket.id);
      });

      //OfferもしくはAnswerを受けた場合に，全部の
      socket.on('offerOrAnswer',(data) => {
        socket.broadcast.to(roomName).emit('offerOrAnswer', data.payload);
      })

      //candidateイベントが発生した時
      socket.on('candidate', (data) => {
        socket.broadcast.to(roomName).emit('candidate',data.payload);
      })
    });
  }).catch(err => console.log(err));