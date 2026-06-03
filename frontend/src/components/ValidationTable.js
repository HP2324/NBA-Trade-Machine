// src/components/ValidationTable.js
import React from 'react';

export default function ValidationTable({ validation }) {
  return (
    <div className="mt-6 p-4 border rounded bg-gray-50 text-black">
      <h2 className="text-2xl font-semibold mb-4">
        Trade is {validation.valid
          ? <span className="text-green-700">Valid ✅</span>
          : <span className="text-red-700">Invalid ❌</span>}
      </h2>

      <table className="w-full mt-4 table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Team</th>
            <th className="border px-2 py-1">Outgoing</th>
            <th className="border px-2 py-1">Incoming</th>
            <th className="border px-2 py-1">Max Allowed</th>
            <th className="border px-2 py-1">Difference</th>
            <th className="border px-2 py-1">OK?</th>
          </tr>
        </thead>
        <tbody>
          {validation.breakdown.map(b => {
            const diff = b.incomingSum - b.maxAllowed;
            return (
              <tr key={b.teamId}>
                <td className="border px-2 py-1">{b.teamName}</td>
                <td className="border px-2 py-1">
                  ${b.outgoingSum.toLocaleString()}
                </td>
                <td className="border px-2 py-1">
                  ${b.incomingSum.toLocaleString()}
                </td>
                <td className="border px-2 py-1">
                  ${b.maxAllowed.toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-right">
                  {b.isMatchOk
                    ? '—'
                    : `$${Math.abs(diff).toLocaleString()}`}
                </td>
                <td className="border px-2 py-1 text-center">
                  {b.isMatchOk ? '✅' : '❌'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!validation.valid && (
        <p className="mt-4 text-red-700">
          Each ❌ row shows the salary difference that must be added to outgoing side to satisfy the 125% + $100K rule.
        </p>
      )}
    </div>
  );
}
