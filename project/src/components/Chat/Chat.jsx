import React,{ useState, useEffect, useRef } from 'react';

const Chat = (props) => {
  const [message, setMessage] = useState('')
  const [user, setUser] = useState({ uid: 0, })

  const scrollToBottom = () => {
    const chat = document.getElementById("chatList");
    chat.scrollTop = chat.scrollHeight
  }

  const sendMessage = (msg) => {
    props.sendMessage(msg);
    scrollToBottom()
  }

  const handleSubmit = event => {
    if (message === '') return
    event.preventDefault();
    sendMessage({type:'text', message: { id: user.uid, sender: { uid: user.uid, }, data: { text: message } }})
    setMessage('')
  };

  const handleChange = event => {
    setMessage(event.target.value)
  }

  const renderMessage = (data) => {
    const message = data.message;
    const msgDiv = (
      <div>
        <p>{props.user.uid}</p>
        {message.data.text}
      </div>
    )
    return (<li>{ msgDiv }</li>)
  }

  return(
    <div style={{
      position:'absolute',
      zIndex:103,
      right: 0,
      marginTop: 200,
      backgroundColor: 'white'
    }}>
      <div style={{
        width: 200,
        height: 200,
        overflow: 'scroll',     
      }}>
        <ul className="chat" id="chatList">
          {props.messages.map(data => (
            <div key={data.id}>
              {renderMessage(data)}
            </div>
          ))}
        </ul>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            className="textarea input"
            type="text"
            placeholder="Enter your message..."
            onChange={handleChange}
            value={message}
          />
        </form>
      </div>
    </div>
  )
}

export default Chat;