import  React from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';
import Video from '../components/Videoo/video';

const ENDPOINT = 'http://localhost:8080'
// const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';

class WebRTC_Trainer extends React.Component{
  constructor(porps) {

    super(porps);
    this.state = {
      localStream: null,
      remoteStream: null,

      remoteStreams: [],
      peerConnections: {},
      selectedVideo: null,

      stauts: 'Please wait ...',

      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      },
    }
    // this.localVideoRef = React.createRef();
    // this.remoteVideoRef = React.createRef();
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

  //2:ローカル映像の取得
  getLocalStream = () => {
    const success = (stream) => {
      window.localStream = stream
      this.setState({localStream: stream})
      this.whoisOnline()
    }

    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }

    const constrains = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  //オンライン状態のユーザを
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

  //3：PeerConnectionの作成
  createPeerConnection = (socketID,callback) => {
    try {  
      let pc = new RTCPeerConnection(this.pc_config);
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc }
      this.setState({peerConnections})
      
      //自分のcandidateを取集後
      pc.onicecandidate = (e) => {
        if(e.candidate){
          this.sendToPeer('candidate',e.candidate,{
            local: this.socket.id,
            remote: socketID
          });
        }
      }
  
      pc.onconnectionstatechange = (e) => {
        console.log(e);
      }
  
      pc.ontrack = (e) => {
        let _remoteStream = null;
        let remoteStreams = this.state.remoteStreams; 
        let remoteVideo = {};

        //ここ要勉強が必要
        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)
        if(rVideos.length){
          _remoteStream = rVideos[0].stream;
          _remoteStream.addTrack(e.track,_remoteStream);
          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream,
          }
          remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
            return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
          })
        }else{
          _remoteStream = new MediaStream();
          _remoteStream.addTrack(e.track, _remoteStream);
          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream
          }
          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        this.setState(prevState => {
          // const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }
          return {
            ...remoteStream,
            remoteStreams,
          }
        })
      }
   
      this.state.localStream.getTracks().forEach(track => {
        pc.addTrack(track,this.state.localStream)
      })
      callback(pc)
    } catch(e) {
      callback(null);
      console.log("間違え");
    }
  }

  //オファーの作成

  //１：コンポーネントが生成された瞬間
  componentDidMount(){
    this.socket = io(ENDPOINT);
    this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});

   
    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

    // this.socket.on('peer-disconnect',data => {
    //   const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID)
    //   this.setState(prevState => {
    //     const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
    //     return {
    //       remoteStreams,
    //       ...selectedVideo,
    //     }
    //   })
    // })

    this.socket.on('online-peer',socketID => {
      console.log('connected peers ...', socketID)
      this.createPeerConnection(socketID,pc => {
        if(pc){
          pc.createOffer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('offer',sdp,{
                local: this.socket.id,
                remote: socketID
              })
            })
          }
      })
    })

    this.socket.on('offer',data => {
      this.createPeerConnection(data.socketID,pc => {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          pc.createAnswer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('answer', sdp, {
                local: this.socket.id,
                remote: data.socketID,
              })
            })
        })
      })
    })

    this.socket.on('answer', data => {
      const pc = this.state.peerConnections[data.socketID];
      console.log(data.sdp);
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })

    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      const pc = this.state.peerConnections[data.socketID];
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  }

  render(){
    return(
      <div className="stream">
        <div className="webVideo">
          <button
            onClick={this.stopRecording}
            style={{
              zIndex: 3,
              backgroundColor: 'white',
              position: 'relative'
            }}
          >{this.statevideoFlag ? '録画':'録画停止'}</button>
          <Video
            videoStyles={{
              zIndex: 2,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.localStream}
          />
          <Video
            videoStyles={{
              zIndex: 1,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.remoteStreams[0] && this.state.remoteStreams[0].stream}
          />
           <Video
            videoStyles={{
              zIndex: 1,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.remoteStreams[1] && this.state.remoteStreams[1].stream}
          />
           <Video
            videoStyles={{
              zIndex: 1,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.remoteStreams[2] && this.state.remoteStreams[2].stream}
          />
        
        </div>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainer;