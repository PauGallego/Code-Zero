"use client";

import React, { useEffect, useState } from "react";

const ApiTournamentComponent: React.FC = () => {
  const tournamentUrl = "https://hackeps-poke-backend.azurewebsites.net/tournaments";
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";
  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons/";

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({}); // Para almacenar los nombres de los equipos
  const [pokemonNames, setPokemonNames] = useState<{ [key: string]: string }>({}); // Para almacenar los nombres de los pokemons

  // Función para obtener los torneos
  const fetchTournaments = async () => {
    try {
      const response = await fetch(tournamentUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Tournaments fetched successfully:", data);
      setTournaments(data);

      // Llamar a fetchWinnerNames para obtener los nombres de los ganadores
      const winnerIds = data.map((tournament: any) => tournament.winner).filter((winner: string) => winner);
      
      // Llamar a la función para obtener los nombres de los ganadores
      fetchWinnerNames(winnerIds);

      // Obtener los IDs de los pokemons
      const pokemonIds = data
        .flatMap((tournament: any) => tournament.teams)
        .flatMap((team: any) => team.pokemon_uuid_list);

      // Llamar a fetchPokemonNames para obtener los nombres de los pokemons
      fetchPokemonNames(pokemonIds);
      
    } catch (err: any) {
      console.error("Error fetching tournaments:", err.message);
      setError(err.message);
    }
  };

  // Función para obtener los nombres de los equipos ganadores
  const fetchWinnerNames = async (winnerIds: string[]) => {
    try {
      const uniqueIds = Array.from(new Set(winnerIds));  // Eliminar duplicados

      const nameMap: { [key: string]: string } = {}; // Mapa de IDs a nombres de equipos

      await Promise.all(
        uniqueIds.map(async (id) => {
          if (!id) {
            console.warn(`Invalid winner ID: ${id}`);
            return;
          }
          try {
            const response = await fetch(`${teamUrl}${id}`, { method: "GET" });
            if (response.ok) {
              const teamData = await response.json();
              nameMap[id] = teamData.name; // Guardamos el nombre del equipo
            } else {
              console.warn(`Failed to fetch team data for ID: ${id}`);
            }
          } catch (innerError) {
            console.error(`Error fetching team data for ID: ${id}`, innerError);
          }
        })
      );

      setTeamNames((prev) => ({ ...prev, ...nameMap }));
    } catch (outerError) {
      console.error("Error in fetchWinnerNames:", outerError);
    }
  };

  // Función para obtener los nombres de los Pokémon
  const fetchPokemonNames = async (pokemonIds: string[]) => {
    try {
      // Eliminar duplicados de IDs de Pokémon
      const uniquePokemonIds = Array.from(new Set(pokemonIds));

      const nameMap: { [key: string]: string } = {}; // Mapa de IDs de Pokémon a nombres

      await Promise.all(
        uniquePokemonIds.map(async (id) => {
          if (!id) {
            console.warn(`Invalid pokemon ID: ${id}`);
            return;
          }
          try {
            const response = await fetch(`${pokemonUrl}${id}`, { method: "GET" });
            if (response.ok) {
              const pokemonData = await response.json();
              nameMap[id] = pokemonData.name; // Guardamos el nombre del Pokémon
            } else {
              console.warn(`Failed to fetch pokemon data for ID: ${id}`);
            }
          } catch (innerError) {
            console.error(`Error fetching pokemon data for ID: ${id}`, innerError);
          }
        })
      );

      setPokemonNames((prev) => ({ ...prev, ...nameMap }));
    } catch (outerError) {
      console.error("Error in fetchPokemonNames:", outerError);
    }
  };

  // Formatear equipos para su presentación
  const formatTeams = (teams: any[]) => {
    return teams.map((team, index) => (
      <div key={index}>
        <p><strong>Team ID:</strong> {team.team_id}</p>
        <p><strong>Pokemons:</strong> {team.pokemon_uuid_list.map((id: string) => pokemonNames[id] || id).join(", ")}</p>
      </div>
    ));
  };

  // Formatear turnos de combate
  const formatCombatTurns = (turns: any[]) => {
    return turns.map((turn, index) => (
      <div key={index}>
        <p><strong>Pokemons:</strong> {turn.pokemons.map((id: string) => pokemonNames[id] || id).join(" vs. ")}</p>
        <p><strong>Winner:</strong> {turn.winner}</p>
      </div>
    ));
  };

  // Formatear combates del torneo
  const formatTournamentCombats = (combats: any[]) => {
    return combats.map((combat, index) => (
      <div key={index}>
        <p><strong>Teams:</strong> {combat.teams.join(" vs. ")}</p>
        <p><strong>Winner:</strong> {combat.winner}</p>
        <div><strong>Turns:</strong>{formatCombatTurns(combat.turns)}</div>
      </div>
    ));
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div>
      <h1>Tournaments</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {tournaments.length > 0 ? (
        <ul>
          {tournaments.map((tournament, index) => (
            <li key={index}>
              <h2>{tournament.id}</h2>
              <p><strong>Time:</strong> {new Date(tournament.time).toLocaleString()}</p>
              <p><strong>Can Register:</strong> {tournament.can_register ? "Yes" : "No"}</p>
              <p><strong>Winner:</strong> {teamNames[tournament.winner] || "No winner yet"}</p>
              <div><strong>Teams:</strong>{formatTeams(tournament.teams)}</div>
              <div><strong>Positions:</strong>{formatTeams(tournament.teams_positions)}</div>
              <div><strong>Combats:</strong>{formatTournamentCombats(tournament.tournament_combats)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading tournaments...</p>
      )}
    </div>
  );
};

export default ApiTournamentComponent;
