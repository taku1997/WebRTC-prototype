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
      DisplayStream: null,
      recorder: [],
      blobUrl: null,
      videoFlag: true,

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
    this.user = 'trainer';
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

    const constrains = {video: true};
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

  //startRecoding() → ユーザ映像の録画
  recorderScreen = (stream,i) => {
    if(stream !== null){
      let record = null
      let recorder= this.state.recorder;
      let blobVideo = null
      let blobUrl = null;
      let checkRecorder = recorder[i]

      if(checkRecorder === undefined){
        record = new MediaRecorder(stream)
        record.ondataavailable = (e) => {
          blobVideo = new Blob([e.data],{type: e.data.type});
          blobUrl = window.URL.createObjectURL(blobVideo);
          this.setState({blobUrl})
        }
        record.start();
        recorder.push(record)
        this.setState({recorder})
      }else{
        recorder[i].start();
      }
    }
  }

  //button →　録画開始
  startRecording = () => {
    const loopCount = this.state.remoteStreams.length
    if(this.state.localStream){
      this.recorderScreen(this.state.localStream,0)
    }
    for(let i=0;i < loopCount; i++){
      console.log(i);
      if(this.state.remoteStreams[i].stream !== null){
        this.recorderScreen(this.state.remoteStreams[i].stream,i+1)
      }
    }
    this.setState({videoFlag: true})
  }
  

  //button →　録画終了
  stopRecording = async () => {
    this.state.recorder[0].stop();
    this.setState({blobUrl: null})
    await this.setState({videoFlag: false})
    this.drawVideo();
  }

  //canvas →　描画
  drawVideo = async () => {
    const canvasBroadcast = await this.canvasRender()
    this.pc.addTrack(canvasBroadcast.getVideoTracks()[0],canvasBroadcast)
    const sdp = await this.pc.createOffer(this.state.sdpConstraints)
    this.pc.setLocalDescription(sdp)
    this.sendToPeer('offerDisplay',sdp,{
      local: this.socket.id,
    })
  }

  canvasRender = () => {
    let video = document.getElementById("mov")
    let canvas = document.getElementById("draw");
    canvas.getContext("2d").drawImage(video,0,0,1016,640);
    const stream = canvas.captureStream(60);
    if (this.state.videoFlag === false){
      requestAnimationFrame(this.canvasRender);
    }
    return stream
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
        let remoteStreams = this.state.remoteStreams; 
        let remoteVideo = {};

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
   
    //ブラウザバック時の処理
    window.onpopstate = () => {
      this.state.localStream.getTracks().forEach(track => {
        track.stop();
      })
    }

    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

    //接続切れた時
    this.socket.on('peer-disconnect',data => {
      const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID)
      this.setState({remoteStreams})
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
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })

    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      const pc = this.state.peerConnections[data.socketID];
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    this.socket.on('answer-display',data => {
      const pc = this.state.peerConnections[data.socketID]
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
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
          <button
            onClick={this.startRecording}
            style={{
              backgroundColor: 'white',
            }}
          >{'初期録画'}</button>
          <button
            onClick={this.state.videoFlag ? this.stopRecording : this.startRecording}
            style={{
              backgroundColor: 'white',
            }}
          >{this.state.videoFlag ? '録画':'録画停止'}</button>
          <div 
            style={{
              display: 'flex',
              flexDirection: Direction,
              flexWrap: 'wrap',
            }}
          >
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                marign: 20,
                backgroundColor: 'black'
              }}
              videoStream={this.state.localStream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                marign: 20,
                backgroundColor: 'black'
              }}
              videoStream={this.state.remoteStreams[0] && this.state.remoteStreams[0].stream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                marign: 20,
                backgroundColor: 'black'
              }}
              videoStream={this.state.remoteStreams[1] && this.state.remoteStreams[1].stream}
            />
            <Video
              videoStyles={{
                width: widthSize,
                height: heightSize,
                marign: 20,
                backgroundColor: 'black'
              }}
              videoStream={this.state.remoteStreams[2] && this.state.remoteStreams[2].stream}
            />
          </div>
            <video
              src={this.state.blobUrl}
              id="mov"
              controls
              width="1016"
              height="640"
              crossOrigin="anonymous"
              style={{
                position: 'absolute',
                marign: '5%',
                visibility: hiddenCanvas,
                right: 10,
                top: 10,
                bottom: 10,
                backgroundColor: 'black'
              }}
            />
            <canvas
              hidden
              id="draw"
              width="1016"
              height="640"
            />
        </div>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainer;