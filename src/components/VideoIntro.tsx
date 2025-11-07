import { useRef, useState, useEffect } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Détecter si l'autoplay a fonctionné
    const checkAutoplay = setTimeout(() => {
      if (video.paused) {
        console.log('Autoplay bloqué, interaction requise');
        setNeedsInteraction(true);
      } else {
        console.log('Autoplay réussi');
        setNeedsInteraction(false);
      }
    }, 500);

    return () => {
      clearTimeout(checkAutoplay);
    };
  }, []);

  const handleStartVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.volume = 1.0;
      await video.play();
      setNeedsInteraction(false);
      console.log('Vidéo démarrée avec audio');
    } catch (error) {
      console.error('Erreur de lecture:', error);
    }
  };

  const handleVideoEnd = () => {
    const video = videoRef.current;
    if (video) {
      // Fade out audio progressivement sur 1 seconde
      const fadeOutDuration = 1000;
      const startVolume = video.volume;
      const startTime = Date.now();

      const fadeAudio = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);
        video.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(fadeAudio);
        } else {
          video.pause();
          video.currentTime = 0;
          video.load();
        }
      };

      fadeAudio();
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
      // Fade out rapide sur 300ms
      const fadeOutDuration = 300;
      const startVolume = video.volume;
      const startTime = Date.now();

      const fadeAudio = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);
        video.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(fadeAudio);
        } else {
          video.pause();
          video.currentTime = 0;
          video.load();
        }
      };

      fadeAudio();
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
        autoPlay
        muted
        preload="auto"
      >
        <source
          src={`${import.meta.env.BASE_URL}intro-video-with-audio.mp4`}
          type="video/mp4"
        />
      </video>

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
            Touchez pour démarrer avec audio
          </div>
        </div>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
