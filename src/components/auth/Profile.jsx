import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const { currentUser, updateUsername, logout, checkUsername } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const navigate = useNavigate();

  // Initialiser le nom d'utilisateur actuel
  useEffect(() => {
    if (currentUser?.username) {
      setNewUsername(currentUser.username);
    }
  }, [currentUser]);

  const checkUsernameAvailability = async () => {
	  if (!newUsername || newUsername === currentUser?.username) return;
	  
	  setCheckingAvailability(true);
	  setError('');
	  try {
		const isAvailable = await checkUsername(newUsername);
		setUsernameAvailable(isAvailable);
		if (!isAvailable) {
		  setError('Ce pseudo est déjà pris');
		}
	  } catch (err) {
		console.error("Erreur vérification pseudo:", err);
		setError("Erreur lors de la vérification du pseudo. Réessayez.");
		setUsernameAvailable(false);
	  } finally {
		setCheckingAvailability(false);
	  }
	};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim()) {
      setError("Veuillez entrer un pseudo");
      return;
    }

    if (newUsername.toLowerCase() === currentUser?.username?.toLowerCase()) {
      setError("Vous avez déjà ce pseudo");
      return;
    }

    if (!usernameAvailable) {
      setError("Veuillez vérifier la disponibilité du pseudo");
      return;
    }

    try {
      await updateUsername(newUsername);
      setSuccess("Pseudo mis à jour avec succès !");
      setUsernameAvailable(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-container">
      <h2>Profil de {currentUser.username}</h2>
      
      <div className="profile-info">
        <p>Email: {currentUser.email}</p>
        <p>Pseudo actuel: {currentUser.username}</p>
        <p>Membre depuis: {currentUser.createdAt?.toLocaleDateString('fr-FR') || 'Date inconnue'}</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Nouveau pseudo:</label>
          <div className="username-input-container">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameAvailable(false);
                setSuccess('');
              }}
              onBlur={checkUsernameAvailability}
              required
              minLength="3"
              maxLength="20"
              disabled={checkingAvailability}
            />
            {checkingAvailability && <span className="checking-availability">Vérification...</span>}
          </div>
          
          {newUsername && newUsername !== currentUser.username && (
            <div className="availability-message">
              {usernameAvailable ? (
                <span className="success-message">Pseudo disponible</span>
              ) : error ? (
                <span className="error-message">{error}</span>
              ) : null}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!usernameAvailable || newUsername === currentUser.username || checkingAvailability}
        >
          Mettre à jour
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <button onClick={logout} className="logout-btn">
        Se déconnecter
      </button>
    </div>
  );
}