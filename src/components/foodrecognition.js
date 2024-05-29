import React, { useState } from 'react';
import axios from 'axios';
import './foodrecognition.css';
import ThreeDBackground from './ThreeDBackground';

function FoodRecognition() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <ThreeDBackground />
      <div className="container">
        <h1>Food Recognition</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} className="upload-button">Upload</button>
        {previewSrc && (
          <img src={previewSrc} alt="Uploaded Preview" className="uploaded-image" />
        )}
        {prediction && (
          <div className="result">
            <h2>Prediction:</h2>
            <p>Food Item: {prediction.foodItem}</p>
            <p>Probability: {prediction.probability.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodRecognition;
