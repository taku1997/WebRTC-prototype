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
      DisplayStream: null,

      remoteStreams: [],
      peerConnections: {},
      selectedVideo: null,
      videoFlag: true,

      stauts: 'Please wait ...',

      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      }
    }

    this.socket = null;
    this.peerConnection = null;
    this.candidates = [];
    this.user = 'trainee';
    this.pc = null
    this.pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ] 
    }
  }

  //ローカル映像の取得
  getLocalStream = () => {
    const success = (stream) => {
      window.localStream = stream
      this.setState({localStream: stream})
      this.whoisOnline()
    }
    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }
    const constrains = { video: true};
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  //すでにいるユーザを識別
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
      this.pc = new RTCPeerConnection(this.pc_config);
      const peerConnections = { ...this.state.peerConnections, [socketID]: this.pc }
      this.setState({peerConnections})
      
      //自分のcandidateを取集後
      this.pc.onicecandidate = (e) => {
        if(e.candidate){
          this.sendToPeer('candidate',e.candidate,{
            local: this.socket.id,
            remote: socketID
          });
        }
      }
  
      this.pc.onconnectionstatechange = (e) => {
        console.log(e);
      }
  
      //addTrackのが実行後
      this.pc.ontrack = (e) => {
        let _remoteStream = null;
        let _displayStream = null;
        let remoteStreams = this.state.remoteStreams; 
        let remoteVideo = {};
        let displayVideo = {}

        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)
        if(rVideos.length){
          if(e.track.kind === 'video'){
            _displayStream = new MediaStream();
            _displayStream.addTrack(e.track, _displayStream);
            displayVideo = {
              id: socketID,
              name: socketID,
              stream: _displayStream
            }
            this.setState({
              DisplayStream:displayVideo,
              videoFlag: false,
            })
          }else{
            _remoteStream = rVideos[0].stream;
            _remoteStream.addTrack(e.track,_remoteStream);
            remoteVideo = {
              ...rVideos[0],
              stream: _remoteStream,
            }
            remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
              return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
            })
          }      
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
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }
          return {
            ...remoteStream,
            remoteStreams,
          }
        })
      }

      if(this.state.localStream){
        this.state.localStream.getTracks().forEach(track => {
          this.pc.addTrack(track,this.state.localStream)
        })
      }
      callback(this.pc)
    } catch(e) {
      callback(null);
      console.log(e);
    }
  }

  //オファーの作成
  //１：コンポーネントが生成された瞬間
  componentDidMount(){
    this.socket = io(ENDPOINT);
    this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});
   

    window.onpopstate = () => {
      this.state.localStream.getTracks().forEach(track => {
        track.stop();
      })
    }

    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

    this.socket.on('peer-disconnect',data => {
      const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID)
      this.setState({remoteStreams})
      console.log("disconnect　テスト")
    })

    this.socket.on('online-peer',socketID => {
      console.log('connected peers ...', socketID)
      this.createPeerConnection(socketID,pc => {
        if(pc)
          pc.createOffer(this.state.sdpConstraints)
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
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          pc.createAnswer(this.state.sdpConstraints)
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

    //answerを受け取った後
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

    this.socket.on('offer-display',data => {
      this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
        this.pc.createAnswer(this.state.sdpConstraints)
          .then(sdp => {
            this.pc.setLocalDescription(sdp)
            this.sendToPeer('answerDisplay', sdp, {
              local: this.socket.id,
              remote: data.socketID,
            })
          })
      })
    })
  }

  render(){
    let widthSize =  this.state.videoFlag ? 700 : 200; 
    let heightSize =  this.state.videoFlag ? 350 : 182; 
    let Direction =  this.state.videoFlag ? 'row' : 'column'
    let hiddenCanvas = this.state.videoFlag ? 'hidden' : 'visible'
    return(
      <div className="stream">
        <div className="webVideo">
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexDirection: Direction,
              flexWrap: 'wrap',
            }}
          >
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                backgroundColor: 'black'
              }}
              // ref={this.localVideoRef} 
              videoStream={this.state.localStream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                backgroundColor: 'black'
              }}
              // ref={this.localVideoRef} 
              videoStream={this.state.remoteStreams[0] && this.state.remoteStreams[0].stream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                backgroundColor: 'black'
              }}
              // ref={this.localVideoRef} 
              videoStream={this.state.remoteStreams[1] && this.state.remoteStreams[1].stream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                backgroundColor: 'black'
              }}
              // ref={this.localVideoRef} 
              videoStream={this.state.remoteStreams[2] && this.state.remoteStreams[2].stream}
            />
          </div>
            <Video
              videoStyles={{
                width: 1016,
                height: 640,
                marign: 20,
                backgroundColor: 'black',
                position: 'absolute',
                visibility: hiddenCanvas,
                marign: '5%',
                right: 10,
                top: 10,
                bottom: 10,
                backgroundColor: 'black' 
              }}
              videoStream={this.state.DisplayStream && this.state.DisplayStream.stream}
            />
        </div>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainer;