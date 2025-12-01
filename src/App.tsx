import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import VideoIntro from './components/VideoIntro';
import DateDisplay from './components/DateDisplay';
import GuideSelector from './components/GuideSelector';
import MoodSelector from './components/MoodSelector';
import { DurationSelection } from './components/DurationSelection';
import { CategorySelection } from './components/CategorySelection';
import BackgroundMusic from './components/BackgroundMusic';
import LoadingFallback from './components/LoadingFallback';
import Toast from './components/Toast';
import PullToRefresh from './components/PullToRefresh';
import { usePreloadComponents } from './hooks/usePreloadComponents';
import type { User, Mood, MeditationSession } from './types';
import { storage } from './utils/storage';
import './App.css';

// 🚀 CODE SPLITTING - Lazy load des composants lourds
// Réduit le bundle initial de ~30% et améliore le Time To Interactive
const Onboarding = lazy(() => import('./components/Onboarding'));
const Meditation = lazy(() => import('./components/Meditation'));
const History = lazy(() => import('./components/History'));
const SessionView = lazy(() => import('./components/SessionView'));

type AppScreen =
  | 'video-intro'
  | 'onboarding'
  | 'date'
  | 'guide'
  | 'mood'
  | 'duration'
  | 'category'
  | 'meditation'
  | 'history'
  | 'session-view';

type GuideType = 'meditation' | 'reflection';

function App() {
  const [screen, setScreen] = useState<AppScreen>('video-intro');
  const [user, setUser] = useState<User | null>(null);
  const [selectedGuideType, setSelectedGuideType] = useState<GuideType | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<2 | 5 | 10 | null>(null);
  const [generateAudio, setGenerateAudio] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // 🚀 PRELOAD INTELLIGENT - Charge les composants avant qu'ils soient nécessaires
  usePreloadComponents(screen, hasSeenIntro);

  useEffect(() => {
    // Charger l'utilisateur depuis le stockage seulement après l'intro vidéo
    if (hasSeenIntro) {
      const savedUser = storage.getUser();
      if (savedUser) {
        setUser(savedUser);
        setScreen('date');
      }
    }
  }, [hasSeenIntro]);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    storage.saveUser(newUser);
    setScreen('date');
  };

  const handleDateContinue = () => {
    setScreen('guide');
  };

  const handleGuideSelect = (guideType: GuideType) => {
    setSelectedGuideType(guideType);
    setScreen('mood');
  };

  const handleGuideBack = () => {
    setScreen('date');
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setScreen('duration');
  };

  const handleMoodBack = () => {
    setScreen('guide');
  };

  const handleDurationSelect = (duration: 2 | 5 | 10, audioEnabled: boolean) => {
    setSelectedDuration(duration);
    setGenerateAudio(audioEnabled);
    setScreen('category');
  };

  const handleDurationBack = () => {
    setScreen('mood');
  };

  const handleCategorySelect = (category: string, intention: string) => {
    setSelectedCategory(category);
    setSelectedIntention(intention);
    setScreen('meditation');
  };

  const handleCategoryBack = () => {
    setScreen('duration');
  };

  const handleMeditationBack = () => {
    setScreen('category');
  };

  const handleMeditationComplete = async (meditationText: string, audioBase64?: string) => {
    console.log('🔍 handleMeditationComplete reçu:', {
      hasText: !!meditationText,
      textLength: meditationText.length,
      hasAudio: !!audioBase64,
      audioLength: audioBase64?.length,
      audioPreview: audioBase64?.substring(0, 50)
    });

    if (!user || !selectedMood) {
      console.error('Cannot save: missing user or mood', { user, selectedMood });
      return;
    }

    const session: MeditationSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      userName: user.name,
      mood: selectedMood.id,
      guideType: selectedGuideType || 'meditation',
      duration: selectedDuration || 5,
      category: selectedCategory || undefined,
      intention: selectedIntention || undefined,
      meditationText,
      audioUrl: audioBase64,
      timestamp: Date.now()
    };

    console.log('💾 Saving meditation session:', {
      id: session.id,
      hasText: !!meditationText,
      hasAudio: !!audioBase64,
      audioLength: audioBase64?.length,
      guideType: session.guideType
    });

    try {
      await storage.saveMeditationSession(session);

      // Verify save
      const savedSessions = await storage.getAllSessions();
      console.log('✅ Session saved successfully! Total sessions:', savedSessions.length);

      // Vérifier que la session vient d'être sauvegardée
      const justSaved = savedSessions.find(s => s.id === session.id);
      if (justSaved) {
        console.log('✅ Session vérifiée dans la liste:', {
          id: justSaved.id,
          hasText: !!justSaved.meditationText,
          hasAudio: !!justSaved.audioUrl,
          audioLength: justSaved.audioUrl?.length
        });
      } else {
        console.error('⚠️ Session non trouvée après sauvegarde!');
      }

      // Rediriger automatiquement vers l'historique après la sauvegarde
      // Petit délai pour que l'utilisateur voie la notification de succès
      setTimeout(() => {
        setScreen('history');
      }, 1500);
    } catch (error) {
      console.error('❌ Failed to save session:', error);
      showToast('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  };

  const handleViewHistory = () => {
    setScreen('history');
  };

  const handleHistoryBack = () => {
    setScreen('date');
    setSelectedGuideType(null);
    setSelectedMood(null);
    setSelectedDuration(null);
    setGenerateAudio(true);
    setSelectedCategory(null);
    setSelectedIntention(null);
  };

  const handleSessionSelect = (session: MeditationSession) => {
    setSelectedSession(session);
    setScreen('session-view');
  };

  const handleSessionViewBack = () => {
    setScreen('history');
    setSelectedSession(null);
  };

  // Désactiver pull-to-refresh pendant la méditation et la lecture de session
  const disablePullToRefresh = screen === 'meditation' || screen === 'session-view' || screen === 'video-intro';

  return (
    <PullToRefresh disabled={disablePullToRefresh}>
    <div className="app">
      {/* Musique de fond - fade out pendant la méditation */}
      <BackgroundMusic
        shouldFadeOut={screen === 'meditation' || screen === 'session-view'}
        isMuted={isMusicMuted}
      />

      {/* Bouton mute/unmute sophistiqué */}
      {screen !== 'video-intro' && (
        <button
          className="music-toggle-button"
          onClick={() => setIsMusicMuted(!isMusicMuted)}
          aria-label={isMusicMuted ? 'Activer la musique' : 'Désactiver la musique'}
        >
          <div className="music-toggle-icon">
            {isMusicMuted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
          </div>
        </button>
      )}

      {/* Bouton Historique flottant - visible sur toutes les pages sauf meditation */}
      {screen !== 'meditation' && screen !== 'history' && screen !== 'session-view' && (
        <button className="floating-history-button" onClick={handleViewHistory} aria-label="Voir l'historique">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Historique</span>
        </button>
      )}

      {screen === 'video-intro' && <VideoIntro onComplete={() => {
        setHasSeenIntro(true);
        setScreen('onboarding');
      }} />}

      {screen === 'onboarding' && (
        <Suspense fallback={<LoadingFallback />}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </Suspense>
      )}

      {screen === 'date' && user && (
        <div>
          <button className="intro-replay-link" onClick={() => setScreen('video-intro')}>
            🎬 Revoir l'intro
          </button>
          <DateDisplay
            userName={user.name}
            astrologicalProfile={user.astrologicalProfile}
            onContinue={handleDateContinue}
          />
        </div>
      )}

      {screen === 'guide' && user && (
        <GuideSelector
          userName={user.name}
          onSelectGuide={handleGuideSelect}
          onBack={handleGuideBack}
          onHistory={handleViewHistory}
        />
      )}

      {screen === 'mood' && user && (
        <MoodSelector
          userName={user.name}
          onMoodSelect={handleMoodSelect}
          onBack={handleMoodBack}
          onHistory={handleViewHistory}
        />
      )}

      {screen === 'duration' && selectedGuideType && selectedMood && (
        <DurationSelection
          guideType={selectedGuideType}
          mood={selectedMood}
          onSelect={handleDurationSelect}
          onBack={handleDurationBack}
          onHistory={handleViewHistory}
        />
      )}

      {screen === 'category' && selectedGuideType && selectedMood && (
        <CategorySelection
          guideType={selectedGuideType}
          mood={selectedMood}
          onSelectIntention={handleCategorySelect}
          onBack={handleCategoryBack}
          onHistory={handleViewHistory}
        />
      )}

      {screen === 'meditation' && user && selectedMood && selectedDuration && selectedIntention && (
        <Suspense fallback={<LoadingFallback />}>
          <Meditation
            mood={selectedMood}
            userName={user.name}
            category={selectedCategory || ''}
            intention={selectedIntention}
            guideType={selectedGuideType || 'meditation'}
            duration={selectedDuration}
            generateAudio={generateAudio}
            astrologicalProfile={user.astrologicalProfile}
            onComplete={handleMeditationComplete}
            onBack={handleMeditationBack}
            onHistory={handleViewHistory}
          />
        </Suspense>
      )}

      {screen === 'history' && (
        <Suspense fallback={<LoadingFallback />}>
          <History onBack={handleHistoryBack} onSessionSelect={handleSessionSelect} />
        </Suspense>
      )}

      {screen === 'session-view' && selectedSession && (
        <Suspense fallback={<LoadingFallback />}>
          <SessionView session={selectedSession} onBack={handleSessionViewBack} onHistory={handleViewHistory} />
        </Suspense>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    </PullToRefresh>
  );
}

export default App;
