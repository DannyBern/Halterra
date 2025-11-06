import { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio) {
      // Synchroniser l'audio avec la vidéo
      const playMedia = async () => {
        try {
          await video.play();
          await audio.play();
        } catch (error) {
          console.log('Autoplay prevented:', error);
          // Si autoplay est bloqué, skip directement
          onComplete();
        }
      };

      playMedia();
    }
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio) return;

    const handleTimeUpdate = () => {
      const timeRemaining = video.duration - video.currentTime;

      // Commencer le fade-out 2 secondes avant la fin
      if (timeRemaining <= 2 && timeRemaining > 0) {
        // Calculer le volume en fonction du temps restant (fade-out linéaire)
        const volumeLevel = timeRemaining / 2;
        audio.volume = Math.max(0, Math.min(1, volumeLevel));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const handleVideoEnd = () => {
    setIsTransitioning(true);
    // Attendre la fin de l'animation avant de compléter
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkip = () => {
    const audio = audioRef.current;
    if (audio) {
      // Fade-out rapide avant de skip
      audio.volume = 0;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div className={`video-intro ${isTransitioning ? 'fade-out' : ''}`}>
      <video
        ref={videoRef}
        className="intro-video"
        onEnded={handleVideoEnd}
        playsInline
        muted
      >
        <source
          src={`${import.meta.env.BASE_URL}ultra_detailed_cinematic_concept_art_for_a_meditation.mp4`}
          type="video/mp4"
        />
      </video>

      <audio
        ref={audioRef}
        loop={false}
      >
        <source
          src={`${import.meta.env.BASE_URL}Golden Meditation Intro.mp3`}
          type="audio/mpeg"
        />
      </audio>

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
