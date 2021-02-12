// import  React, { useCallback } from 'react';
// import io from 'socket.io-client';
// import '../assets/videoChat.css';
// import Video from '../components/Videoo/video';

// const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';

// class WebRTC_Trainer extends React.Component{
//   constructor(porps) {
//     super(porps);
//     this.state = {
//       localStream: null,
//       remoteStream: null,
//       remoteStream_head: null,
//     }
//     // this.localVideoRef = React.createRef();
//     // this.remoteVideoRef = React.createRef();
//     // this.remoteVideoRef_head = React.createRef();
//     this.socket = null;
//     this.peerConnections = {};
//     this.count = 0;
//     this.user = 'trainer';
//     this.pc_config = {
//       "iceServers": [
//         {
//           urls: 'stun:stun.l.google.com:19302'
//         }
//       ] 
//     }
//   }

//   getLocalStream = () => {
//     //getUserMedia成功時
//     const success = (stream) => {
//       window.localStream = stream
//       this.setState({
//         localStream: stream
//       })
//       this.whoisOnline()
//     }
    
//     //getUserMedia失敗時
//     const failure = (e) => { 
//       console.log('getUserMedia Error:', e)
//     }

//     //getUserMedia実行
//     const constrains = { video: true };
//     navigator.mediaDevices.getUserMedia(constrains)
//       .then(success)
//       .catch(failure);
//   }

//   //すでにOnline済みの人へsocketID送信
//   whoisOnline = () => {
//     this.sendToPeer('onlinePeers',null, 
//       {local: this.socket.id, user: this.user})
//   }

//   //WebSocket(Node.JS)サーバーに送信
//   sendToPeer = (messageType, payload, socketID) => {
//     this.socket.emit(messageType, {socketID,payload})
//   }

//   createPeerConnection = (socketID,callback) => {
//     try {  
//       let pc = new RTCPeerConnection(this.pc_config);
//       this.peerConnections = {...this.peerConnections, [socketID]: pc};
      
//       //自分のcandidateを取集後
//       pc.onicecandidate = (e) => {
//         if(e.candidate){
//           this.sendToPeer('candidate',e.candidate,{
//             local: this.socket.id,
//             remote: socketID
//           });
//         }
//       }
  
//       //ICEのステータスが変更になった時
//       pc.onconnectionstatechange = (e) => {
//         console.log(e);
//       }

//       //相手の映像/音声がSDP内に含まれていた場合
//       pc.onaddstream = (e) => {
//         if (this.count % 2 === 0){
//           this.setState({
//             remoteStream: e.stream
//           })
//         }else{
//           this.setState({
//             remoteStream_head: e.stream
//           })
//         }
//         this.count += 1; 
//       }

//       pc.ontrack = (e) => {
//         const remoteVideo = {
//           id: socketID,
//           name: socketID,
//           stream: e.stream[0]
//         }
//         this.setState(prevState => {
//           return {
//             selectedVideo: remoteVideo,
//             remoteStream: e.stream[0],
//             remoteStreams: {...prevState.remoteStreams, remoteVideo}
//           }
//         })
//       }

//       pc.addStream(this.state.localStream)
//       callback(pc)

//     } catch(e) {
//       callback(null);
//       console.log(e);
//       console.log("間違え")
//     }
//   }


//   componentDidMount(){
//     this.socket = io(ENDPOINT);
//     this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});
   
//     //接続完了
//     this.socket.on('connection-success', success => {
//       this.getLocalStream();
//     })

//     //すでにOnlineのユーザからのSocketIDを受け取り，Offerを送信する
//     this.socket.on('online-peer',socketID => {
//       this.createPeerConnection(socketID,pc => {
//         if(pc)
//           pc.createOffer({offerToReceiveVideo: 1})
//             .then(sdp => {
//               pc.setLocalDescription(sdp)
//               this.sendToPeer('offer',sdp,{
//                 local: this.socket.id,
//                 remote: socketID
//               })
//             })
//       })
//     })

//     //Offerを受け取り,Answerを送信する
//     this.socket.on('offer',data => {
//       this.createPeerConnection(data.socketID,pc => {
//         pc.addStream(this.state.localStream)

//         pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
//           pc.createAnswer({offerToReceiveVideo: 1})
//             .then(sdp => {
//               pc.setLocalDescription(sdp)
//               this.sendToPeer('answer', sdp, {
//                 local: this.socket.id,
//                 remote: data.socketID,
//                 user: this.user
//               })
//             })
//         })
//       })
//     })

//     //Answerを受け取り,SDPを保存する
//     this.socket.on('answer', data => {
//       const pc = this.peerConnections[data.socketID];
//       console.log(data.sdp);
//       pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
//     })


//     //経路情報を受け取る
//     this.socket.on('candidate', (data) => {
//       // this.candidates = [...this.candidates, candidate ];
//       const pc = this.peerConnections[data.socketID];
//       if(pc){
//         pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//       }
//     })

//     //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
//   }

//   render(){
//     console.log((this.state.l))

//     return(
//       <div className="stream">
//         <div className="webVideo">
//           <Video
//             videoStyles={{
//               zIndex: 2,
//               position: 'fixed',
//               right: 0,
//               width: 200,
//               height: 200,
//               margin: 5,
//               backgroundColor: 'black'
//             }}
//             // ref={this.localVideoRef} 
//             videoStream={this.state.localStream}
//           />
//           <Video 
//             videoStyles={{
//               zIndex:1,
//               position: 'fixed',
//               bottom: 0,
//               minWidth: '100%',
//               minHeight: '100%',
//               backgroundColor: 'black'
//             }}
//             videoStream={this.state.remoteStream}
//           />
//         </div>
//         <br />
//       </div>
//     )
//   }
// }

// export default WebRTC_Trainer;

import  React from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';
import Video from '../components/Videoo/video';
import Videos from '../components/Videoo/videos';

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
      }
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
      this.setState({
        peerConnections
      })
      
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
        const remoteVideo = {
          id: socketID,
          name: socketID,
          stream: e.streams[0]
        }
        this.setState(prevState => {
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }
          return {
            ...selectedVideo,
            ...remoteStream,
            remoteStreams: [...prevState.remoteStreams, remoteVideo]
          }
        })
      }

      pc.addStream(this.state.localStream)
      callback(pc)

    } catch(e) {
      callback(null);
      console.log(e);
      console.log("間違え")
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
        pc.addStream(this.state.localStream)

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

    this.socket.on('answer', data => {
      const pc = this.state.peerConnections[data.socketID];
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
          <Video
            videoStyles={{
              zIndex: 2,
              position: 'absolute',
              right: 0,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            // ref={this.localVideoRef} 
            videoStream={this.state.localStream}
          />
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
      </div>
    )
  }
}

export default WebRTC_Trainer;