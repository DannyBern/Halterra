import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  shouldFadeOut: boolean;
  onFadeComplete?: () => void;
  isMuted?: boolean;
}

export default function BackgroundMusic({ shouldFadeOut, onFadeComplete, isMuted = false }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.3); // Volume initial à 30% pour ne pas être trop fort
  const fadeIntervalRef = useRef<number | null>(null);

  // Sélectionner aléatoirement l'une des deux musiques au montage
  const [musicTrack] = useState(() => {
    const tracks = ['/zen-flow.mp3', '/zen-flow-2.mp3'];
    return tracks[Math.floor(Math.random() * tracks.length)];
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configuration audio pour qualité maximale
    audio.volume = volume;
    audio.loop = true;
    audio.preload = 'auto';

    // Démarrer la lecture automatiquement
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay bloqué, attente interaction utilisateur:', error);
      });
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
    };
  }, []);

  // Handle mute/unmute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0;
    } else {
      audio.volume = volume;
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (shouldFadeOut) {
      // Fade out progressif sur 2 secondes
      const fadeOutDuration = 2000; // 2 secondes
      const fadeSteps = 50; // 50 étapes pour un fade smooth
      const fadeInterval = fadeOutDuration / fadeSteps;
      const volumeDecrement = volume / fadeSteps;

      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, volume - (volumeDecrement * currentStep));

        if (audio) {
          audio.volume = newVolume;
          setVolume(newVolume);
        }

        if (currentStep >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          if (audio) {
            audio.pause();
          }
          if (onFadeComplete) {
            onFadeComplete();
          }
        }
      }, fadeInterval);
    } else {
      // Fade in si on revient en arrière
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const targetVolume = 0.3;
      const fadeInDuration = 1000; // 1 seconde
      const fadeSteps = 30;
      const fadeInterval = fadeInDuration / fadeSteps;
      const volumeIncrement = targetVolume / fadeSteps;

      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const newVolume = Math.min(targetVolume, volumeIncrement * currentStep);

        if (audio) {
          audio.volume = newVolume;
          setVolume(newVolume);
        }

        if (currentStep >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
        }
      }, fadeInterval);

      // Reprendre la lecture si en pause
      if (audio.paused) {
        audio.play().catch(err => console.log('Erreur lecture:', err));
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [shouldFadeOut]);

  return (
    <audio
      ref={audioRef}
      src={musicTrack}
      preload="auto"
    />
  );
}
