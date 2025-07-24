import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function JoinPrivateHunt() {
  const [huntName, setHuntName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Connectez-vous d\'abord');
      return;
    }

    const searchTerm = huntName.trim().toLowerCase();
    if (!searchTerm) {
      setError('Entrez un nom valide');
      return;
    }

    try {
      // 1. Recherche EXACTE (insensible à la casse)
      const q = query(
        collection(db, 'hunts'),
        where('nameSearch', '==', searchTerm)
      );

      const snapshot = await getDocs(q);
      
      // 2. Vérification des résultats
      if (snapshot.empty) {
        setError(`Vérifiez:
        - L'orthographe exacte (${searchTerm})
        - Que la chasse existe
        - Que vous avez les permissions`);
        return;
      }

      const huntDoc = snapshot.docs[0];
      const hunt = huntDoc.data();

      // 3. Vérifications de sécurité
      if (hunt.isPrivate) {
        if (!password || hunt.password !== password) {
          setError(hunt.password 
            ? 'Mot de passe requis' 
            : 'Erreur de configuration');
          return;
        }
      }

      // 4. Ajout du participant
      if (!hunt.participants.includes(currentUser.uid)) {
        await updateDoc(huntDoc.ref, {
          participants: arrayUnion(currentUser.uid)
        });
      }

      navigate(`/hunt/${huntDoc.id}`);

    } catch (err) {
      console.error(err);
      setError('Erreur technique - Réessayez');
    }
  };

  return (
    <div className="join-form">
      <h2>Rejoindre une chasse</h2>
      
      <form onSubmit={handleJoin}>
        <input
          type="text"
          value={huntName}
          onChange={(e) => setHuntName(e.target.value)}
          placeholder="Nom EXACT de la chasse"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (si privée)"
        />

        {error && <div className="error">{error}</div>}

        <button type="submit">Rejoindre</button>
      </form>
    </div>
  );
}