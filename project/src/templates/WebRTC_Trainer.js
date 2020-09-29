import  React from 'react';
// import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
// import {activeTrainee} from '../reducks/trainee/operations';
import '../assets/videoChat.css';

class WebRTC_Trainer extends React.Component{
  constructor(porps) {
    super(porps);
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.socket = null;
    this.candidates = [];
  }

  componentDidMount(){
    //RTCのコネクション作成ーーーーーーーーーーーーーーーーーー
    //const dispatch = useDispatch();
    this.socket = io('http://localhost:8080');
    this.socket.emit('join',{id: this.socket.id, roomName: this.props.match.params.id});
   
    //接続完了
    this.socket.on('connection-success', success => {
      console.log(success);
    })

    this.socket.on('join',join => {
      //dispatch(activeTrainee(join));
    }) 

    //SDPを受け取る
    this.socket.on('offerOrAnswer', (sdp) => {
      this.textref.value = JSON.stringify(sdp);
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })
    //経路情報を受け取る
    this.socket.on('candidate', (candidate) => {
      // this.candidates = [...this.candidates, candidate ];
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
    
    const pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ] 
    }

    this.pc = new RTCPeerConnection(pc_config);

    this.pc.onicecandidate = (e) => {
      if(e.candidate){//自分のcandidateを取集後
        this.sendToPeer('candidate',e.candidate);
      }
    }

    this.pc.onconnectionstatechange = (e) => {
      console.log(e);
    }

    this.pc.onaddstream = (e) => {
      this.remoteVideoRef.current.srcObject = e.stream;
    }

    const success = (stream) => {
      window.localStream = stream
      this.localVideoRef.current.srcObject = stream
      this.pc.addStream(stream)
    }

    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }

    const constrains = { video: true };
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  //WebSocketサーバーに送信
  sendToPeer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload
    })
  }

  //オファーの作成
  createOffer = () => {
    console.log('Offer');
    this.pc.createOffer({offerToReceiveVideo: 1})
      .then(sdp => {
        this.pc.setLocalDescription(sdp);
        this.sendToPeer('offerOrAnswer',sdp);
      },e => {});
  }


  createAnswer = () => {
    console.log('Answer');
    this.pc.createAnswer({offerToReceiveVideo: 1})
    .then(sdp => {
      this.pc.setLocalDescription(sdp)  
      this.sendToPeer('offerOrAnswer', sdp)
    },e => {});
  }
  
  addCandidate = () => {
      this.candidates.forEach(candidate => {
      console.log(JSON.stringify(candidate));
      this.pc.addCandidate(new RTCIceCandidate(candidate));
    })
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
        </div>
        <br />
        <button onClick={this.createOffer}>Offer</button>
        <button onClick={this.createAnswer}>Answer</button>
        <br />
        <textarea ref={ref => this.textref = ref} />
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainer;