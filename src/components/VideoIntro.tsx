import { useEffect, useRef, useState } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const hasAttemptedPlay = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio && !hasAttemptedPlay.current) {
      hasAttemptedPlay.current = true;

      // Attendre que les deux soient prêts
      const handleCanPlay = () => {
        if (video.readyState >= 3 && audio.readyState >= 3) {
          playMedia();
        }
      };

      const playMedia = async () => {
        try {
          // Jouer vidéo et audio simultanément
          const videoPromise = video.play();
          const audioPromise = audio.play();

          await Promise.all([videoPromise, audioPromise]);
          setCanAutoplay(true);
        } catch (error) {
          console.log('Autoplay prevented, waiting for user interaction:', error);
          setCanAutoplay(false);
          // Ne pas skip automatiquement, attendre que l'utilisateur clique
        }
      };

      // Si déjà prêt, jouer immédiatement
      if (video.readyState >= 3 && audio.readyState >= 3) {
        playMedia();
      } else {
        // Sinon, attendre
        video.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('canplaythrough', handleCanPlay);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('canplaythrough', handleCanPlay);
        };
      }
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

  const handlePlayClick = async () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio) {
      try {
        await video.play();
        await audio.play();
        setCanAutoplay(true);
      } catch (error) {
        console.error('Failed to play media:', error);
      }
    }
  };

  return (
    <div className={`video-intro ${isTransitioning ? 'fade-out' : ''}`}>
      <video
        ref={videoRef}
        className="intro-video"
        onEnded={handleVideoEnd}
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

      {!canAutoplay && (
        <button className="play-button" onClick={handlePlayClick}>
          <div className="play-icon">▶</div>
          <span>Lancer l'introduction</span>
        </button>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
