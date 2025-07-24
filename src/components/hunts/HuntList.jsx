import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDoc } from 'firebase/firestore';
import { 
  collection, 
  query, 
  where, 
  doc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import './HuntList.css';

export default function HuntList() {
  const [hunts, setHunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
	  if (!currentUser) {
		setHunts([]);
		setLoading(false);
		return;
	  }

	  let unsubscribe;
	  const setupRealtimeUpdates = async () => {
		try {
		  const q = query(
			collection(db, 'hunts'),
			where('participants', 'array-contains', currentUser.uid)
		  );

		  unsubscribe = onSnapshot(q, async (querySnapshot) => {
			  const huntsData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
				const huntData = docSnap.data();
				
				// Récupérer les informations du créateur
				let creatorName = 'Autre utilisateur';
				if (huntData.creatorId) {
				  const creatorDoc = await getDoc(doc(db, 'users', huntData.creatorId));
				  if (creatorDoc.exists()) {
					creatorName = creatorDoc.data().username || creatorDoc.data().email;
				  }
				}

				return {
				  id: docSnap.id,
				  ...huntData,
				  creatorName
				};
			  }));

			  huntsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
			  setHunts(huntsData);
			  setLoading(false);
			});
		} catch (error) {
		  console.error("Erreur:", error);
		  setLoading(false);
		}
	  };

	  setupRealtimeUpdates();
	  return () => {
		if (unsubscribe) unsubscribe();
	  };
	}, [currentUser]);

  const handleDeleteHunt = async (huntId, e) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette chasse ?")) {
      try {
        await deleteDoc(doc(db, 'hunts', huntId));
      } catch (error) {
        console.error("Erreur lors de la suppression de la chasse:", error);
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="hunt-list">
      <div className="auth-buttons">
		  {currentUser ? (
			<>
			  <span>Connecté en tant que {currentUser.username || currentUser.email}</span>
			  <button 
				onClick={() => navigate('/profile')} 
				className="auth-btn profile"
			  >
				Profil
			  </button>
			  <button onClick={logout} className="auth-btn logout">
				Déconnexion
			  </button>
			</>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')} 
              className="auth-btn login"
            >
              Connexion
            </button>
            <button 
              onClick={() => navigate('/login?register=true')} 
              className="auth-btn register"
            >
              Inscription
            </button>
          </>
        )}
      </div>

      <h1>Chasses Pokémon Actives</h1>
      {currentUser ? (
        <>
          <div className="hunt-actions">
            <button 
              className="create-hunt-btn"
              onClick={() => navigate('/hunt/new')}
            >
              + Créer une nouvelle chasse
            </button>
            <Link 
              to="/join-private" 
              className="join-private-btn"
            >
              Rejoindre une chasse privée
            </Link>
          </div>

          <div className="hunt-grid">
            {hunts.map(hunt => (
              <div 
                key={hunt.id} 
                className="hunt-card"
                onClick={() => navigate(`/hunt/${hunt.id}`)}
              >
                <div className="hunt-card-header">
					<h3>{hunt.name}</h3>
					{hunt.creatorId === currentUser.uid && (
					  <button 
						className="delete-hunt-btn"
						onClick={(e) => handleDeleteHunt(hunt.id, e)}
						title="Supprimer cette chasse"
					  >
						×
					  </button>
					)}
				  </div>
				  <p>Créé par: {hunt.creatorId === currentUser.uid ? 'Vous' : hunt.creatorName}</p>
				  <p>Participants: {hunt.participants?.length || 1}</p>
				  {hunt.isPrivate && <span className="private-badge">Privée</span>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="login-prompt">
          <p>Veuillez vous connecter pour voir vos chasses ou en créer une nouvelle.</p>
        </div>
      )}
    </div>
  );
}