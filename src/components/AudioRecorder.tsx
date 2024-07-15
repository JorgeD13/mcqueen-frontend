// components/AudioRecorder.js
import React, { useState, useRef } from 'react';

const AudioRecorder = ({
  transcript,
  setTranscript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.start();
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

      // Convert audio to text using Web Speech API
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
      };

      recognition.onend = () => {
        console.log('Speech recognition service disconnected');
      };

      // Play the audio to feed it to the recognition API
      audio.play();
      recognition.start();
    };
  };

  return (
    <div className="border-2 border-gray-700 p-2 rounded-md bg-gray-300">
      <button onClick={isRecording ? handleStopRecording : handleStartRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {transcript && <p>Transcript: {transcript}</p>}
    </div>
  );
};

export default AudioRecorder;
