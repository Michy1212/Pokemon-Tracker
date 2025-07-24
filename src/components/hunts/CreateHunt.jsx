import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './CreateHunt.css';

export default function CreateHunt() {
  const [huntName, setHuntName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!currentUser) {
      setError('Vous devez être connecté pour créer une chasse');
      return;
    }
  
    if (!huntName.trim()) {
      setError('Veuillez donner un nom à votre chasse');
      return;
    }

    if (isPrivate && password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    try {
      setLoading(true);
      const newHuntRef = doc(collection(db, 'hunts'));
      await setDoc(newHuntRef, {
		  name: huntName,
		  nameSearch: huntName.toLowerCase().trim(),
		  creatorId: currentUser.uid,
		  createdAt: serverTimestamp(),
		  isPrivate,
		  password: isPrivate ? password : null,
		  participants: [currentUser.uid],
		  captured: {},
		  shinyCaptured: {},
		  tracking: {} // Ajoutez cette ligne
		});
      
      navigate(`/hunt/${newHuntRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la chasse:", error);
      setError("Une erreur est survenue lors de la création de la chasse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-hunt-form">
      <h2>Créer une nouvelle chasse</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="huntName">Nom de la chasse:</label>
          <input
            type="text"
            id="huntName"
            value={huntName}
            onChange={(e) => setHuntName(e.target.value)}
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Chasse privée
          </label>
        </div>
        
        {isPrivate && (
          <div className="form-group">
            <label htmlFor="password">Mot de passe:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="4"
            />
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Création en cours...' : 'Créer la chasse'}
        </button>
      </form>
    </div>
  );
}