import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  shouldFadeOut: boolean;
  onFadeComplete?: () => void;
  isMuted?: boolean;
}

// Volume initial constant (évite les re-renders)
const INITIAL_VOLUME = 0.3;
const TARGET_VOLUME = 0.3;

export default function BackgroundMusic({ shouldFadeOut, onFadeComplete, isMuted = false }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Utiliser useRef au lieu de useState pour le volume pendant les animations
  // Cela évite les re-renders en cascade
  const volumeRef = useRef(INITIAL_VOLUME);
  const fadeIntervalRef = useRef<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Sélectionner aléatoirement l'une des deux musiques au montage (stable)
  const musicTrackRef = useRef(() => {
    const tracks = ['/zen-flow.mp3', '/zen-flow-2.mp3'];
    return tracks[Math.floor(Math.random() * tracks.length)];
  });
  const musicTrack = musicTrackRef.current();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configuration audio pour qualité maximale
    audio.volume = volumeRef.current;
    audio.loop = true;
    // Utiliser 'metadata' au lieu de 'auto' pour charger moins de données initialement
    audio.preload = 'metadata';

    // Fonction pour démarrer la musique lors de la première interaction
    const startMusic = async () => {
      if (!hasStarted) {
        try {
          await audio.play();
          setHasStarted(true);
          // Retirer les listeners après le premier succès
          document.removeEventListener('click', startMusic);
          document.removeEventListener('touchstart', startMusic);
          document.removeEventListener('keydown', startMusic);
        } catch {
          // Tentative silencieuse, nouvelle tentative à la prochaine interaction
        }
      }
    };

    // Ajouter les listeners pour toutes les interactions possibles
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
    document.addEventListener('keydown', startMusic);

    // Tenter autoplay immédiat (fonctionne sur certains navigateurs)
    audio.play().catch(() => {
      // Autoplay bloqué, musique démarrera à la première interaction
    });

    return () => {
      document.removeEventListener('click', startMusic);
      document.removeEventListener('touchstart', startMusic);
      document.removeEventListener('keydown', startMusic);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
    };
  }, [hasStarted]); // Dépendance minimale: seulement hasStarted

  // Handle mute/unmute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0;
    } else {
      audio.volume = volumeRef.current;
    }
  }, [isMuted]);

  // Stocker onFadeComplete dans une ref pour éviter de le mettre en dépendance
  const onFadeCompleteRef = useRef(onFadeComplete);
  onFadeCompleteRef.current = onFadeComplete;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Nettoyer l'intervalle précédent
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (shouldFadeOut) {
      // Fade out progressif sur 2 secondes
      const fadeOutDuration = 2000;
      const fadeSteps = 50;
      const fadeInterval = fadeOutDuration / fadeSteps;
      const startVolume = volumeRef.current;
      const volumeDecrement = startVolume / fadeSteps;

      let currentStep = 0;

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, startVolume - (volumeDecrement * currentStep));

        if (audio) {
          audio.volume = newVolume;
          volumeRef.current = newVolume;
        }

        if (currentStep >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          if (audio) {
            audio.pause();
          }
          if (onFadeCompleteRef.current) {
            onFadeCompleteRef.current();
          }
        }
      }, fadeInterval);
    } else {
      // Fade in si on revient en arrière
      const fadeInDuration = 1000;
      const fadeSteps = 30;
      const fadeInterval = fadeInDuration / fadeSteps;
      const volumeIncrement = TARGET_VOLUME / fadeSteps;

      let currentStep = 0;

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        const newVolume = Math.min(TARGET_VOLUME, volumeIncrement * currentStep);

        if (audio) {
          audio.volume = newVolume;
          volumeRef.current = newVolume;
        }

        if (currentStep >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, fadeInterval);

      // Reprendre la lecture si en pause
      if (audio.paused) {
        audio.play().catch(() => {
          // Erreur silencieuse
        });
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [shouldFadeOut]); // Dépendance minimale: seulement shouldFadeOut

  return (
    <audio
      ref={audioRef}
      src={musicTrack}
      preload="metadata"
      crossOrigin="anonymous"
    />
  );
}
