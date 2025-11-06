import { useRef, useState, useEffect } from 'react';
import './VideoIntro.css';

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Stratégie: démarrer muted pour contourner les restrictions d'autoplay,
    // puis unmute immédiatement
    const startVideo = async () => {
      try {
        video.muted = true;
        await video.play();
        // Unmute immédiatement après le démarrage
        video.muted = false;
        console.log('Vidéo démarrée avec audio');
      } catch (error) {
        console.error('Erreur autoplay:', error);
        // Si même muted ne fonctionne pas, essayer sans mute
        try {
          video.muted = false;
          await video.play();
        } catch (err) {
          console.error('Impossible de démarrer le vidéo:', err);
        }
      }
    };

    // Attendre que le vidéo soit prêt
    if (video.readyState >= 3) {
      startVideo();
    } else {
      video.addEventListener('canplay', startVideo, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', startVideo);
    };
  }, []);

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
        preload="auto"
      >
        <source
          src={`${import.meta.env.BASE_URL}intro-video-with-audio.mp4`}
          type="video/mp4"
        />
      </video>

      <button className="skip-button" onClick={handleSkip}>
        Passer
      </button>
    </div>
  );
}
