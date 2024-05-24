import React from 'react';
import './App.css';
import VideoCall from './components/VideoCall';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>VoIP Web App</h1>
            </header>
            <div className="video-container">
                <VideoCall />
            </div>
        </div>
    );
}

export default App;
