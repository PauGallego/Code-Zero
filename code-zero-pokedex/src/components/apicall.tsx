"use client";

import React, { useEffect, useState } from "react";

const ApiCycleComponent: React.FC = () => {
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";
  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons/";
  const teamId = "63bf06cf-e720-4134-9252-f195668c6048";

  const [teamData, setTeamData] = useState<any>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = async () => {
    const url = `${teamUrl}${teamId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Team data fetched successfully:", data);
      setTeamData(data);
    } catch (err: any) {
      console.error("Error fetching team data:", err.message);
      setError(err.message);
    }
  };

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
      setPokemonDetails((prev) => [...prev, data]);
    } catch (err: any) {
      console.error(`Error fetching data for Pokemon ID ${pokemonId}:`, err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTeamData();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (teamData && teamData.captured_pokemons) {
      teamData.captured_pokemons.forEach((pokemon: { pokemon_id: string }) => {
        fetchPokemonDetails(pokemon.pokemon_id);
      });
    }
  }, [teamData]);

  return (
    <div>
      <h1>Team Info</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {teamData ? (
        <div>
          <h2>{teamData.name}</h2>
          <p>PVE Score: {teamData.pve_score}</p>
          <p>PVP Score: {teamData.pvp_score}</p>
          <p>Pokedex Score: {teamData.pokedex_score}</p>
        </div>
      ) : (
        <p>Loading team data...</p>
      )}
      <h1>Captured Pokemons</h1>
      {pokemonDetails.length > 0 ? (
        <ul>
          {pokemonDetails.map((pokemon, index) => (
            <li key={index}>
              <p>
                <strong>ID:</strong> {pokemon.id}
              </p>
              <p>
                <strong>Name:</strong> {pokemon.name}
              </p>
              {/* Add more Pokémon details as needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading Pokémon details...</p>
      )}
    </div>
  );
};

export default ApiCycleComponent;
