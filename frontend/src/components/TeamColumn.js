// src/components/TeamColumn.js
import React, { useState } from 'react';

export default function TeamColumn({
  index,
  teams,
  col,
  onTeamChange,
  onTogglePlayer,
  onRemove,
  canRemove
}) {
  // Local state for toggling view
  const [view, setView] = useState('players'); // 'players' or 'picks'

  // Split full list into players vs. picks
  const realPlayers = col.players.filter(p => !p.isPick);
  const picks       = col.players.filter(p => p.isPick);

  // Decide which to render
  const listToShow = view === 'players' ? realPlayers : picks;

  return (
    <div className="w-1/3 border rounded p-4 flex flex-col bg-white">
      {/* Team selector */}
      <select
        className="mb-4 p-2 border rounded"
        value={col.teamId}
        onChange={e => {
          onTeamChange(index, e.target.value)
          setView('players')      // reset view whenever team changes
        }}
      >
        <option value="">– Select Team –</option>
        {teams.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Only show toggle once a team is selected */}
      {col.teamId && (
        <div className="mb-4">
          <select
            className="p-1 border rounded"
            value={view}
            onChange={e => setView(e.target.value)}
          >
            <option value="players">Players</option>
            <option value="picks">Draft Picks</option>
          </select>
        </div>
      )}

      {/* Render the chosen list */}
      <div className="flex-1 overflow-auto">
        {listToShow.length === 0 ? (
          <p className="text-center text-gray-500">
            {view === 'players'
              ? 'No players available.'
              : 'No draft picks available.'}
          </p>
        ) : (
          listToShow.map(p => (
            <label
              key={p.id}
              className={`flex items-center mb-2 ${
                p.isPick ? 'italic text-gray-500' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={col.selected.includes(p.id)}
                onChange={() => onTogglePlayer(index, p.id)}
              />
              <span className="ml-2">
                {p.name}
                {p.salary > 0 && (
                  <span className="text-gray-600">
                    {' '}
                    (${p.salary.toLocaleString()})
                  </span>
                )}
              </span>
            </label>
          ))
        )}
      </div>

      {/* Remove button for 3+ columns */}
      {canRemove && (
        <button
          className="mt-4 text-sm text-red-600 hover:underline"
          onClick={() => onRemove(index)}
        >
          Remove Team
        </button>
      )}
    </div>
  );
}
