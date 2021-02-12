import  React from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';
import Video from '../components/Videoo/video';


const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';
class WebRTC_Trainee_head extends React.Component{
  constructor(porps) {
    super(porps);
    this.state = {
      localStream: null,
    }
    // this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.socket = null;
    this.peerConnection = null;
    this.candidates = [];
    this.user = 'trainee';
    this.pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ] 
    }
  }

  getLocalStream = () => {
    const success = (stream) => {
      window.localStream = stream
      this.setState({
        localStream: stream
      })
      this.whoisOnline()
    }

    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }

    const constrains = { video: true };
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  whoisOnline = () => {
    this.sendToPeer('onlinePeers',
      null, 
      {local: this.socket.id, user: this.user})
  }

  //WebSocketサーバーに送信
  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {
      socketID,
      payload
    })
  }

  createPeerConnection = (socketID,callback) => {
    try {  
      let pc = new RTCPeerConnection(this.pc_config);
      this.peerConnection = pc;
      
      pc.onicecandidate = (e) => {
        if(e.candidate){//自分のcandidateを取集後
          this.sendToPeer('candidate',e.candidate,{
            local: this.socket.id,
            remote: socketID
          });
        }
      }
  
      pc.onconnectionstatechange = (e) => {
        console.log(e);
      }
  
      pc.onaddstream = (e) => {
        this.remoteVideoRef.current.srcObject = e.stream;
      }

      pc.addStream(this.localVideoRef.current.srcObject)
      callback(pc)

    } catch(e) {
      callback(null);
      console.log(e);
      console.log("間違え")
    }
  }

  //オファーの作成

  componentDidMount(){
    this.socket = io(ENDPOINT);
    this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});
   
    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

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

    this.socket.on('answer', data => {
      const pc = this.peerConnection;
      console.log(data.sdp);
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })


    //SDPを受け取る
    // this.socket.on('offerOrAnswer', (sdp) => {
    //   const pc = this.peerConnection;
    //   this.textref.value = JSON.stringify(sdp);
    //   pc.setRemoteDescription(new RTCSessionDescription(sdp))
    // })

    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      // this.candidates = [...this.candidates, candidate ];
      const pc = this.peerConnection;
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  }

  render(){
    console.log((this.state.l))

    return(
      <div className="stream">
        <h1>WebRTC</h1>
        <div className="webVideo">
          <Video
            videoStyles={{
              zIndex: 2,
              position: 'fixed',
              right: 0,
              width: 200,
              height: 200,
              margin: 5,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.localStream}
          />
          <Video 
            videoStyles={{
              zIndex:1,
              position: 'fixed',
              bottom: 0,
              minWidth: '100%',
              minHeight: '100%',
              backgroundColor: 'black'
            }}
            videoStream={this.state.remoteStream}
          />
        </div>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainee_head;