import  React, { useCallback } from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';

const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';

class WebRTC_Trainer extends React.Component{
  constructor(porps) {
    super(porps);
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.remoteVideoRef_head = React.createRef();
    this.socket = null;
    this.peerConnections = {};
    this.count = 0;
    this.user = 'trainer';
    this.pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ] 
    }
  }

  getLocalStream = () => {
    //getUserMedia成功時
    const success = (stream) => {
      window.localStream = stream
      this.localVideoRef.current.srcObject = stream
      this.whoisOnline()
    }
    
    //getUserMedia失敗時
    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }

    //getUserMedia実行
    const constrains = { video: true };
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  //すでにOnline済みの人へsocketID送信
  whoisOnline = () => {
    this.sendToPeer('onlinePeers',null, 
      {local: this.socket.id, user: this.user})
  }

  //WebSocket(Node.JS)サーバーに送信
  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {socketID,payload})
  }

  createPeerConnection = (socketID,callback) => {
    try {  
      let pc = new RTCPeerConnection(this.pc_config);
      this.peerConnections = {...this.peerConnections, [socketID]: pc};
      
      //自分のcandidateを取集後
      pc.onicecandidate = (e) => {
        if(e.candidate){
          this.sendToPeer('candidate',e.candidate,{
            local: this.socket.id,
            remote: socketID
          });
        }
      }
  
      //ICEのステータスが変更になった時
      pc.onconnectionstatechange = (e) => {
        console.log(e);
      }

      //相手の映像/音声がSDP内に含まれていた場合
      pc.onaddstream = (e) => {
        if (this.count % 2 === 0){
          this.remoteVideoRef.current.srcObject = e.stream;
        }else{
          this.remoteVideoRef_head.current.srcObject = e.stream;
        }
        this.count += 1; 
      }

      pc.addStream(this.localVideoRef.current.srcObject)
      callback(pc)

    } catch(e) {
      callback(null);
      console.log(e);
      console.log("間違え")
    }
  }


  componentDidMount(){
    this.socket = io(ENDPOINT);
    this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});
   
    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

    //すでにOnlineのユーザからのSocketIDを受け取り，Offerを送信する
    this.socket.on('online-peer',socketID => {
      this.createPeerConnection(socketID,pc => {
        if(pc)
          pc.createOffer({offerToReceiveVideo: 1})
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('offer',sdp,{
                local: this.socket.id,
                remote: socketID
              })
            })
      })
    })

    //Offerを受け取り,Answerを送信する
    this.socket.on('offer',data => {
      this.createPeerConnection(data.socketID,pc => {
        pc.addStream(this.localVideoRef.current.srcObject)

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          pc.createAnswer({offerToReceiveVideo: 1})
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('answer', sdp, {
                local: this.socket.id,
                remote: data.socketID,
                user: this.user
              })
            })
        })
      })
    })

    //Answerを受け取り,SDPを保存する
    this.socket.on('answer', data => {
      const pc = this.peerConnections[data.socketID];
      console.log(data.sdp);
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })


    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      // this.candidates = [...this.candidates, candidate ];
      const pc = this.peerConnections[data.socketID];
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  }

  render(){
    return(
      <div className="stream">
        <h1>WebRTC</h1>
        <div className="webVideo">
          <video 
            hidden
            ref={this.localVideoRef} 
            autoPlay
          />
          <video 
            ref={this.remoteVideoRef} 
            autoPlay
          />
          <video 
            ref={this.remoteVideoRef_head} 
            autoPlay
          />
        </div>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainer;