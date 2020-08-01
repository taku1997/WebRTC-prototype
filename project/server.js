const express = require('express');
const io = require('socket.io')
({
  path: '/webrtc'
})

const app = express();
const port = 8080;

app.use(express.static(__dirname + '/build'))
app.get('/',(req, res, next) => {
  res.sendFile(__dirname + '/build/index.html');
});

const server = app.listen(port,() => {//HTTPサーバーの待ち受け
  console.log('Express app');
});

io.listen(server);//socketサーバーの待ち受け
const peers = io.of('/webrtcPeer');//イベント名が同じでも、名前空間で設定したイベントを実行
let connectedPeers = new Map();

//------------------------------------------------------

peers.on('connection', socket => {
  console.log(socket.id);
  socket.emit('connection-success',{success: socket.id})
  connectedPeers.set(socket.id, socket);

  socket.on('disconnect',() => {
    console.log('disconnected');
    connectedPeers.delete(socket.id);
  });

  //OfferもしくはAnswerを受けた場合に，全部の
  socket.on('offerOrAnswer',(data) => {
    for (const [socketID, socket] of connectedPeers.entries()){//登録されている配列を返す
      if(socketID !== data.socketID){
        console.log(socketID, data.payload.type);
        socket.emit('offerOrAnswer', data.payload);
      }
    }
  })

  //
  socket.on('candidate', (data) => {
    for (const [socketID, socket] of connectedPeers.entries()){
      if(socketID !== data.socketID){
        console.log(socketID, data.payload);
        socket.emit('candidate',data.payload);
      }
    }
  })
});
