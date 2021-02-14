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
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers','Content-type,Accept,X-Custom-Header');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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
      socket.emit('connection-success',{success: socket.id})
      let roomName;

      socket.on('join',(data) => {
        roomName = data.roomName; 
        socket.join(roomName);
        connectedPeers.set(socket.id, {socket: socket, user:data.user} );
        io.sockets.emit("info", "全員に送信")
      });

      //コネクションが切れた時
      socket.on('disconnect',() => {
        console.log('disconnected');
        connectedPeers.delete(socket.id);
        socket.broadcast.emit('peer-disconnect',{
          socketID: socket.id
        })
      });

      //誰かが入手してきた時の受け取り
      socket.on('onlinePeers', (data) => {
        for (const [socketID, _socket] of connectedPeers.entries()) {
          if (socketID !== data.socketID.local) {
            // console.log('online-peer',data.socketID,socketID);
            socket.emit('online-peer', socketID)
          }
        }
      })

      socket.on('offer',data => {
        for (const [socketID, {socket,user}] of connectedPeers.entries()) {
          if (socketID === data.socketID.remote) {
            socket.emit('offer',{
              sdp: data.payload,
              socketID: data.socketID.local
            })
          }
        }
      })

      socket.on('answer', (data) => {
        for (const [socketID, {socket}] of connectedPeers.entries()) {
          if (socketID === data.socketID.remote) {
            console.log('Answer', socketID, data.socketID, data.payload.type)
            socket.emit('answer', {
                sdp: data.payload,
                socketID: data.socketID.local
              }
            )
          }
        }
      })

      //OfferもしくはAnswerを受けた場合に，全部の
      // socket.on('offerOrAnswer',(data) => {
      //   socket.broadcast.to(roomName).emit('offerOrAnswer', data.payload);
      // })

      //candidateイベントが発生した時
      socket.on('candidate', (data) => {
        // send candidate to the other peer(s) if any
        for (const [socketID, {socket}] of connectedPeers.entries()) {
          if (socketID === data.socketID.remote) {
            socket.emit('candidate', {
              candidate: data.payload,
              socketID: data.socketID.local
            })
          }
        }
      })
    });
  }).catch(err => console.log(err));