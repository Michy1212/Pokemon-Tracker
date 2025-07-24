import { useState, useEffect } from 'react';
import Loading from '../ui/Loading';

export default function PokemonSprite({ pokedexId, isShiny, size = 96, className }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const shinyPath = isShiny ? 'shiny/' : '';
  const spritePath = `/sprites/pokemon/${shinyPath}${pokedexId}.png`;
  const fallbackPath = `/sprites/pokemon/0.png`;

  useEffect(() => {
    if (isShiny) {
      const img = new Image();
      img.src = spritePath;
      img.onerror = () => setError(true);
    }
  }, [isShiny, spritePath]);

  if (error) {
    return (
      <img
        src={fallbackPath}
        alt="fallback-normal"
        width={size}
        className={className}
      />
    );
  }

  return (
    <div style={{ 
	  position: 'relative', 
	  width: size, 
	  height: size, /* Déjà présent, mais ajustez la valeur */
	  marginBottom: '0' /* Ajouter si nécessaire */
	}}>
      {loading && <Loading small />}
      <img
        src={spritePath}
        alt={`pokemon-${pokedexId}`}
        width={size}
        className={className}
        style={{ display: loading ? 'none' : 'block' }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}