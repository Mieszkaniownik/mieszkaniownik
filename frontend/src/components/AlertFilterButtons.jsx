import PropTypes from 'prop-types'

/**
 * Standardized button group for filtering by alert
 */
function AlertFilterButtons({
  alerts = [],
  selectedAlertId,
  onSelectAlert,
  totalCount = 0,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => onSelectAlert('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          selectedAlertId === 'all'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Wszystkie {totalCount > 0 && `(${totalCount})`}
      </button>
      {alerts.map((alert) => (
        <button
          key={alert.id}
          onClick={() => onSelectAlert(alert.id.toString())}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            selectedAlertId === alert.id.toString()
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {alert.name}{' '}
          {alert._count?.matches !== undefined && `(${alert._count.matches})`}
        </button>
      ))}
    </div>
  )
}

AlertFilterButtons.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      _count: PropTypes.shape({
        matches: PropTypes.number,
      }),
    })
  ),
  selectedAlertId: PropTypes.string.isRequired,
  onSelectAlert: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
  className: PropTypes.string,
}

export default AlertFilterButtons
