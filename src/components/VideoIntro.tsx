import { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio) {
      // Tenter de jouer l'audio dès que la vidéo démarre
      const playAudio = async () => {
        try {
          // Synchroniser la position de l'audio avec la vidéo
          audio.currentTime = video.currentTime;
          await audio.play();
          setAudioStarted(true);
        } catch (error) {
          console.log('Audio autoplay prevented, waiting for user interaction:', error);
        }
      };

      // Synchroniser avec le début de la vidéo
      video.addEventListener('play', playAudio);

      return () => {
        video.removeEventListener('play', playAudio);
      };
    }
  }, []);

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

  const handleScreenClick = async () => {
    // Si l'audio n'a pas encore démarré, le démarrer maintenant
    if (!audioStarted) {
      const video = videoRef.current;
      const audio = audioRef.current;

      if (video && audio) {
        try {
          audio.currentTime = video.currentTime;
          await audio.play();
          setAudioStarted(true);
        } catch (error) {
          console.log('Failed to start audio:', error);
        }
      }
    }
  };

  return (
    <div
      className={`video-intro ${isTransitioning ? 'fade-out' : ''}`}
      onClick={handleScreenClick}
    >
      <video
        ref={videoRef}
        className="intro-video"
        onEnded={handleVideoEnd}
        autoPlay
        muted
        playsInline
        preload="auto"
      >
        <source
          src={`${import.meta.env.BASE_URL}ultra_detailed_cinematic_concept_art_for_a_meditation.mp4`}
          type="video/mp4"
        />
      </video>

      <audio
        ref={audioRef}
        preload="auto"
      >
        <source
          src={`${import.meta.env.BASE_URL}Golden Meditation Intro.mp3`}
          type="audio/mpeg"
        />
      </audio>

      {!audioStarted && (
        <div className="audio-prompt">
          Touchez l'écran pour activer le son
        </div>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
