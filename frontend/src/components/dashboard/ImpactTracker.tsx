export function ImpactTracker() {
    const impactData = [
      { project: 'Ethereum Core Development', funded: 12500, total: 15000, color: 'bg-slate-500', icon: '⚙️' },
      { project: 'Web3 Education Programs', funded: 8400, total: 10000, color: 'bg-blue-500', icon: '📚' },
      { project: 'Developer Tools & Infrastructure', funded: 6700, total: 8000, color: 'bg-emerald-500', icon: '🛠️' },
      { project: 'Security Research & Audits', funded: 5300, total: 7000, color: 'bg-violet-500', icon: '🔒' },
    ]
  
    const totalImpact = impactData.reduce((sum, item) => sum + item.funded, 0)
  
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Your Impact</h2>
          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ${totalImpact.toLocaleString()} funded
          </span>
        </div>
        
        <div className="space-y-6 mb-6">
          {impactData.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{item.project}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${item.funded.toLocaleString()}
                </span>
              </div>
              <div className="relative w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`${item.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${(item.funded / item.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-500">{((item.funded / item.total) * 100).toFixed(0)}% funded</span>
                <span className="text-xs text-slate-500">Goal: ${item.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Achievement Card */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏆</div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 mb-1">Impact Milestone Reached!</p>
              <p className="text-sm text-slate-600 mb-3">
                Your contributions have funded <strong>42 hours</strong> of ecosystem development this month
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">70% to next level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }