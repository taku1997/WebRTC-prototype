import  React from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';
import Chat from '../components/Chat/Chat';
import Video from '../components/Videoo/video';
import Videos from '../components/Videoo/videos';

const ENDPOINT = 'http://localhost:8080'
// const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';

class WebRTC_Trainee extends React.Component{
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
          'OfferToReceiveVideo': true,
        }
      },
      messages: [],
      dataChannels: [],
    }

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

    const constrains = { video: true, audio: true };
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
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc }
      this.setState({peerConnections})
      
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
  
      pc.ontrack = (e) => {
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
          // const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }
          let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }
          return {
            ...selectedVideo,
            ...remoteStream,
            remoteStreams,
          }
        })
      }
      //修正箇所
      // pc.addTrack(this.state.localStream.getVideoTracks()[0],this.state.localStream)
      if(this.state.localStream){
        this.state.localStream.getTracks().forEach(track => {
          pc.addTrack(track,this.state.localStream)
        })
      }
      callback(pc)
    } catch(e) {
      callback(null);
      console.log(e);
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

    this.socket.on('peer-disconnect',data => {
      const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID)
      this.setState(prevState => {
        const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
        return {
          remoteStreams,
          ...selectedVideo,
        }
      })
    })

    this.socket.on('online-peer',socketID => {
      this.createPeerConnection(socketID,pc => {
        if(pc){

          //Chat機能
          const dataChannel = pc.createDataChannel('dataChannel')          
          
          const handleReceiveMessage = (event) => {
            const message = JSON.parse(event.data)
            console.log(message)
            this.setState(prevState => {
              return {
                messages: [...prevState.messages, message]
              }
            })
          }
  
          const receiveChannelCallback = (event) => {
            const receiveChannel = event.channel
            receiveChannel.onmessage = handleReceiveMessage
          }
  
          pc.ondatachannel = receiveChannelCallback;
  

          this.setState(prevState => {
            return {
              dataChannels: [...prevState.dataChannels, dataChannel]
            }
          })


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
        pc.addStream(this.state.localStream)
        // pc.addTrack(this.state.localStream.getVideoTracks()[0],this.state.localStream)

        const dataChannel = pc.createDataChannel('dataChannel')
       
        const handleReceiveMessage = (event) => {
          const message = JSON.parse(event.data)
          console.log(message)
          this.setState(prevState => {
            return {
              messages: [...prevState.messages, message]
            }
          })
        }

        const receiveChannelCallback = (event) => {
          const receiveChannel = event.channel
          receiveChannel.onmessage = handleReceiveMessage
        }

        pc.ondatachannel = receiveChannelCallback;


        this.setState(prevState => {
          return {
            dataChannels: [...prevState.dataChannels, dataChannel]
          }
        })
        
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
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })

    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      // this.candidates = [...this.candidates, candidate ];
      const pc = this.state.peerConnections[data.socketID];
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  }
  switchVideo = (_video) => {
    console.log(_video)
    this.setState({
      selectedVideo: _video
    })
  }

  render(){
    return(
      <div className="stream">
        <div className="webVideo">
          <div style={{
            zIndex:101,
            position: 'absolute',
            right: 0,
          }}>
            <Video
              videoStyles={{
                width: 200,
              }}
              frameStyle = {{
                width:200,
                marign: 5,
                borderRadius: 5,
                backgroundColor: 'black',
              }}
              showMuteControls={true} 
              videoStream={this.state.localStream}
            />
          </div>
          <Video 
            videoStyles={{
              zIndex:1,
              position: 'fixed',
              marignTop: 65,
              marign: 5,
              bottom: 0,
              minWidth: '100%',
              minHeight: '80%',
              backgroundColor: 'black'
            }}
            videoStream={this.state.selectedVideo && this.state.selectedVideo.stream} 
          />
        </div>
        <Videos
          switchVideo={this.switchVideo}
          remoteStreams={this.state.remoteStreams}
        ></Videos>
        <br />
        <Chat
          user={{uid: this.socket && this.socket.id || ''}}
          messages={this.state.messages}
          sendMessage={(message) => {
            this.setState(prevState => {
              return {messages: [...prevState.messages, message]}
            })
            this.state.dataChannels.map(sendChannel => {
              sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(message))
            })
          }}
        />
      </div>
    )
  }
}

export default WebRTC_Trainee;