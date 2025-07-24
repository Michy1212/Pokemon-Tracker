import { useState } from 'react';

export default function PokemonCard({ pokemon, userId, onCapture, hunt }) {
  const [captureStatus, setCaptureStatus] = useState({
    normal: pokemon.capturedBy?.includes(userId) || false,
    shiny: pokemon.shinyCapturedBy?.includes(userId) || false,
    tracking: pokemon.trackingBy?.includes(userId) || false
  });

  // Fonction pour générer une couleur unique basée sur l'UID du participant
  const getParticipantColor = (uid) => {
    const colors = [
      '#FF6B6B', '#48DBFB', '#6BCB77', '#FFD166', 
      '#A05195', '#FFA5A5', '#4CC9F0', '#83C5BE', 
      '#FFDDD2', '#A5A58D'
    ];
    const hash = uid.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash % colors.length)];
  };

  // Trouver le premier attrapeur (s'il existe)
  const firstCapturer = pokemon.capturedBy?.[0];
  const firstCapturerColor = firstCapturer ? getParticipantColor(firstCapturer) : null;

  const handleCapture = (type) => {
    const newStatus = { ...captureStatus };
    
    if (type === 'normal') {
      newStatus.normal = !newStatus.normal;
      if (!newStatus.normal) newStatus.shiny = false;
    } else if (type === 'shiny') {
      newStatus.shiny = !newStatus.shiny;
      if (newStatus.shiny) newStatus.normal = true;
    }
    
    setCaptureStatus(newStatus);
    onCapture(pokemon.id, newStatus);
  };

  const handleCardClick = () => {
    if (!userId) return;
    
    const newStatus = { 
      ...captureStatus,
      normal: !captureStatus.normal,
      shiny: captureStatus.normal ? captureStatus.shiny : false,
      tracking: captureStatus.normal ? captureStatus.tracking : false
    };
    
    setCaptureStatus(newStatus);
    onCapture(pokemon.id, newStatus);
  };

  const handleIndicatorClick = (type, e) => {
    e.stopPropagation();
    
    const newStatus = { ...captureStatus };
    
    if (type === 'shiny') {
      newStatus.shiny = !newStatus.shiny;
      newStatus.normal = true;
    } else if (type === 'tracking') {
      newStatus.tracking = !newStatus.tracking;
    }
    
    setCaptureStatus(newStatus);
    onCapture(pokemon.id, newStatus);
  };

  const spriteUrl = `/sprites/pokemon/${
    captureStatus.shiny ? 'shiny/' : ''
  }${pokemon.id}.png`;

  return (
    <div 
      className={`pokemon-card 
        ${captureStatus.normal ? 'captured' : ''} 
        ${captureStatus.shiny ? 'shiny' : ''}
        ${captureStatus.tracking ? 'tracking' : ''}`}
      onClick={handleCardClick}
      style={firstCapturerColor ? { 
        border: `3px solid ${firstCapturerColor}`,
        boxShadow: `0 0 12px ${firstCapturerColor}`,
        background: `linear-gradient(to bottom right, ${firstCapturerColor}20, transparent)`
      } : {}}
    >
      <button
        className={`capture-indicator tracking ${captureStatus.tracking ? 'active' : ''}`}
        onClick={(e) => handleIndicatorClick('tracking', e)}
        title="Traquer ce Pokémon"
        aria-label="Tracking indicator"
      >
        {captureStatus.tracking ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#2196F3">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style={{ filter: "grayscale(100%) brightness(0.7)" }}>
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
          </svg>
        )}
      </button>

      <button
        className={`capture-indicator shiny ${captureStatus.shiny ? 'active' : ''}`}
        onClick={(e) => handleIndicatorClick('shiny', e)}
        title="Shiny"
        aria-label="Shiny indicator"
      >
        {captureStatus.shiny ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="gold">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style={{ filter: "grayscale(100%) brightness(0.7)" }}>
            <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
          </svg>
        )}
      </button>

      <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
  
      <img 
        src={spriteUrl} 
        alt={pokemon.name} 
        className="pokemon-sprite"
        style={{ 
          height: '80px',
          width: 'auto',
          marginBottom: '0'
        }} 
      />
      
      <h3 className="pokemon-name">{pokemon.name}</h3>
      
      <div className="pokemon-types">
        {(Array.isArray(pokemon.type) ? pokemon.type : pokemon.type.split(', ')).map((type, index, array) => (
          <span key={index}>
            <span className={`type-badge type-${type.toLowerCase()}`}>
              {type.trim()}
            </span>
            {index < array.length - 1 && <span className="type-separator"> / </span>}
          </span>
        ))}
      </div>
      
      {hunt && pokemon.capturedBy?.length > 0 && (
        <div className="participant-badges">
          {pokemon.capturedBy.map((uid, index) => {
            const participant = hunt.participantsInfo?.[uid] || { username: 'Inconnu' };
            const isCurrentUser = uid === userId;
            return (
              <span 
                key={uid}
                className="participant-badge"
                style={{ 
                  backgroundColor: getParticipantColor(uid),
                  transform: index === 0 ? 'scale(1.2)' : 'scale(1)',
                  border: index === 0 ? '2px solid white' : 'none'
                }}
                title={`${participant.username}${isCurrentUser ? ' (Vous)' : ''}${uid === hunt?.creatorId ? ' (Créateur)' : ''}`}
              />
            );
          })}
        </div>
      )}

      <div className="capture-stats">
        <span className="stat-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF0000" className="stat-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0-14C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          {pokemon.capturedBy?.length || 0}
        </span>

        <span className="stat-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="gold" className="stat-icon">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          {pokemon.shinyCapturedBy?.length || 0}
        </span>

        <span className="stat-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#2196F3" className="stat-icon">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          {pokemon.trackingBy?.length || 0}
        </span>
      </div>
    </div>
  );
}