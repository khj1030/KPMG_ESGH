import robot from './img/robot.svg';
import copy from './img/copy.svg';
import flowbot from './img/flowbot.svg';
import cloudUpload from './img/cloud-computing.svg';
import home from './img/home.svg';
import close from './img/close.svg';
import bot from './img/bot.svg';
import user from './img/user.svg';
import './App.css';
import { ArrowUpward } from '@mui/icons-material';
import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';

function Navbar() {   // 홈으로 가는 버튼
  return (
    <nav className='Navbar' style={{ position: 'absolute', top: '30px', left: '40px' }}>
      <button style={{ backgroundColor: '#282c34', border: 'none' }}>
        <img src={home} className="Home" alt="Home" />
      </button>
    </nav>
  );
}

function Header() {   // 상단 부분
  return (
    <header className='Header'>
      <img src={robot} className="Robot" alt="Robot" />
      <p className="header_msg">
        저에게 학습시킬 회의록이나 자료를 업로드해주세요.<br />
        바로 질문하실 경우 제가 사전에 학습한 선에서 알려드릴게요!<br />
      </p>
    </header>
  );
}

function FileUpload() {   // 파일 업로드
  const [isActive, setActive] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleDragStart = () => setActive(true);
  const handleDragEnd = () => setActive(false);
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setActive(false);

    // 파일 핸들링
    const file = event.dataTransfer.files[0];
    setFileList([...fileList, file]);
  };

  const handleUpload = ({ target }) => {
    const file = target.files[0];
    setFileList([...fileList, file]);
  };

  const handleRemoveFile = (index) => {
    const newFileList = [...fileList];
    newFileList.splice(index, 1);
    setFileList(newFileList);
  }

  return (
    <div className='preview'>
      {fileList.length === 0 && (
        <label
          className={`fileUpload ${isActive ? ' active' : ''}`}
          onDragEnter={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        >
          <input type="file" className="file" onChange={handleUpload} />
          <>
            <img src={cloudUpload} className="Cloud" alt="Cloud" />
            <p className="preview_msg">여기로 파일을 끌어와 주세요</p>
            <p className="preview_or">또는</p>
            <p className="preview_desc">파일 업로드</p>
          </>
        </label>
      )}
      {fileList.length > 0 && (
        <>
          <ul>
            {fileList.map((file, index) => (
              <li key={index}>
                <span style={{ marginRight: 'auto', fontSize: '18px' }}>{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  style={{ border: 'none', backgroundColor: '#494A53' }}
                >
                  <img src={close} className='Close' alt='close' />
                </button>
              </li>
            ))}
          </ul>
          {fileList.length < 6 && (
            <label
              className='preview-upload'
              onDragEnter={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            >
              <input type="file" className="file" onChange={handleUpload} />
              <img src={cloudUpload} style={{ marginTop: 'auto' }} className="Cloud" alt="Cloud" />
              <p className="preview_desc">파일 업로드</p>
            </label>
          )}
        </>
      )}
    </div>
  );
}

function ChatBot({inputText}) {   // 챗봇
  // const [botMessages, setBotMessages] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: inputText,
    };

    console.log("전송된 메세지:", inputText);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    handleSendMessage();
  }, [inputText]);

  return (
    <div className="chatbot-window">
      {messages.map((message) => (
        <div key={message.id} className={message.sender === 'user' ? 'user-message' : 'bot-message'}>
          {message.sender === 'user' ? (
            <React.Fragment>
              <img src={user} alt="User" className="user-image" />
              <div className="chatbot-message-content">{message.text}</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <img src={bot} alt="Bot" className="bot-image" />
              <div className="chatbot-message-content">{message.text}</div>
            </React.Fragment>
          )}
        </div>
      ))}
    </div>
  );
}

function InputText({ onButtonClick }) {    // 입력창
  const [inputText, setInputText] = useState('');

  const onChange = (e) => {
    setInputText(e.target.value);
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    setInputText('');
  };

  return (
    <div style={{ height: '50px', marginBottom: '80px', width: '130vh' }}>
      <Box display='flex' alignItems='center' style={{ height: '100%' }}>
        <div style={{ flex: '10vh' }} />
        <input 
          type='text' 
          placeholder='질문을 입력해주세요.' 
          className='input-text' 
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <button className='input-button' type='submit' onClick={handleSendMessage}>
          <ArrowUpward />
        </button>
        <button className='copy-button' onClick={onButtonClick}>
          <img src={copy} className="Copy" alt="Copy" width='70%' height='70%' />
        </button>
        <FlowChat />
      </Box>
    </div>
  );
}

function FlowChat() { // flowchat button
  const [flowChat, setFlowChat] = useState(false);
  const [botMessages, setBotMessages] = useState('');
  const [messages, setMessages] = useState([]);
  const [industryValue, setIndustryValue] = useState(null);
  const [industryInputValue, setIndustryInputValue] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const handleClick = () => {
    if (flowChat) {
      setFlowChat(false);
      setMessages([]);
    } else {
      const firstMessage = `안녕하세요.
      해석이 어려우신 문장이나 용어를 고객사 산업군과 함께 알려주시면
      제가 알기 쉽게 풀어드릴게요!`;
      setBotMessages(firstMessage);

      const newMessage = {
        id: Date.now(),
        sender: "bot",
        text: botMessages,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setFlowChat(true);
    }
  };

  const handleIndustryChange = (e) => {
    setIndustryValue(e.target.value);
  };
  const handleIndustryInputChange = (e) => {
    setIndustryInputValue(e.target.value);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const inputText = `${(industryValue === '' ? industryInputValue : industryValue)}\n${inputValue}`;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: inputText,
    };

    console.log('선택된 산업군:', newMessage.industry);
    console.log('전송된 메시지:', newMessage.text);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className='button-container'>
      <button className="flowbot-button" onClick={handleClick}>
        <img src={flowbot} className="Flowbot" alt="Flowbot" width='100%' height='100%' />
      </button>
      {!flowChat && (
        <>
          <div className="triangle"></div>
          <div className="speech-bubble">해석이 어려운 용어가 있나요?</div>
        </>
      )}

      {flowChat && (
        <>
          <div className="chat-triangle"></div>
          <div className="chat-window">
            <div className="window-title">FlowBot</div>
            <div className="window-message" height="700px">
              {messages.map((message) => (
                <div key={message.id} className={message.sender === 'user' ? 'user-message' : 'bot-message'}>
                  {message.sender === 'user' ? (
                    <React.Fragment>
                      <img src={user} alt="User" className="user-image" />
                      <div className="message-content">{message.text}</div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <img src={bot} alt="Bot" className="bot-image" />
                      <div className="message-content">{message.text}</div>
                    </React.Fragment>
                  )}
                </div>
              ))}
            </div>
            <form className="window-input" onSubmit={handleSendMessage}>
              <div> {/* 산업 선택 */}
                <select value={industryValue} onChange={handleIndustryChange} className='industry-select'>
                  <option value="">산업군을 선택해주세요.</option>
                  <option value="IT">IT</option>
                  <option value="건축">건축</option>
                  <option value="반도체">반도체</option>
                  <option value="경영">경영</option>
                </select>
                <input
                  type="text"
                  value={industryInputValue}
                  onChange={handleIndustryInputChange}
                  placeholder='직접 입력하기'
                  className='industry-input'
                />
              </div>
              <div className='window-input-container'>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className='window-input-text'
                  placeholder='용어나 문장을 입력해주세요.'
                />
                <button type="submit" className='window-input-button'>
                  <ArrowUpward />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [isChat, setIsChat] = useState(false);

  const handleChange = () => {
    setIsChat(!isChat);
  }

  return (
    <div className="App">
      <Navbar />
      <div className='content-wrapper'>
        {isChat ? (
          <ChatBot />
        ) : (
          <>
            <Header />
            <FileUpload />
          </>
        )}
      </div>
      <InputText onButtonClick={handleChange} />
    </div>
  );
}

export default App;
