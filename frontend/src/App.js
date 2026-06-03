// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamColumn from './components/TeamColumn';
import ValidationTable from './components/ValidationTable';

function App() {
  const [teams, setTeams] = useState([]);
  const [columns, setColumns] = useState([
    { teamId: '', players: [], selected: [] },
    { teamId: '', players: [], selected: [] }
  ]);
  const [showDestinations, setShowDestinations] = useState(false);
  const [assetDestinations, setAssetDestinations] = useState({});
  const [validation, setValidation] = useState(null);
  const [validationEnabled, setValidationEnabled] = useState(false);

  // Load all teams on mount
  useEffect(() => {
    axios.get('/api/teams')
      .then(res => setTeams(res.data))
      .catch(console.error);
  }, []);

  // Check if all assets have destinations assigned
  useEffect(() => {
    if (columns.length === 3 && showDestinations) {
      const allAssets = columns.flatMap(col => 
        col.selected.map(pid => ({ id: pid }))
      );
      
      const allAssigned = allAssets.every(asset => assetDestinations[asset.id]);
      setValidationEnabled(allAssigned);
    } else {
      setValidationEnabled(columns.length === 2);
    }
  }, [columns, assetDestinations, showDestinations]);

  // Handle selecting a team
  const handleTeamChange = (idx, teamId) => {
    setValidation(null);
    setShowDestinations(false);
    setAssetDestinations({});
    const cols = [...columns];
    cols[idx] = { teamId, players: [], selected: [] };
    setColumns(cols);

    if (teamId) {
      axios.get(`/api/teams/${teamId}/players`)
        .then(res => {
          cols[idx].players = res.data;
          setColumns([...cols]);
        })
        .catch(console.error);
    }
  };

  // Handle toggling a player/pick
  const handleTogglePlayer = (idx, playerId) => {
    setValidation(null);
    setShowDestinations(false);
    setAssetDestinations({});
    const cols = [...columns];
    const sel = cols[idx].selected;
    cols[idx].selected = sel.includes(playerId)
      ? sel.filter(id => id !== playerId)
      : [...sel, playerId];
    setColumns(cols);
  };

  // Add/remove up to 3 teams
  const addColumn = () => {
    setShowDestinations(false);
    setAssetDestinations({});
    if (columns.length < 3) {
      setColumns([...columns, { teamId: '', players: [], selected: [] }]);
    }
  };
  
  const removeColumn = idx => {
    setShowDestinations(false);
    setAssetDestinations({});
    setColumns(columns.filter((_, i) => i !== idx));
  };

  // Gather all selected assets (players+picks) with their origin
  const assets = columns.flatMap(col =>
    col.selected.map(pid => {
      const p = col.players.find(x => x.id === pid);
      const team = teams.find(t => t.id === parseInt(col.teamId, 10));
      return {
        id: pid,
        name: p?.name || 'Unknown Player',
        fromTeamId: parseInt(col.teamId, 10),
        fromTeamName: team ? team.name : ''
      };
    })
  ).sort((a, b) => a.fromTeamName.localeCompare(b.fromTeamName));

  // Show the "Assign Destinations" UI
  const handleShowDestinations = () => setShowDestinations(true);

  // Track per-asset destination
  const handleDestinationChange = (assetId, toId) => {
    setAssetDestinations({
      ...assetDestinations,
      [assetId]: toId
    });
  };

  // Get only the teams involved in the trade for dropdowns
  const getInvolvedTeams = (fromTeamId) => {
    return columns
      .filter(col => col.teamId && parseInt(col.teamId, 10) !== fromTeamId)
      .map(col => teams.find(t => t.id === parseInt(col.teamId, 10)))
      .filter(Boolean);
  };

  // Build and send the trade payload
  const validateTrade = () => {
    const tradesMap = {};

    if (columns.length === 3) {
      // Must have assigned destinations
      if (!showDestinations) {
        alert('Please click "Assign Destinations" first.');
        return;
      }
      
      const missing = assets.find(a => !assetDestinations[a.id]);
      if (missing) {
        alert('Please select a destination for every asset.');
        return;
      }

      // Group by from→to
      assets.forEach(a => {
        const from = a.fromTeamId;
        const to = parseInt(assetDestinations[a.id], 10);
        const key = `${from}-${to}`;
        if (!tradesMap[key]) {
          tradesMap[key] = { from, to, playerIds: [] };
        }
        tradesMap[key].playerIds.push(a.id);
      });

    } else {
      // Two-team swap: 0→1 and 1→0
      const [c0, c1] = columns;
      const t0 = parseInt(c0.teamId, 10);
      const t1 = parseInt(c1.teamId, 10);
      tradesMap[`${t0}-${t1}`] = { from: t0, to: t1, playerIds: c0.selected };
      tradesMap[`${t1}-${t0}`] = { from: t1, to: t0, playerIds: c1.selected };
    }

    const trades = Object.values(tradesMap);
    axios.post('/api/validate-trade', { trades })
      .then(res => setValidation(res.data))
      .catch(() => alert('Error validating trade'));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">NBA Trade Machine</h1>

      {/* Team columns */}
      <div className="flex space-x-4">
        {columns.map((col, i) => {
          // Prevent selecting the same team twice
          const taken = columns
            .filter((_, j) => j !== i)
            .map(c => c.teamId)
            .filter(Boolean)
            .map(id => parseInt(id, 10));
          const availableTeams = teams.filter(t => !taken.includes(t.id));

          return (
            <TeamColumn
              key={i}
              index={i}
              teams={availableTeams}
              col={col}
              onTeamChange={handleTeamChange}
              onTogglePlayer={handleTogglePlayer}
              onRemove={removeColumn}
              canRemove={columns.length > 2}
            />
          );
        })}

        {columns.length < 3 && (
          <button
            className="self-start px-4 py-2 bg-blue-600 text-white rounded"
            onClick={addColumn}
          >
            + Add Team
          </button>
        )}
      </div>

      {/* Destinations step (3rd-team case) */}
      {columns.length === 3 && assets.length > 0 && !showDestinations && (
        <button
          className="px-6 py-2 bg-yellow-500 text-black rounded"
          onClick={handleShowDestinations}
        >
          Assign Destinations
        </button>
      )}

      {showDestinations && (
        <div className="mt-4 p-4 border rounded bg-white text-black">
          <h2 className="text-xl font-semibold mb-2">Assign Destinations</h2>
          {assets.map(a => (
            <div key={a.id} className="mb-2 flex items-center">
              <span className="w-1/3">
                {a.fromTeamName}: {a.name}
              </span>
              <select
                className="ml-4 p-1 border rounded"
                value={assetDestinations[a.id] || ''}
                onChange={e => handleDestinationChange(a.id, e.target.value)}
              >
                <option value="">Select Team</option>
                {getInvolvedTeams(a.fromTeamId).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Validate button */}
      <button
        className={`px-6 py-3 ${validationEnabled ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white rounded`}
        onClick={validateTrade}
        disabled={!validationEnabled}
      >
        Validate Trade
      </button>

      {/* Results */}
      {validation && (
        <ValidationTable validation={validation} />
      )}
    </div>
  );
}

export default App;