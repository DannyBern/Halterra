import { useState } from 'react';
import type { Mood, UserResponse } from '../types';
import { questionnaires } from '../data/moods';
import MoodIcon from './MoodIcon';
import './Questionnaire.css';

interface QuestionnaireProps {
  mood: Mood;
  userName: string;
  onComplete: (responses: UserResponse[]) => void;
  onBack: () => void;
}

export default function Questionnaire({ mood, userName, onComplete, onBack }: QuestionnaireProps) {
  const questionnaire = questionnaires.find(q => q.moodId === mood.id);
  const questions = questionnaire?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleOptionSelect = (option: string) => {
    const isCustomOption = option.includes('Autre') || option.includes('....') || option === '✍️ Écrire ma propre réponse';

    if (isCustomOption) {
      setShowCustomInput(true);
      setSelectedOption(option);
    } else {
      setSelectedOption(option);
      setShowCustomInput(false);
      setCustomAnswer('');
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const answer = showCustomInput && customAnswer.trim()
      ? customAnswer.trim()
      : selectedOption;

    const newResponses = [
      ...responses,
      {
        questionId: currentQuestion.id,
        answer: answer
      }
    ];

    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setCustomAnswer('');
        setShowCustomInput(false);
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        onComplete(newResponses);
      }, 600);
    }
  };

  const canProceed = selectedOption && (!showCustomInput || customAnswer.trim());

  return (
    <div className="questionnaire">
      {currentQuestionIndex === 0 && (
        <button className="back-button" onClick={onBack} aria-label="Retour">
          ← Retour
        </button>
      )}

      <div className="questionnaire-header">
        <div className="mood-badge" style={{ backgroundColor: `${mood.color}15`, color: mood.color }}>
          <span className="mood-badge-icon">
            <MoodIcon moodId={mood.id} size={28} />
          </span>
          <span className="mood-badge-text">{mood.name}</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <p className="progress-text">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </p>
      </div>

      <div className={`questionnaire-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
        <h2 className="question-text">{userName}, {currentQuestion?.text}</h2>

        <div className="options-list">
          {currentQuestion?.options.map((option, index) => {
            const isCustomOption = option.includes('Autre') || option.includes('....');
            const isSelected = selectedOption === option;

            return (
              <div key={index} className="option-wrapper">
                <button
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    borderColor: isSelected ? mood.color : 'transparent'
                  }}
                >
                  <span className="option-text">{option}</span>
                  <div
                    className="option-indicator"
                    style={{ backgroundColor: mood.color }}
                  ></div>
                </button>

                {isCustomOption && isSelected && showCustomInput && (
                  <div className="custom-input-wrapper fade-in">
                    <textarea
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      className="custom-input"
                      autoFocus
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Option pour écrire une réponse personnalisée */}
          <div className="option-wrapper">
            <button
              className={`option-button custom-response-button ${selectedOption === '✍️ Écrire ma propre réponse' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('✍️ Écrire ma propre réponse')}
              style={{
                animationDelay: `${currentQuestion?.options.length * 0.1}s`,
                borderColor: selectedOption === '✍️ Écrire ma propre réponse' ? mood.color : 'transparent'
              }}
            >
              <span className="option-text">✍️ Écrire ma propre réponse</span>
              <div
                className="option-indicator"
                style={{ backgroundColor: mood.color }}
              ></div>
            </button>

            {selectedOption === '✍️ Écrire ma propre réponse' && showCustomInput && (
              <div className="custom-input-wrapper fade-in">
                <textarea
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  className="custom-input"
                  autoFocus
                  rows={3}
                  maxLength={200}
                />
              </div>
            )}
          </div>
        </div>

        <button
          className="next-button"
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            backgroundColor: canProceed ? mood.color : undefined
          }}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Terminer'}
        </button>
      </div>
    </div>
  );
}
