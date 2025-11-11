import { useEffect } from 'react';

/**
 * Hook personnalisé pour preloader intelligemment les composants lazy-loaded
 *
 * Preload les composants susceptibles d'être utilisés prochainement:
 * - Onboarding: dès que l'intro vidéo est vue
 * - Meditation: dès qu'un mood est sélectionné
 * - History: en arrière-plan après le chargement initial
 *
 * Stratégie: Utilise requestIdleCallback pour ne pas bloquer le thread principal
 */
export function usePreloadComponents(screen: string, hasSeenIntro: boolean) {
  useEffect(() => {
    // Preload Onboarding après l'intro vidéo
    if (hasSeenIntro && screen === 'onboarding') {
      const preloadOnboarding = () => {
        import('../components/Onboarding');
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadOnboarding);
      } else {
        setTimeout(preloadOnboarding, 1);
      }
    }
  }, [hasSeenIntro, screen]);

  useEffect(() => {
    // Preload Meditation après la sélection du mood (très probable que l'utilisateur continue)
    if (screen === 'duration' || screen === 'category') {
      const preloadMeditation = () => {
        import('../components/Meditation');
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadMeditation);
      } else {
        setTimeout(preloadMeditation, 1);
      }
    }
  }, [screen]);

  useEffect(() => {
    // Preload History et SessionView en arrière-plan après chargement de la page date
    if (screen === 'date') {
      const preloadHistory = () => {
        import('../components/History');
        import('../components/SessionView');
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadHistory, { timeout: 2000 });
      } else {
        setTimeout(preloadHistory, 2000);
      }
    }
  }, [screen]);
}
