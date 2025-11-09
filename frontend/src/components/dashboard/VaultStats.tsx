import { useUniDonateVault } from '../../hooks/useUniDonateVault'

export function VaultStats() {
  const { totalTVL, userBalance, apy, totalDonations } = useUniDonateVault()

  const stats = [
    {
      label: 'Total Value Locked',
      value: `$${totalTVL.toLocaleString()}`,
      icon: '🏦',
      trend: '+12.5%',
      bgColor: 'from-slate-50 to-slate-100',
      borderColor: 'border-slate-200'
    },
    {
      label: 'Your Balance',
      value: `$${userBalance.toLocaleString()}`,
      icon: '💰',
      trend: '+8.2%',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Current APY',
      value: `${apy}%`,
      icon: '📈',
      trend: 'Stable',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Total Donated',
      value: `$${totalDonations.toLocaleString()}`,
      icon: '🎯',
      trend: '+24.1%',
      bgColor: 'from-violet-50 to-violet-100',
      borderColor: 'border-violet-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{stat.icon}</div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {stat.trend}
            </span>
          </div>
          <h3 className="text-slate-600 text-sm font-medium mb-2">{stat.label}</h3>
          <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}