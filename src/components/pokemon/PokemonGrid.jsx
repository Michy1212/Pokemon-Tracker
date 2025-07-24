import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import PokemonCard from './PokemonCard';
import { pokemonList } from './pokemonData';

export default function PokemonGrid() {
  const { huntId } = useParams();
  const { currentUser } = useAuth();
  const [hunt, setHunt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [captureFilter, setCaptureFilter] = useState('all');
  const [pokemons, setPokemons] = useState([]);
  const navigate = useNavigate();

  // Chargement des données de la chasse et initialisation des Pokémon
  useEffect(() => {
    if (!huntId) return;

    const unsubscribe = onSnapshot(doc(db, 'hunts', huntId), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const huntData = docSnapshot.data();
        
        // Charger les informations des participants
        const participantsInfo = {};
        if (huntData.participants?.length > 1) {
          const userDocs = await Promise.all(
            huntData.participants.map(uid => getDoc(doc(db, 'users', uid)))
          );
          
          userDocs.forEach((userDoc, index) => {
            if (userDoc.exists()) {
              participantsInfo[huntData.participants[index]] = {
                username: userDoc.data().username || userDoc.data().email
              };
            }
          });
        }

        setHunt({ 
          id: docSnapshot.id, 
          ...huntData,
          participantsInfo 
        });

        // Fusionner les données de base avec les captures
        const mergedPokemons = pokemonList.map(pokemon => {
          return {
            ...pokemon,
            capturedBy: huntData.captured?.[pokemon.id] || [],
            shinyCapturedBy: huntData.shinyCaptured?.[pokemon.id] || [],
            trackingBy: huntData.tracking?.[pokemon.id] || []
          };
        });

        setPokemons(mergedPokemons);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [huntId, currentUser]);


  const handleCapture = async (pokemonId, captureStatus) => {
	  if (!currentUser || !hunt) return;

	  const huntRef = doc(db, 'hunts', hunt.id);
	  
	  try {
		const updates = {};
		
		// Pour la capture normale
		updates[`captured.${pokemonId}`] = captureStatus.normal 
		  ? arrayUnion(currentUser.uid)
		  : arrayRemove(currentUser.uid);
		
		// Pour la capture shiny
		updates[`shinyCaptured.${pokemonId}`] = captureStatus.shiny 
		  ? arrayUnion(currentUser.uid)
		  : arrayRemove(currentUser.uid);

		// Pour le tracking
		updates[`tracking.${pokemonId}`] = captureStatus.tracking 
		  ? arrayUnion(currentUser.uid)
		  : arrayRemove(currentUser.uid);

		await updateDoc(huntRef, updates);
	  } catch (error) {
		console.error("Erreur lors de la mise à jour de la capture:", error);
	  }
	};
  
	const getPokemonsWithCaptures = () => {
	  if (!pokemons.length || !hunt) return pokemons;

	  return pokemons.map(pokemon => {
		const capturedBy = hunt.captured?.[pokemon.id] || [];
		const shinyCapturedBy = hunt.shinyCaptured?.[pokemon.id] || [];
		const trackingBy = hunt.tracking?.[pokemon.id] || [];
		
		return {
		  ...pokemon,
		  captured: capturedBy.includes(currentUser?.uid),
		  shinyCaptured: shinyCapturedBy.includes(currentUser?.uid),
		  tracking: trackingBy.includes(currentUser?.uid),
		  capturedBy,
		  shinyCapturedBy,
		  trackingBy // Ajoutez cette ligne
		};
	  });
	};
	
	const ParticipantLegend = ({ participants }) => {
	  if (!participants || participants.length <= 1) return null;

	  return (
		<div className="participant-legend">
		  <h3>Légende des participants:</h3>
		  <div className="legend-items">
			{participants.map((uid) => {
			  const participant = hunt.participantsInfo?.[uid] || { username: 'Inconnu' };
			  const isCurrentUser = uid === currentUser?.uid;
			  return (
				<div key={uid} className="legend-item">
				  <span 
					className="legend-color" 
					style={{ 
					  backgroundColor: getParticipantColor(uid),
					  transform: isCurrentUser ? 'scale(1.2)' : 'scale(1)',
					  border: isCurrentUser ? '2px solid #333' : '1px solid #ddd'
					}}
				  />
				  <span>
					{participant.username} 
					{isCurrentUser && ' (Vous)'}
					{uid === hunt.creatorId && ' (Créateur)'}
				  </span>
				</div>
			  );
			})}
		  </div>
		</div>
	  );
	};

	// Ajoutez cette fonction utilitaire au début du composant (identique à celle dans PokemonCard)
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

  // Filtrage des Pokémon
  const pokemonsWithCaptures = getPokemonsWithCaptures();
	const filteredPokemons = pokemonsWithCaptures.filter(pokemon => {
	  const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
	  const matchesGeneration = selectedGeneration === 'all' || pokemon.generation.toString() === selectedGeneration;
	  const matchesType = selectedType === 'all' || pokemon.type.split(', ').includes(selectedType);
	  const matchesCaptureStatus = 
		captureFilter === 'all' || 
		(captureFilter === 'captured' && pokemon.capturedBy?.includes(currentUser?.uid)) || 
		(captureFilter === 'notCaptured' && !pokemon.capturedBy?.includes(currentUser?.uid));
	  
	  return matchesSearch && matchesGeneration && matchesType && matchesCaptureStatus;
	});

  // Génération des options de filtre
  const generations = [...new Set(pokemonList.map(p => p.generation))].sort();
  const types = [...new Set(pokemonList.flatMap(p => p.type.split(', ')))].sort();

  if (loading) return <div>Chargement...</div>;
  if (!hunt) return <div>Chasse non trouvée</div>;

  return (
    <div className="pokemon-grid">
	  
	  <div className="grid-header">
		<h1>Tracker de Captures - {hunt.name}</h1>
		<button 
		  onClick={() => navigate('/')}
		  className="back-button"
		>
		  ← Retour aux chasses
		</button>
	  </div>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          value={selectedGeneration} 
          onChange={(e) => setSelectedGeneration(e.target.value)}
        >
          <option value="all">Toutes générations</option>
          {generations.map(gen => (
            <option key={gen} value={gen}>Génération {gen}</option>
          ))}
        </select>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">Tous types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={captureFilter}
          onChange={(e) => setCaptureFilter(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="captured">Capturés</option>
          <option value="notCaptured">Non capturés</option>
        </select>
      </div>
	  
	  <ParticipantLegend participants={hunt.participants} />
      
      <div className="grid-container">
        {filteredPokemons.map(pokemon => (
          <PokemonCard 
			  key={pokemon.id}
			  pokemon={pokemon}
			  userId={currentUser?.uid}
			  onCapture={handleCapture}
			  hunt={hunt} // Add this line
			/>
        ))}
      </div>
    </div>
  );
}