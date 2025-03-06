import React, { useState } from 'react'

import './App.css'
import FileUpload from './components/FileUpload'
import ModelViewer from './components/ModelViewer'

const App = () => {
  const [modelUrl, setModelUrl] = useState('')

  const handleFileUpload = (fileName) => {
    setModelUrl(`/api/models/${fileName}`)
  }

  return (
    <div>
      <h1>3D CAD Viewer</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <ModelViewer modelUrl={modelUrl} />
    </div>
  )
}

export default App
