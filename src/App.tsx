import { useState, useEffect } from 'react';
import VideoIntro from './components/VideoIntro';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import DateDisplay from './components/DateDisplay';
import GuideSelector from './components/GuideSelector';
import MoodSelector from './components/MoodSelector';
import { DurationSelection } from './components/DurationSelection';
import { CategorySelection } from './components/CategorySelection';
import Meditation from './components/Meditation';
import History from './components/History';
import SessionView from './components/SessionView';
import BackgroundMusic from './components/BackgroundMusic';
import type { User, Mood, MeditationSession } from './types';
import { storage } from './utils/storage';
import './App.css';

type AppScreen =
  | 'video-intro'
  | 'landing'
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

  // API Keys - Configurées via variables d'environnement
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

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

  // Prevent pull-to-refresh on mobile
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Only prevent if at top of scroll and pulling down
      if (target.scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  const handleLandingStart = () => {
    setScreen('onboarding');
  };

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

  const handleMeditationComplete = (meditationText: string, audioBase64?: string) => {
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

    console.log('Saving meditation session:', {
      id: session.id,
      hasText: !!meditationText,
      hasAudio: !!audioBase64,
      audioLength: audioBase64?.length,
      guideType: session.guideType
    });

    storage.saveMeditationSession(session);

    // Verify save
    const savedSessions = storage.getAllSessions();
    console.log('Total sessions after save:', savedSessions.length);

    setScreen('history');
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

  return (
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

      {screen === 'video-intro' && <VideoIntro onComplete={() => {
        setHasSeenIntro(true);
        setScreen('landing');
      }} />}

      {screen === 'landing' && <Landing onStart={handleLandingStart} />}

      {screen === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}

      {screen === 'date' && user && (
        <div>
          <button className="intro-replay-link" onClick={() => setScreen('video-intro')}>
            🎬 Revoir l'intro
          </button>
          <button className="history-link" onClick={handleViewHistory}>
            📖 Historique
          </button>
          <DateDisplay userName={user.name} onContinue={handleDateContinue} />
        </div>
      )}

      {screen === 'guide' && user && (
        <GuideSelector
          userName={user.name}
          onSelectGuide={handleGuideSelect}
          onBack={handleGuideBack}
        />
      )}

      {screen === 'mood' && user && (
        <MoodSelector
          userName={user.name}
          onMoodSelect={handleMoodSelect}
          onBack={handleMoodBack}
        />
      )}

      {screen === 'duration' && selectedGuideType && selectedMood && (
        <DurationSelection
          guideType={selectedGuideType}
          mood={selectedMood}
          onSelect={handleDurationSelect}
          onBack={handleDurationBack}
        />
      )}

      {screen === 'category' && selectedGuideType && selectedMood && (
        <CategorySelection
          guideType={selectedGuideType}
          mood={selectedMood}
          onSelectIntention={handleCategorySelect}
          onBack={handleCategoryBack}
        />
      )}

      {screen === 'meditation' && user && selectedMood && selectedDuration && selectedIntention && (
        <Meditation
          mood={selectedMood}
          userName={user.name}
          category={selectedCategory || ''}
          intention={selectedIntention}
          guideType={selectedGuideType || 'meditation'}
          duration={selectedDuration}
          generateAudio={generateAudio}
          anthropicApiKey={anthropicApiKey}
          elevenlabsApiKey={elevenlabsApiKey}
          onComplete={handleMeditationComplete}
          onBack={handleMeditationBack}
        />
      )}

      {screen === 'history' && (
        <History onBack={handleHistoryBack} onSessionSelect={handleSessionSelect} />
      )}

      {screen === 'session-view' && selectedSession && (
        <SessionView session={selectedSession} onBack={handleSessionViewBack} />
      )}
    </div>
  );
}

export default App;
