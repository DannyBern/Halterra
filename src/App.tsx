import { useState, useEffect } from 'react';
import VideoIntro from './components/VideoIntro';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import DateDisplay from './components/DateDisplay';
import MoodSelector from './components/MoodSelector';
import Questionnaire from './components/Questionnaire';
import Meditation from './components/Meditation';
import History from './components/History';
import SessionView from './components/SessionView';
import BackgroundMusic from './components/BackgroundMusic';
import type { User, Mood, UserResponse, MeditationSession } from './types';
import { storage } from './utils/storage';
import './App.css';

type AppScreen =
  | 'video-intro'
  | 'landing'
  | 'onboarding'
  | 'date'
  | 'mood'
  | 'questionnaire'
  | 'meditation'
  | 'history'
  | 'session-view';

function App() {
  const [screen, setScreen] = useState<AppScreen>('video-intro');
  const [user, setUser] = useState<User | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);

  // API Keys - Configurées via variables d'environnement
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

  const [hasSeenIntro, setHasSeenIntro] = useState(false);

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

  const handleLandingStart = () => {
    setScreen('onboarding');
  };

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    storage.saveUser(newUser);
    setScreen('date');
  };

  const handleDateContinue = () => {
    setScreen('mood');
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setScreen('questionnaire');
  };

  const handleQuestionnaireComplete = (userResponses: UserResponse[]) => {
    setResponses(userResponses);
    setScreen('meditation');
  };

  const handleMeditationComplete = (meditationText: string, audioBase64?: string) => {
    if (!user || !selectedMood) return;

    const session: MeditationSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      userName: user.name,
      mood: selectedMood.id,
      responses,
      meditationText,
      audioUrl: audioBase64, // Stocker le base64 au lieu du blob URL
      timestamp: Date.now()
    };

    storage.saveMeditationSession(session);
    setScreen('history');
  };

  const handleViewHistory = () => {
    setScreen('history');
  };

  const handleHistoryBack = () => {
    setScreen('date');
    setSelectedMood(null);
    setResponses([]);
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
      />

      {screen === 'video-intro' && <VideoIntro onComplete={() => {
        setHasSeenIntro(true);
        setScreen('landing');
      }} />}

      {screen === 'landing' && <Landing onStart={handleLandingStart} />}

      {screen === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}

      {screen === 'date' && user && (
        <div>
          <button className="history-link" onClick={handleViewHistory}>
            📖 Historique
          </button>
          <DateDisplay userName={user.name} onContinue={handleDateContinue} />
        </div>
      )}

      {screen === 'mood' && user && (
        <MoodSelector userName={user.name} onMoodSelect={handleMoodSelect} />
      )}

      {screen === 'questionnaire' && user && selectedMood && (
        <Questionnaire
          mood={selectedMood}
          userName={user.name}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {screen === 'meditation' && user && selectedMood && (
        <Meditation
          mood={selectedMood}
          userName={user.name}
          responses={responses}
          anthropicApiKey={anthropicApiKey}
          elevenlabsApiKey={elevenlabsApiKey}
          onComplete={handleMeditationComplete}
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
