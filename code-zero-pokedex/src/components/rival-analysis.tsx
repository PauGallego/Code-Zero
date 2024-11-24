import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ApiTournamentComponent: React.FC = () => {
  const tournamentUrl = "https://hackeps-poke-backend.azurewebsites.net/tournaments";
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [combatLosers, setCombatLosers] = useState<{ [combatId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(tournamentUrl, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setTournaments(data);
    } catch (err: any) {
      console.error("Error fetching tournaments:", err.message);
      setError(err.message);
    }
  };

  const fetchTeamName = async (id: string): Promise<string> => {
    if (teamNames[id]) return teamNames[id];
    try {
      const response = await fetch(`${teamUrl}${id}`, { method: "GET" });
      if (!response.ok) throw new Error(`Failed to fetch team ${id}`);
      const teamData = await response.json();
      setTeamNames((prev) => ({ ...prev, [id]: teamData.name || `Team ${id}` }));
      return teamData.name || `Team ${id}`;
    } catch (err: any) {
      console.error(`Error fetching team ${id}:`, err.message);
      return `Team ${id}`;
    }
  };

  const prefetchTeams = async (teamIds: string[]) => {
    const uniqueIds = teamIds.filter((id) => !teamNames[id]);
    const fetchPromises = uniqueIds.map((id) => fetchTeamName(id));
    try {
      await Promise.all(fetchPromises);
    } catch (err) {
      console.error("Error prefetching team names:", err);
    }
  };

  const resolveCombatLosers = async (tournament: any) => {
    const allLoserIds = tournament.tournament_combats.flatMap((combat: any) =>
      combat.teams.filter((id: string) => id !== combat.winner)
    );
    await prefetchTeams(allLoserIds);

    const losersMap: { [combatId: string]: string } = {};
    tournament.tournament_combats.forEach((combat: any) => {
      const loserIds = combat.teams.filter((id: string) => id !== combat.winner);
      const loserNames = loserIds.map((id) => teamNames[id]);
      losersMap[combat.id] = loserNames.join(", ");
    });
    setCombatLosers(losersMap);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleTournamentClick = async (tournament: any) => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      setSelectedTournament(tournament);
      await resolveCombatLosers(tournament);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setSelectedTournament(null);
    setCombatLosers({});
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
              {tournament.winner && (
                <button
                  onClick={() => handleTournamentClick(tournament)}
                  disabled={isLoading} // Disable button during loading
                  className={`mt-2 px-4 py-2 rounded ${
                    isLoading
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isLoading ? "Loading..." : "View Leaderboard"}
                </button>
              )}
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
            {isLoading ? (
              <p>Loading leaderboard...</p>
            ) : (
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
                          {teamNames[team.team_id] || ` ${team.team_id}`}
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
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTournament.tournament_combats.map((combat: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-1">
                          {teamNames[combat.winner] || `${combat.winner}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
