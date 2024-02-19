import robot from './img/robot.svg';
import copy from './img/copy.svg';
import flowbot from './img/flowbot.svg';
import cloudUpload from './img/cloud-computing.svg';
import home from './img/home.svg';
import close from './img/close.svg';
import bot from './img/bot.svg';
import user from './img/user.svg';
import './Meeting.css';
import { ArrowUpward, Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import React, { useState, useContext } from 'react';
import { FileContext } from './FileContext';
import { OpenAIClient } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';
import { Link } from 'react-router-dom';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
const endpoint = "https://kic-2024-openai.openai.azure.com/";
const azureApiKey = "f8ac1f51bb7b42e096cb1d08a9e1666e";
const deploymentId = "51e134d9-5b8c-44dd-be2e-9b15ee4b1f39";

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

function FileUpload(props) {   // 파일 업로드
  const [isActive, setActive] = useState(false);

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
    props.onUploadFile(file);
  };

  const handleUpload = ({ target }) => {
    const file = target.files[0];
    props.onUploadFile(file);
  };

  const handleRemoveFile = (index) => {
    // 파일 이름 목록 제거
    const newFileList = [...props.files];
    newFileList.splice(index, 1);
    props.onRemoveFile(newFileList);
    // 파일 내용 목록 제거
    const newFileContentList = [...props.filesContent];
    newFileContentList.splice(index, 1);
    props.onRemoveFileContent(newFileContentList);
  }

  return (
    <div className='preview'>
      {props.files.length === 0 && (
        <label
          className={`fileUpload ${isActive ? ' active' : ''}`}
          onDragEnter={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        >
          <input type="file" className="file" onChange={handleUpload} />
          <div>
            <img src={cloudUpload} className="Cloud" alt="Cloud" />
            <p className="preview_msg">여기로 파일을 끌어와 주세요</p>
            <p className="preview_or">또는</p>
            <p className="preview_desc">파일 업로드</p>
          </div>
        </label>
      )}
      {props.files.length > 0 && (
        <>
          <ul>
            {props.files.map((file, index) => (
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
          {props.files.length < 6 && (
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

function ChatBot(props) {   // 챗봇
  return (
    <div className="chatbot-window">
      {props.messages.map((message) => (
        <div key={message.id} className={message.sender === 'user' ? 'chatbot-user-message' : 'chatbot-bot-message'}>
          {message.sender === 'user' ? (
            <React.Fragment>
              <div>
                <div className='chatbot-profile'>
                  <img src={user} alt="User" className="chatbot-image" />
                  <div className='chatbot-profile-user'>You</div>
                </div>
                <div className="chatbot-message">{message.text}</div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div>
                <div className='chatbot-profile'>
                  <img src={bot} alt="Bot" className="chatbot-image" />
                  <div className='chatbot-profile-bot'>Our Service</div>
                </div>
                <div className="chatbot-message">{message.text}</div>
              </div>
            </React.Fragment>
          )}
        </div>
      ))}
    </div>
  );
}

function InputText(props) {    // 입력창
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    const newMessage = {
      sender: "user",
      text: inputText,
    }

    props.onSendMessage(newMessage);
    setInputText('');

    const meetingMinutes = props.files.map(file => file[0].content).join("");

    const messages = [        // 요약본에서 물어보는 프롬프트
      {
        "role": "system",
        "content": "안녕하세요. 이 서비스는 주어진 회의록의 제목, 중요한 사항들, 그리고 액션 아이템을 바탕으로 사용자의 질문에 답변합니다. 회의록에서 중요한 정보를 요약하여 제공하며, 사용자가 해당 회의록에 대해 가지고 있는 질문에 대해 구체적인 답변을 제공합니다. 회의록의 요약 정보를 먼저 입력해주세요."
      },
      {
        "role": "system",
        "content": `${meetingMinutes}`
      },
      {
        "role": "user",
        "content": `${inputText}`
      },
      {
        "role": "system",
        "content": "여기에는 사용자가 제공한 질문에 대한 답을 주어진 회의록을 바탕으로 성심성의껏 응답합니다."
      }
    ];

    console.log("== Post GPT API ==");
    console.log("요약본 모음 : ", meetingMinutes);
    console.log("물어본 내용 : ", inputText);

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const result = await client.getChatCompletions(deploymentId, messages);

    for (const choice of result.choices) {
      console.log(choice.message);
      const newMessage = {
        sender: "bot",
        text: choice.message.content,
      };

      props.onSendMessage(newMessage);
    }
  };

  const handleUpload = ({ target }) => {
    const file = target.files[0];
    props.onUploadFile(file);
  };

  return (
    <div style={{ height: '50px', marginBottom: '80px', width: '130vh' }}>
      <Box display='flex' alignItems='center' style={{ height: '100%' }}>
        <div style={{ flex: '10vh' }} />
        <input
          value={inputText}
          type='text'
          placeholder='질문을 입력해주세요.'
          className='input-text'
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <button className='input-button' type='submit' onClick={handleSendMessage}>
          <ArrowUpward />
        </button>
        <button className='add-button'>
          <label>
            <input type="file" className="file" onChange={handleUpload} />
            <Add />
          </label>
        </button>
        <button className='list-button'>
          <Link to='/fileList'>
            <img src={copy} className="List" alt="list" width='70%' height='70%' />
          </Link>
        </button>
        <FlowChat />
      </Box>
    </div>
  );
}

function FlowChat() { // flowchat button
  const [isFirst, setIsFirst] = useState(true);
  const [flowChat, setFlowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isWord, setIsWord] = useState('');
  const [industryValue, setIndustryValue] = useState('');
  const [industryInputValue, setIndustryInputValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleClick = () => {
    if (flowChat) {
      setFlowChat(false);
    } else if (isFirst){
      const firstMessage = `안녕하세요.
      해석이 어려우신 문장이나 용어를 고객사 산업군과 함께 알려주시면
      제가 알기 쉽게 풀어드릴게요!`;

      const newMessage = {
        id: Date.now(),
        sender: "bot",
        text: firstMessage,
      };

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];
        setFlowChat(true);
        return updatedMessages;
      });
      setIsFirst(false);
    } else {
      setFlowChat(true);
    }
  };

  const handleIsWordChange = (e) => {
    setIsWord(e.target.value);
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const inputText = `${(industryValue === '' ? industryInputValue : industryValue)}
    ${inputValue}`;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      industry: industryValue === '' ? industryInputValue : industryValue,
      content: inputValue,
      text: inputText,
    };

    console.log('선택된 산업군:', newMessage.industry);
    console.log('전송된 메시지:', newMessage.content);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    const messages = generateMessage(isWord, newMessage.industry, newMessage.content);                    // 프롬프트

    console.log("== Post GPT API ==");
    console.log('보낸 메세지',messages);

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const result = await client.getChatCompletions(deploymentId, messages);

    for (const choice of result.choices) {
      console.log(choice.message);
      const newMessage = {
        id: Date.now(),
        sender: "bot",
        text: choice.message.content,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  function generateMessage( word, industry, content){
    let message;

    if(word === '단어'){
      message = [
        {
          "role": "system",
          "content": "안녕하세요. 해석이 어려운 문장이나 용어를 입력하시면, 저희 챗봇이 알기 쉽게 풀어서 설명드립니다. 단어를 입력하실 경우 단어를 풀어서 설명드립니다. 특정 산업군에 관련된 용어나 문장을 입력하시면 더 정확한 답변을 드릴 수 있습니다. 시작해주세요!"
        },
        {
          "role": "user",
          "content": `${content}`
        },
        {
          "role": "system",
          "content": "여기에 사용자가 입력할 내용에 대한 예상 반응을 적어주세요. 예를 들어, '블록체인'이라는 단어에 대한 최대 1~2줄의 짧고 간결한 설명(블록체인: 블록체인은 분산 데이터 저장 기술로, 각 블록에 데이터를 기록하고 체인처럼 연결하여 데이터의 안전성과 무결성을 보장합니다. 주로 금융, 계약 등 다양한 분야에서 활용됩니다.)을 제공합니다."
        }
      ];
    }else{
      switch (industry) {
        case "소프트웨어":
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 여기서는 일반적으로 표현된 문장을 소프트웨어 직군에서 사용하는 전문 용어와 개념을 활용하여 재표현합니다. 사용자가 제공한 일반 문장을 소프트웨어 개발 관련 용어로 변환하여, 동일한 의미를 갖되, 소프트웨어 직군의 전문적인 언어로 표현된 문장을 제공합니다. 변환을 원하는 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 입력한 일반 문장을 받아, 해당 문장을 소프트웨어 개발 직군에서 사용하는 전문 용어로 재구성한 문장을 출력합니다. 예시: 사용자가 '새 프로젝트의 가능성을 검증하고 있어서 지금 당장은 부탁을 들어줄 수 없어요'라고 입력했을 때, 시스템은 '현재 새 애플리케이션의 프로토타입을 PoC(Proof of Concept) 단계에서 검증 중이므로, 즉각적인 요청에 응답하기 어렵습니다'라고 응답합니다."
            }
          ];
          break;
        case "반도체":
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 이 서비스는 일반적인 문장을 반도체 직군의 전문가들이 사용하는 언어로 변환해 드립니다. 반도체 분야의 전문 용어와 개념을 사용하여 같은 의미의 문장을 재구성하므로, 해당 분야의 전문 지식이 필요한 문장 변환을 원하시면 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 입력한 일반적인 문장을 받아, 반도체 분야의 전문 용어를 사용해 같은 의미를 전달하되 전문가들이 이해할 수 있는 방식으로 변환한 문장을 출력합니다. 예시: 사용자가 '이 기기의 성능이 매우 뛰어나다고 들었습니다'라고 입력했을 때, 시스템은 '이 장치의 처리량과 효율성이 업계 표준을 상회하는 것으로 평가됩니다'라고 응답합니다."
            }
          ];
          break;
        case "기계":
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 이 서비스는 주어진 문장을 기계공학 분야의 전문가들이 사용하는 언어로 변환해드립니다. 일반적인 표현을 기계공학적 용어로 재구성하여, 해당 분야의 전문가들이 이해하기 쉽도록 돕습니다. 변환을 원하는 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 입력한 일반적인 문장을 받아, 그 문장을 기계공학 분야의 전문 용어를 사용하여 변환한 문장을 출력합니다. 예를 들어, 사용자가 '자동차가 고장 났어요'라고 입력했을 때, 시스템은 '자동차의 구동 시스템에 기술적 결함이 발생했습니다'라고 응답할 수 있습니다."
            }
          ];
          break;
        case "전자":
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 이 서비스는 일반적인 문장을 전자공학 직군의 전문가들이 사용하는 언어로 변환해드립니다. 전자공학 관련 용어와 개념을 활용해 문장을 재구성하여, 해당 분야의 전문가들도 쉽게 이해할 수 있도록 도와드립니다. 전자공학 분야에 맞게 변환하고 싶은 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 입력한 일반적인 문장을 전자공학 분야의 전문 용어를 사용하여 재구성한 문장을 출력합니다. 예시: 사용자가 '스마트폰이 갑자기 꺼졌어요'라고 입력했을 때, 시스템은 '스마트폰의 전원 공급 시스템에 불안정성이 발생하여 자동 종료되었을 수 있습니다'라고 응답합니다."
            }
          ];
          break;
        case "비즈니스":
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 이 서비스는 일반적인 문장을 비즈니스, 경제, 경영 직군의 전문 용어를 사용하여 변환합니다. 사용자가 제공한 문장을 해당 직군의 언어로 재구성하여, 전문가 수준의 커뮤니케이션이 가능하도록 돕습니다. 변환을 원하는 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 제공한 일반적인 문장을 비즈니스, 경제, 경영 직군의 전문 용어를 사용하여 재구성한 문장을 출력합니다. 예를 들어, 사용자가 '우리 회사는 올해 매출이 증가했어요'라고 입력했을 때, 시스템은 '본 기업의 본기간 총수익은 전년 대비 상승세를 기록하였습니다'라고 응답할 수 있습니다."
            }
          ];
          break;
        default:
          message = [
            {
              "role": "system",
              "content": "안녕하세요. 여기서는 특정 직군의 전문적인 단어로 구성된 문장을 입력받으면, 그 문장 내의 어려운 단어들을 더 일반적이고 알아보기 쉬운 단어로 변환하여 제공합니다. 직접적인 설명 없이 단어 변환만을 수행합니다. 변환을 원하는 문장을 입력해주세요."
            },
            {
              "role": "user",
              "content": `${content}`
            },
            {
              "role": "system",
              "content": "여기에는 사용자가 입력한 전문적인 문장을 받아, 그 안의 전문 용어를 일반적인 용어로 변환한 문장을 출력합니다. 예시: 사용자가 '저희가 현재 PoC 중이라 부탁 못들어줘요'라고 입력했을 때, 시스템은 '저희가 현재 새 프로젝트가 실현 가능성이 있는지 검증하는 중이라 부탁 못들어줘요'라고 응답합니다."
            }
          ];
      }
    }

    return message;
  }

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
              <div> 
                <select value={isWord} onChange={handleIsWordChange} className='word-select'>
                  <option value="단어">용어 설명</option>
                  <option value="문장">문장 변환</option>
                </select>
                {/* 산업 선택 */}
                <select value={industryValue} onChange={handleIndustryChange} className='industry-select'>
                  <option value="">산업군</option>
                  <option value="소프트웨어">소프트웨어</option>
                  <option value="반도체">반도체</option>
                  <option value="기계">기계</option>
                  <option value="전자">전자</option>
                  <option value="비즈니스">비즈니스</option>
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

function Meeting() {
  const [isChat, setIsChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const { files, setFiles, filesContent, setFilesContent } = useContext(FileContext);

  const handleChange = () => {
    setIsChat(!isChat);
  }

  // 파일 목록 제거 (FileUpload)
  const handleRemoveFile = (fileList) => {
    setFiles(fileList);
  }

  // 파일 내용 목록 제거 (FileUpload)
  const handleRemoveFileContent = (fileList) => {
    setFilesContent(fileList);
  }

  // 메세지 입력 (InputText)
  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      sender: message.sender === "user" ? "user" : "bot",
      text: message.text,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsChat(true);
  };

  // 파일 업로드 (FileUpload, InputText)
  const handleUpload = (file) => {
    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const arrayBuffer = this.result;
        const pdf = await getDocument(arrayBuffer).promise;

        const textPromises = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const text = textContent.items.map(item => item.str).join(' ');

          console.log('페이지', i, '텍스트:', text);
          textPromises.push(text);
        }

        const texts = await Promise.all(textPromises);

        await processMessages(texts);
      };

      async function processMessages(texts) {
        const messages = [         // 회의록 요약 프롬프트
          {
            "role": "system",
            "content": "안녕하세요. 이 서비스는 제공된 회의록 텍스트를 분석하여, 회의의 제목, 중요한 사항들, 그리고 액션 아이템을 요약하여 제공합니다. 이를 통해 회의의 핵심 내용과 후속 조치 사항을 빠르게 파악할 수 있도록 돕습니다. 요약을 원하는 회의록 텍스트를 입력해주세요."
          },
          {
            "role": "user",
            "content": `${texts}`
          },
          {
            "role": "system",
            "content": "여기에는 사용자가 제공한 회의록 텍스트를 분석한 후, 회의의 제목, 중요한 사항들, 그리고 액션 아이템을 포함한 요약본을 출력합니다. 예를 들어, 회의록에 '2024년 제1분기 영업 전략 회의'라는 제목과 '신제품 출시 일정', '마케팅 전략 논의', '영업 목표 설정' 등의 중요 사항, 그리고 '신제품 출시 준비를 위한 프로젝트 팀 구성', '마케팅 팀에 의한 상세 전략 계획 제출' 등의 액션 아이템이 포함되어 있을 때, 이를 요약하여 제공할 수 있습니다."
          }
        ];

        const textPromises = [];
        console.log("== Post GPT API ==");
        console.log('보낸 메세지 : ',texts);

        try {
          const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
          const result = await client.getChatCompletions(deploymentId, messages);

          for (const choice of result.choices){
            console.log('받은 메세지 : ' ,choice.message);
            textPromises.push(choice.message);
          }

          const texts = await Promise.all(textPromises);

          setFiles(prevFiles => [...prevFiles, file]);
          setFilesContent((prevFilesContent) => [...prevFilesContent, texts]);
          console.log(texts);
        } catch (error) {
          console.error('Failed to call API', error);
        }
      };

      fileReader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="Meeting">
      <Navbar />
      <div className='content-wrapper'>
        {isChat ? (
          <ChatBot messages={messages} />
        ) : (
          <>
            <Header />
            <FileUpload files={files} filesContent={filesContent} onUploadFile={handleUpload} onRemoveFile={handleRemoveFile} onRemoveFileContent={handleRemoveFileContent}/>
          </>
        )}
      </div>
      <InputText files={filesContent} onButtonClick={handleChange} onSendMessage={handleSendMessage} onUploadFile={handleUpload}/>
    </div>
  );
}

export default Meeting;
