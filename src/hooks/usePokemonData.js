import { useState, useEffect } from 'react';

export default function usePokemonData() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=898');
        const data = await res.json();
        
        const formatted = data.results.map((p, i) => ({
          id: i + 1,
          pokedexId: i + 1,
          name: p.name,
          spriteUrl: `/sprites/pokemon/${i+1}.png`,
          shinySpriteUrl: `/sprites/pokemon/shiny/${i+1}.png`
        }));

        setPokemonList(formatted);
      } catch (error) {
        console.error("Error fetching pokemon data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { pokemonList, loading };
}