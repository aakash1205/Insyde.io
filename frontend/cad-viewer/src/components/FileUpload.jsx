import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file first.');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            await axios.post('/api/upload', formData);
            onFileUpload(file.name);
            setMessage('✅ File uploaded successfully!');
        } catch (error) {
            setMessage('❌ Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <label htmlFor="fileUpload" className="upload-label">
                {file ? `Selected: ${file.name}` : 'Drag & Drop or Click to Upload STL'}
            </label>
            <input 
                type="file" 
                id="fileUpload" 
                className="upload-input" 
                accept=".stl" 
                onChange={handleFileChange} 
            />
            <button className="upload-button" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {message && <p className="upload-message">{message}</p>}
        </div>
    );
};

export default FileUpload;
