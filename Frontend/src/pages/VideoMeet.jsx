import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";

import styles from "../styles/videoComponent.module.css";
import { Badge, Button, IconButton, TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';

const server_url = "http://localhost:8080";

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

// Video component for remote streams
const Video = ({ stream }) => {
    const ref = useRef();

    useEffect(() => {
        if (stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div>
            <video ref={ref} autoPlay playsInline />
        </div>
    );
};


export const VideoMeet = () => {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef(null);
    const connections = useRef({}); // FIX: Use a ref for connections object

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(true); // Default to on
    const [audio, setAudio] = useState(true); // Default to on
    const [screen, setScreen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");

    const [videos, setVideos] = useState([]); // State for remote video streams

    useEffect(() => {
        const getInitialPermissions = async () => {
            try {
                // Check for camera
                await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoAvailable(true);
            } catch (e) {
                setVideoAvailable(false);
            }

            try {
                // Check for microphone
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setAudioAvailable(true);
            } catch (e) {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

          try{
             if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
          }catch(error){
             console.log(error);
          }
        }

        getInitialPermissions();
    }, []);


    const getMedia = async (isScreenSharing = false) => {
        try {
            let stream;
            if (isScreenSharing) {
                stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                // Handle when user clicks the "Stop sharing" button in the browser UI
                stream.getTracks().forEach(track => track.onended = () => {
                    setScreen(false);
                    // Revert to camera
                    setVideo(true);
                });
            } else {
                stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: audio });
            }

            // Stop previous tracks
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }

            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Update all existing peer connections with the new stream
            for (const id in connections.current) {
                const peer = connections.current[id];
                // Remove old tracks
                peer.getSenders().forEach(sender => {
                    peer.removeTrack(sender);
                });

                // Add new tracks
                // FIX: Use addTrack instead of addStream
                for (const track of stream.getTracks()) {
                    peer.addTrack(track, stream);
                }

                // Create a new offer to notify the peer of the stream change
                peer.createOffer()
                    .then(description => peer.setLocalDescription(description))
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': peer.localDescription }));
                    })
                    .catch(e => console.error(e));
            }

        } catch (error) {
            console.error("Error getting media stream:", error);
            // If user denies permission, create a silent/black stream
            const silentStream = createSilentBlackStream();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = silentStream;
            }
            window.localStream = silentStream;
        }
    };

    // This effect handles toggling video/audio/screen sharing
    useEffect(() => {
        if (!askForUsername) { 
            getMedia(screen);
        }
    }, [video, audio, screen, askForUsername]);


    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((prev) => prev.filter((video) => video.socketId !== id));
                if (connections.current[id]) {
                    connections.current[id].close();
                    delete connections.current[id];
                }
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return; // Don't connect to self

                    connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections.current[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };
                    
                    connections.current[socketListId].ontrack = (event) => {
                        // event.streams[0] contains the remote stream
                        setVideos(prev => {
                            // Filter out the old video stream for this user if it exists
                            const otherVideos = prev.filter(video => video.socketId !== socketListId);
                            // Add the new/updated video stream
                            return [...otherVideos, { socketId: socketListId, stream: event.streams[0] }];
                        });
                    };

                    // Add the local stream to the new connection
                    if (window.localStream) {
                        // FIX: Use addTrack for each track in the stream
                        window.localStream.getTracks().forEach(track => {
                            connections.current[socketListId].addTrack(track, window.localStream);
                        });
                    }
                });

                // If this is our "user-joined" event, we initiate the offer to all other clients
                if (id === socketIdRef.current) {
                    for (let id2 in connections.current) {
                        if (id2 === socketIdRef.current) continue;

                        // FIX: Corrected typo from creatOffer to createOffer
                        connections.current[id2].createOffer().then((description) => {
                            connections.current[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }));
                                })
                                .catch(e => console.error(e));
                        });
                    }
                }
            });
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);
        const peer = connections.current[fromId];

        if (peer) {
            if (signal.sdp) {
                peer.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        peer.createAnswer().then((description) => {
                            peer.setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': peer.localDescription }));
                            }).catch(e => console.error(e));
                        }).catch(e => console.error(e));
                    }
                }).catch(e => console.error(e));
            }

            if (signal.ice) {
                peer.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error(e));
            }
        }
    };


    const createSilentBlackStream = () => {
        const silence = () => {
            let ctx = new AudioContext();
            let oscillator = ctx.createOscillator();
            let dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            ctx.resume();
            return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
        };

        const black = ({ width = 640, height = 480 } = {}) => {
            let canvas = Object.assign(document.createElement("canvas"), { width, height });
            canvas.getContext('2d').fillRect(0, 0, width, height);
            let stream = canvas.captureStream();
            return Object.assign(stream.getVideoTracks()[0], { enabled: false });
        };

        return new MediaStream([black(), silence()]);
    };


    const connect = () => {
        if (username.trim()) {
            setAskForUsername(false);
            connectToSocketServer();
        }
    };
    
    // Handlers
    const handleVideo = () => setVideo(!video);
    const handleAudio = () => setAudio(!audio);
    const handleScreen = () => setScreen(!screen);
    const handleChat = () => {
        setShowModal(!showModal);
        setNewMessages(0); // Reset new messages count when chat is opened
    };
    const handleEndCall = () => {
        try {
            if (localVideoRef.current.srcObject) {
                localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            socketRef.current.disconnect();
        } catch (e) {
            console.error(e);
        }
        window.location.href = "/home"; // Or your home page
    };
    const sendMessage = () => {
        if(message.trim()){
            socketRef.current.emit("chat-message", message, username);
            // addMessage(message, "You", socketIdRef.current); // Add own message locally
            setMessage("");
        }
    };
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prev) => [...prev, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };
  let navigate = useNavigate();


    return (
        <>
            <nav className={styles.navbar}>
            <div style={{ display: "flex", alignItems: "center" ,justifyContent:"space-between" }}>
              <h2>WAVVY</h2>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
             <Button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/auth");
                }}
              >
                Logout
              </Button> 
            </div>
            </nav>




            {askForUsername ? (
                <div className={styles.previewContainer}>
                   <div className={styles.leftPreviewComponent}>
                     <h2 className={styles.previewHeader}>Just a way to Connect...</h2>
                    <TextField id="outlined-basic" label="Username" placeholder='Ex : Kartik' value={username} onChange={e => setUsername(e.target.value)} variant="outlined"  />
                    <Button variant="contained" onClick={connect} disabled={!username.trim()}>Connect</Button>
                   </div>


                    {/* Pre-call video preview */}
                    <div className={styles.RightPreviewComponent}>
                        <video ref={localVideoRef} autoPlay muted playsInline></video>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoConatiner}>
                    {showModal && (
                          <div className={styles.chatRoom}>
                            <h2 className="chatTitle">Chat Room</h2>

                            <div className={styles.chatDisplay}>
                                {messages.map((item, index) => (
                                    <div key={index} className={styles.messageBlock}>
                                        <p className={styles.messageSender}>{item.sender}</p>
                                        <p className={styles.messageData}>{item.data}</p>
                                    </div>
                                ))}
                            </div>
                              
                            <div className={styles.chatInputArea}>
                                <input
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder='Enter your Chat...'
                                    className={styles.chatTextField}  
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                                />
                                <button onClick={sendMessage} className={styles.chatTextField}>
                                    SEND
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonContainers}>


                        <IconButton onClick={handleVideo} style={{ color: 'white' }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{ color: 'white' }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>


                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: 'white' }}>
                               {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        )}


                        <IconButton onClick={handleEndCall} style={{ color: 'red' }}>
                            <CallEndIcon />
                        </IconButton>


                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={handleChat} style={{ color: 'white' }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>


                    </div>

                    {/* Local Video */}
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline></video>
                    
                    {/* Remote Videos */}
                    <div className={styles.conferenceView}>
                       {videos.map(video => (
                           <Video key={video.socketId} stream={video.stream} />
                       ))}
                    </div>
                </div>
            )}
        </>
    );
};