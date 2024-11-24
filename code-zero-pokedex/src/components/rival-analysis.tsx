'use client';

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ApiTournamentComponent: React.FC = () => {
  const tournamentUrl = "https://hackeps-poke-backend.azurewebsites.net/tournaments";
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  // Fetch tournaments
  const fetchTournaments = async () => {
    try {
      const response = await fetch(tournamentUrl, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setTournaments(data);

      // Collect all team IDs from tournaments (including winners)
      const teamIds = Array.from(
        new Set([
          ...data.flatMap((tournament: any) => tournament.teams.map((team: any) => team.team_id)),
          ...data.map((tournament: any) => tournament.winner).filter((id: string) => id),
        ])
      );
      fetchTeamNames(teamIds);
    } catch (err: any) {
      console.error("Error fetching tournaments:", err.message);
      setError(err.message);
    }
  };

  // Fetch team names
  const fetchTeamNames = async (teamIds: string[]) => {
    try {
      const nameMap: { [key: string]: string } = {};
      await Promise.all(
        teamIds.map(async (id) => {
          const response = await fetch(`${teamUrl}${id}`, { method: "GET" });
          if (!response.ok) return;
          const teamData = await response.json();
          nameMap[id] = teamData.name || `Team ${id}`;
        })
      );
      setTeamNames((prev) => ({ ...prev, ...nameMap }));
    } catch (err: any) {
      console.error("Error fetching team names:", err.message);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleTournamentClick = (tournament: any) => {
    setSelectedTournament(tournament);
  };

  const handleDialogClose = () => {
    setSelectedTournament(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tournament Leaderboards</h2>
      {error && <p className="text-red-500">{error}</p>}
      {tournaments.length > 0 ? (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="p-4 border rounded-lg shadow">
              <h2 className="text-lg font-bold">Tournament ID: {tournament.id}</h2>
              <p><strong>Time:</strong> {new Date(tournament.time).toLocaleString()}</p>
              <p>
                <strong>Winner:</strong>{" "}
                {tournament.winner
                  ? teamNames[tournament.winner] || `Team ${tournament.winner}`
                  : "No winner yet"}
              </p>
              <button
                onClick={() => handleTournamentClick(tournament)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                View Leaderboard
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading tournaments...</p>
      )}

      {selectedTournament && (
        <Dialog open={!!selectedTournament} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Tournament ID: {selectedTournament.id}
              </DialogTitle>
              <DialogDescription>
                Leaderboard and Match Results
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto h-[400px]">
              <h3 className="text-lg font-bold mb-2">Rankings</h3>
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">Rank</th>
                    <th className="border border-gray-300 px-2 py-1">Team Name</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTournament.teams_positions.map((team: any, index: number) => (
                    <tr key={team.team_id}>
                      <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {teamNames[team.team_id] || `Team ${team.team_id}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-bold mt-4 mb-2">Match Results</h3>
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">Match</th>
                    <th className="border border-gray-300 px-2 py-1">Winner</th>
                    <th className="border border-gray-300 px-2 py-1">Loser</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTournament.tournament_combats.map((combat: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {teamNames[combat.winner] || `Team ${combat.winner}`}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {teamNames[combat.loser] || `Team ${combat.loser}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleDialogClose}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApiTournamentComponent;
