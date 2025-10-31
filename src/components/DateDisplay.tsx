import './DateDisplay.css';

interface DateDisplayProps {
  userName: string;
  onContinue: () => void;
}

export default function DateDisplay({ userName, onContinue }: DateDisplayProps) {
  const today = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const formattedDate = today.toLocaleDateString('fr-FR', options);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="date-display fade-in">
      <div className="date-content">
        <div className="date-ornament">✦</div>

        <h2 className="date-greeting">
          {getGreeting()}, {userName}
        </h2>

        <div className="date-main">
          <p className="date-text">{capitalizedDate}</p>
        </div>

        <p className="date-subtitle">
          Prenons un moment pour honorer ce jour et votre état d'esprit.
        </p>

        <button className="date-button" onClick={onContinue}>
          Comment vous sentez-vous ?
        </button>

        <div className="date-ornament-bottom">✦</div>
      </div>
    </div>
  );
}
