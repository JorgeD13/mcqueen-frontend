/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io('http://localhost:5000');  // Reemplaza con la URL de tu servidor Socket.IO

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [link, setLink] = useState('/mcqueen-image.png');

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.removeEventListener('loadedmetadata', handleVideoLoaded);
    }
  };

  const handleClick = () => {
    // Emitir evento al servidor para generar el video
    socket.emit('generate_video')

    // Cambiar el enlace para mostrar el video en la interfaz
    // setLink('/mcqueen-video.mp4');
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server')
    });

    socket.on('message', (data) => {
      console.log(data)
      console.log(data)
    });

    return () => {
      socket.off('connect')
      socket.off('message')
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && link === '/mcqueen-video.mp4') {
      videoRef.current.addEventListener('loadedmetadata', handleVideoLoaded);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleVideoLoaded);
      }
    };
  }, [link]);

  useEffect(() => {
    // Restablecer el enlace después de que la duración del video haya pasado
    if (link === '/mcqueen-video.mp4' && duration > 0) {
      setTimeout(() => {
        setLink('/mcqueen-image.png');
      }, duration * 1000); // Multiplicar por 1000 para convertir duración a milisegundos
    }
  }, [duration, link]);

  return (
    <div className="relative min-h-dvh w-full h-full flex flex-col justify-center items-center gap-4 bg-neutral-700">
      <div className="w-[600px] h-[340px] border-4 border-gray-700 rounded-xl">
        {link === '/mcqueen-image.png' && (
          <Image
            width={600}
            height={600}
            className="rounded-md"
            src={link}
            alt="Gif"
          />
        )}
        {link === '/mcqueen-video.mp4' && (
          <video
            ref={videoRef}
            width={600}
            height={600}
            className="rounded-md"
            src={`/mcqueen-video.mp4`} // Accede al video en la carpeta public
            autoPlay={true}
          />
        )}
      </div>
      <div>
        <button
          className="border-4 border-gray-700 rounded-md p-2 bg-gray-300"
          onClick={handleClick}
          disabled={link === '/mcqueen-video.mp4'}
        >
          Hablar
        </button>
      </div>
    </div>
  );
}
