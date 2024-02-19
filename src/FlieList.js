import './FileList.css';
import home from './img/home.svg';
import robot from './img/robot.svg';
import close from './img/close.svg';
import left_arrow from './img/left-arrow.svg';
import React, { useContext } from 'react';
import { FileContext } from './FileContext';
import { Link } from 'react-router-dom';

function Navbar() {   // 홈으로 가는 버튼
    return (
        <nav className='Navbar' style={{ position: 'absolute', top: '30px', left: '40px' }}>
            <button style={{ backgroundColor: '#282c34', border: 'none' }}>
                <img src={home} className="Home" alt="Home" />
            </button>
            <Link to="/">
                <button style={{ marginLeft: '30px', backgroundColor: '#282c34', border: 'none' }}>
                    <img src={left_arrow} className="Back" alt="Back" />
                </button>
            </Link>
        </nav>
    );
}

function Header() {   // 상단 부분
    return (
        <header className='Header'>
            <img src={robot} className="Robot" alt="Robot" />
            <p className="header_msg">
                현재 저에게 학습되어 있는<br />
                파일 목록이에요!<br />
            </p>
        </header>
    );
}

function Files() {
    const { files, setFiles, filesContent, setFilesContent} = useContext(FileContext);

    const handleRemoveFile = (index) => {
        // 파일 이름 목록 제거
        const newFileList = [...files];
        newFileList.splice(index, 1);
        setFiles(newFileList);
        // 파일 내용 목록 제거
        const newFileListContent = [...filesContent];
        newFileListContent.splice(index, 1);
        setFilesContent(newFileListContent);
    }

    return (
        <div className='fileList-container'>
            {files.length === 0 && (
                <p className="preview_msg">파일이 없어요... 올려주세요!</p>
            )}
            {files.length > 0 && (
                <ul>
                    {files.map((file, index) => (
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
            )}
        </div>
    );
}

function ShowFileList() {
    return (
        <div className="showFileList">
            <Navbar />
            <Header />
            <Files />
        </div>
    );
}

export default ShowFileList;

