import { useScorers } from '../hooks/useTeams'

export default function PlayerStats({ limit = 10 }: { limit?: number }) {
  const { scorers, loading, error } = useScorers(limit)

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading scorers…</div>
  if (error) return <div className="text-red-400 text-sm p-4">Failed to load: {error}</div>
  if (!scorers.length) return <div className="text-slate-400 text-sm p-4">No scorer data yet.</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-2 px-3 text-slate-400 font-medium w-8">#</th>
            <th className="text-left py-2 px-3 text-slate-400 font-medium">Player</th>
            <th className="text-left py-2 px-3 text-slate-400 font-medium">Team</th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">G</th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">A</th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">P</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={s.player.id} className="border-b border-slate-800 hover:bg-slate-750 transition-colors">
              <td className="py-2 px-3 text-slate-500">{i + 1}</td>
              <td className="py-2 px-3">
                <div className="font-medium text-white">{s.player.name}</div>
                {s.player.nationality && (
                  <div className="text-xs text-slate-500">{s.player.nationality}</div>
                )}
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1.5">
                  {s.team.crest && (
                    <img src={s.team.crest} alt="" className="w-5 h-5 object-contain" />
                  )}
                  <span className="text-slate-300 text-xs">{s.team.tla ?? s.team.name}</span>
                </div>
              </td>
              <td className="py-2 px-3 text-right">
                <span className="font-bold text-green-400">{s.goals}</span>
              </td>
              <td className="py-2 px-3 text-right text-slate-400">{s.assists ?? '–'}</td>
              <td className="py-2 px-3 text-right text-slate-500 text-xs">{s.penalties ?? '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-600 px-3 pt-2">G = Goals · A = Assists · P = Penalties</p>
    </div>
  )
}
