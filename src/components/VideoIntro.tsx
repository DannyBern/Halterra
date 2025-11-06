import { useRef, useState, useEffect } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Tenter l'autoplay
    const attemptAutoplay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
        setNeedsPlay(false);
      } catch (error) {
        console.log('Autoplay bloqué, affichage du bouton play');
        setNeedsPlay(true);
      }
    };

    // Attendre que le vidéo soit prêt
    if (video.readyState >= 3) {
      attemptAutoplay();
    } else {
      video.addEventListener('canplay', attemptAutoplay, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', attemptAutoplay);
    };
  }, []);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setIsPlaying(true);
      setNeedsPlay(false);
    } catch (error) {
      console.error('Erreur de lecture:', error);
    }
  };

  const handleVideoEnd = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.load(); // Recharger le vidéo pour arrêter complètement l'audio
    }
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.load(); // Recharger le vidéo pour arrêter complètement l'audio
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
        preload="auto"
      >
        <source
          src={`${import.meta.env.BASE_URL}intro-video-with-audio.mp4`}
          type="video/mp4"
        />
      </video>

      {needsPlay && !isPlaying && (
        <button className="center-play-button" onClick={handlePlay}>
          <div className="play-icon-large">▶</div>
        </button>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
