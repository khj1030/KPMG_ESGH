import React, { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [filesContent, setFilesContent] = useState([]);

  return (
    <FileContext.Provider value={{ files, setFiles, filesContent, setFilesContent }}>
      {children}
    </FileContext.Provider>
  );
};
