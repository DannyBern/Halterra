import { useEffect, useRef } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Auto-play la vidéo
      video.play().catch((error) => {
        console.log('Autoplay prevented:', error);
        // Si autoplay est bloqué, skip directement
        onComplete();
      });
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="video-intro">
      <video
        ref={videoRef}
        className="intro-video"
        onEnded={handleVideoEnd}
        playsInline
        muted
      >
        <source src="/Halterra/intro-video.mp4" type="video/mp4" />
      </video>

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
