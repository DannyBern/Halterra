import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import DateDisplay from './components/DateDisplay';
import MoodSelector from './components/MoodSelector';
import Questionnaire from './components/Questionnaire';
import Meditation from './components/Meditation';
import History from './components/History';
import SessionView from './components/SessionView';
import type { User, Mood, UserResponse, MeditationSession } from './types';
import { storage } from './utils/storage';
import './App.css';

type AppScreen =
  | 'landing'
  | 'onboarding'
  | 'date'
  | 'mood'
  | 'questionnaire'
  | 'meditation'
  | 'history'
  | 'session-view';

function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);

  // API Keys - À configurer par l'utilisateur
  const [anthropicApiKey, setAnthropicApiKey] = useState<string>('');
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState<string>('');

  useEffect(() => {
    // Charger l'utilisateur depuis le stockage
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
      setScreen('date');
    }

    // Charger les clés API depuis le localStorage
    const savedAnthropicKey = localStorage.getItem('halterra_anthropic_key');
    const savedElevenlabsKey = localStorage.getItem('halterra_elevenlabs_key');
    if (savedAnthropicKey) setAnthropicApiKey(savedAnthropicKey);
    if (savedElevenlabsKey) setElevenlabsApiKey(savedElevenlabsKey);
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

  const handleMeditationComplete = (meditationText: string, audioUrl?: string) => {
    if (!user || !selectedMood) return;

    const session: MeditationSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      userName: user.name,
      mood: selectedMood.id,
      responses,
      meditationText,
      audioUrl,
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

  // Composant pour la configuration des API keys
  const renderApiKeyPrompt = () => {
    if (!anthropicApiKey && screen === 'meditation') {
      return (
        <div className="api-key-prompt">
          <h3>Configuration requise</h3>
          <p>Veuillez entrer votre clé API Anthropic pour générer les méditations :</p>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={anthropicApiKey}
            onChange={(e) => {
              setAnthropicApiKey(e.target.value);
              localStorage.setItem('halterra_anthropic_key', e.target.value);
            }}
          />
          <p className="api-hint">
            Optionnel : Clé API ElevenLabs pour la narration audio
          </p>
          <input
            type="password"
            placeholder="Clé ElevenLabs (optionnel)"
            value={elevenlabsApiKey}
            onChange={(e) => {
              setElevenlabsApiKey(e.target.value);
              localStorage.setItem('halterra_elevenlabs_key', e.target.value);
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app">
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
        <>
          {renderApiKeyPrompt()}
          {anthropicApiKey && (
            <Meditation
              mood={selectedMood}
              userName={user.name}
              responses={responses}
              anthropicApiKey={anthropicApiKey}
              elevenlabsApiKey={elevenlabsApiKey}
              onComplete={handleMeditationComplete}
            />
          )}
        </>
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
