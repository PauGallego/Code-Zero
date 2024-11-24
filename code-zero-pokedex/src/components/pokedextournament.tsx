"use client";

import React, { useEffect, useState } from "react";

const ApiTournamentComponent: React.FC = () => {
  const tournamentUrl = "https://hackeps-poke-backend.azurewebsites.net/tournaments";
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({}); // Para almacenar los nombres de los equipos

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
    } catch (err: any) {
      console.error("Error fetching tournaments:", err.message);
      setError(err.message);
    }
  };

  // Función para obtener los nombres de los equipos ganadores
  const fetchWinnerNames = async (winnerIds: string[]) => {
    try {
      // Eliminar duplicados de los IDs
      const uniqueIds = Array.from(new Set(winnerIds));
      
      const nameMap: { [key: string]: string } = {}; // Mapa de IDs a nombres de equipos

      // Realizar todas las solicitudes en paralelo
      await Promise.all(
        uniqueIds.map(async (id) => {
          if (!id) {
            console.warn(`Invalid winner ID: ${id}`);
            return;
          }
          
        })
      );

      // Actualizamos el estado con los nombres obtenidos
      setTeamNames((prev) => ({ ...prev, ...nameMap }));
    } catch (outerError) {
      console.error("Error in fetchWinnerNames:", outerError);
    }
  };

  // Formatear equipos para su presentación
  const formatTeams = (teams: any[]) => {
    return teams.map((team, index) => (
      <div key={index}>
        <p><strong>Team ID:</strong> {team.team_id}</p>
      </div>
    ));
  };

  // Formatear turnos de combate
  const formatCombatTurns = (turns: any[]) => {
    return turns.map((turn, index) => (
      <div key={index}>

        <p><strong>Winner:</strong> {turn.winner}</p>
      </div>
    ));
  };

  // Formatear combates del torneo
  const formatTournamentCombats = (combats: any[]) => {
    return combats.map((combat, index) => (
      <div key={index}>
        <p><strong>Winner:</strong> {combat.winner}</p>
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
              <h2>Id Torneo: {tournament.id}</h2>
              <p><strong>Time:</strong> {new Date(tournament.time).toLocaleString()}</p>
              <p><strong>Can Register:</strong> {tournament.can_register ? "Yes" : "No"}</p>
              
              {/* Mostrar el nombre del ganador si existe */}
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
