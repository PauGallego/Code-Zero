"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Importar el hook useSearchParams
// ejemplo http://localhost:3000/?id=1
const PokemonDetailsComponent: React.FC = () => {
  const searchParams = useSearchParams(); // Obtenemos los parámetros de búsqueda de la URL
  const id = searchParams.get("id"); // Obtenemos el valor de 'id' de la URL

  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons/";

  const [pokemonData, setPokemonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los detalles del Pokémon
  const fetchPokemonDetails = async (pokemonId: string) => {
    const url = `${pokemonUrl}${pokemonId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Pokemon data for ID ${pokemonId} fetched successfully:`, data);
      setPokemonData(data);
    } catch (err: any) {
      console.error(`Error fetching data for Pokemon ID ${pokemonId}:`, err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (id) {
      // Si el ID está disponible, hacer la solicitud
      fetchPokemonDetails(id);
    }
  }, [id]);

  return (
    <div>
      <h1>Pokemon Details</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {pokemonData ? (
        <div>
          <h2>{pokemonData.name}</h2>
          <img src={pokemonData.image} alt={pokemonData.name} />
          <p><strong>Height:</strong> {pokemonData.height} meters</p>
          <p><strong>Weight:</strong> {pokemonData.weight} kg</p>
          <p><strong>Cries:</strong> {pokemonData.cries}</p>

          <h3>Abilities</h3>
          <ul>
            {pokemonData.abilities.map((ability: any, index: number) => (
              <li key={index}>
                <strong>{ability.ability.name}</strong> (Hidden: {ability.is_hidden ? "Yes" : "No"})
              </li>
            ))}
          </ul>

          <h3>Types</h3>
          <ul>
            {pokemonData.types.map((type: any, index: number) => (
              <li key={index}>{type.type.name}</li>
            ))}
          </ul>

          <h3>Moves</h3>
          <ul>
            {pokemonData.moves.map((move: any, index: number) => (
              <li key={index}>{move.name}</li>
            ))}
          </ul>

          <h3>Stats</h3>
          <ul>
            {pokemonData.stats.map((stat: any, index: number) => (
              <li key={index}>
                {stat.stat.name}: {stat.base_stat} (Effort: {stat.effort})
              </li>
            ))}
          </ul>

          {pokemonData.evolves_to && (
            <div>
              <h3>Evolves To:</h3>
              <p>{pokemonData.evolves_to.name} (ID: {pokemonData.evolves_to.id})</p>
            </div>
          )}

          <h3>Location Areas</h3>
          <ul>
            {pokemonData.location_area_encounters.map((location: string, index: number) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading Pokémon details...</p>
      )}
    </div>
  );
};

export default PokemonDetailsComponent;
