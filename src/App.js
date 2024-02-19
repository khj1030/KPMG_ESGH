import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { FileProvider } from './FileContext.js';
import Meeting from './Meeting.js';
import ShowFileList from './FlieList.js';

function App() {
  return (
    <FileProvider>
      <Router>
        <Route path="/" exact component={Meeting} />
        <Route path="/fileList" component={ShowFileList} />
      </Router>
    </FileProvider>
  );
}

export default App;
