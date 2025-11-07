import { useRef, useState, useEffect } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  useEffect(() => {
    console.log('VideoIntro chargé');
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleStartVideo = async () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    try {
      // Démarrer vidéo et audio en même temps
      video.currentTime = 0;
      audio.currentTime = 0;
      audio.volume = 1.0;

      await Promise.all([
        video.play(),
        audio.play()
      ]);

      setNeedsInteraction(false);
      console.log('Vidéo et audio démarrés');

      // Démarrer le fade-out de l'audio à 7 secondes (vidéo dure 9 secondes)
      const startFadeOutAt = 7000; // 7 secondes en millisecondes
      const fadeOutDuration = 2000; // 2 secondes de fade

      setTimeout(() => {
        const fadeStartTime = Date.now();
        const startVolume = audio.volume;

        const fadeOut = () => {
          const elapsed = Date.now() - fadeStartTime;
          const progress = Math.min(elapsed / fadeOutDuration, 1);
          audio.volume = startVolume * (1 - progress);

          if (progress < 1 && !audio.paused) {
            requestAnimationFrame(fadeOut);
          }
        };

        fadeOut();
      }, startFadeOutAt);

    } catch (error) {
      console.error('Erreur de lecture:', error);
    }
  };

  const handleVideoEnd = () => {
    console.log('Vidéo terminée - transition immédiate');
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsTransitioning(true);
    // Transition immédiate
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
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

      {needsInteraction && (
        <div
          className="video-overlay"
          onClick={handleStartVideo}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10002
          }}
        >
          <div style={{
            fontSize: '18px',
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            Touchez pour démarrer
          </div>
        </div>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
