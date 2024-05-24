import React, { useState, useRef, useEffect } from 'react';
import SimplePeer from 'simple-peer';

const VideoCall = () => {
    const [peer, setPeer] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenStreamRef = useRef(null);

    useEffect(() => {
        const now = new Date();
        const currentHour = now.getHours();
        setIsCallActive(currentHour >= 18 || currentHour < 24);
    }, []);

    const startCall = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play();

                const newPeer = new SimplePeer({
                    initiator: true,
                    trickle: false,
                    stream: stream,
                });

                newPeer.on('signal', data => {
                    // Send the signaling data to the joiner
                    alert('Share this signaling data with the person you want to join the call: ' + JSON.stringify(data));
                });

                newPeer.on('stream', remoteStream => {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                });

                setPeer(newPeer);
            })
            .catch(error => console.error('Error accessing media devices.', error));
    };

    const joinCall = (signalData) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play();

                const newPeer = new SimplePeer({
                    initiator: false,
                    trickle: false,
                    stream: stream,
                });

                newPeer.on('signal', data => {
                    // Send the signaling data back to the initiator
                    alert('Share this signaling data with the person who initiated the call: ' + JSON.stringify(data));
                });

                newPeer.on('stream', remoteStream => {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                });

                newPeer.signal(signalData);
                setPeer(newPeer);
            })
            .catch(error => console.error('Error accessing media devices.', error));
    };

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(screenStream => {
                screenStreamRef.current = screenStream;
                setIsScreenSharing(true);

                const newPeer = peer || new SimplePeer({ trickle: false });
                newPeer.replaceTrack(
                    newPeer.streams[0].getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    peer.streams[0]
                );
                setPeer(newPeer);
            })
            .catch(error => console.error('Error accessing display media.', error));
    };

    const stopScreenSharing = () => {
        setIsScreenSharing(false);
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        const newPeer = peer || new SimplePeer({ trickle: false });
        newPeer.replaceTrack(
            newPeer.streams[0].getVideoTracks()[0],
            localVideoRef.current.srcObject.getVideoTracks()[0],
            peer.streams[0]
        );
        setPeer(newPeer);
    };

    return (
        <div>
            {isCallActive ? (
                <div>
                    <video ref={localVideoRef} muted />
                    <video ref={remoteVideoRef} />
                    <button onClick={startCall}>Start Call</button>
                    <button onClick={() => joinCall(JSON.parse(prompt('Enter signaling data')))}>Join Call</button>
                    {isScreenSharing ? (
                        <button onClick={stopScreenSharing}>Stop Sharing</button>
                    ) : (
                        <button onClick={shareScreen}>Share Screen</button>
                    )}
                </div>
            ) : (
                <p>Video calls are available only between 6 PM and 12 AM.</p>
            )}
        </div>
    );
};

export default VideoCall;
