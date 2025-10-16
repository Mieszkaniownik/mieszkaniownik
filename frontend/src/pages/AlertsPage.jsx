import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FilterBar from '../components/FilterBar'
import useUser from '../context/UserContext/useUser'
import useFilters from '../hooks/useFilters'
import { apiGet, apiPatch, apiDelete } from '../api/api'
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Heart,
  Loader2,
  Filter,
  CirclePlus,
} from 'lucide-react'
import CardSkeleton from '../components/CardSkeleton'
import {
  ALERT_SORT_OPTIONS,
  ALERT_STATUS_OPTIONS,
  DEFAULT_SORT,
  DEFAULT_FILTER,
  getStatusLabel,
} from '../utils/filterSortConfig'

function AlertsPage() {
  {
    /* Hooks */
  }
  const navigate = useNavigate()
  const { user } = useUser()

  {
    /* State */
  }
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  {
    /* Filters */
  }
  const {
    filters,
    showFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    toggleShowFilters,
    getActiveFilters,
  } = useFilters({
    search: '',
    status: DEFAULT_FILTER.STATUS,
    city: DEFAULT_FILTER.CITY,
    sortBy: DEFAULT_SORT.ALERTS,
  })

  {
    /* API Calls */
  }
  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams()

      if (filters.status !== 'ALL') {
        params.append('status', filters.status)
      }

      if (filters.city !== 'ALL') {
        params.append('city', filters.city)
      }

      if (filters.search) {
        params.append('search', filters.search)
      }

      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const data = await apiGet(`/alerts?${params.toString()}`)

      setAlerts(data)
    } catch (err) {
      setError('Błąd: Nie udało się pobrać alertów')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  {
    /* Effects */
  }
  useEffect(() => {
    if (!user && !sessionStorage.getItem('mieszkaniownik:token')) {
      navigate('/login', { replace: true })
      return
    }
    fetchAlerts()
  }, [user, navigate, fetchAlerts])

  {
    /* Handlers */
  }
  async function handleToggleStatus(alertId) {
    setActionLoading((prev) => ({ ...prev, [alertId]: 'toggle' }))
    try {
      await apiPatch(`/alerts/${alertId}/toggle`)

      fetchAlerts()
    } catch (err) {
      alert('Błąd: Nie udało się zmienić statusu alertu')
      console.error(err)
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev }
        delete newState[alertId]
        return newState
      })
    }
  }

  async function handleDelete(alertId, alertName) {
    if (!window.confirm(`Czy na pewno chcesz usunąć alert "${alertName}"?`)) {
      return
    }

    setActionLoading((prev) => ({ ...prev, [alertId]: 'delete' }))
    try {
      await apiDelete(`/alerts/${alertId}`)

      fetchAlerts()
    } catch (err) {
      alert('Błąd: Nie udało się usunąć alertu')
      console.error(err)
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev }
        delete newState[alertId]
        return newState
      })
    }
  }

  {
    /* Computed Values */
  }
  const uniqueCities = [...new Set(alerts.map((alert) => alert.city))].sort()

  const activeFiltersList = getActiveFilters({
    search: {
      label: 'Szukaj',
      getDisplayValue: (val) => `"${val}"`,
    },
    status: {
      label: 'Status',
      getDisplayValue: (val) => getStatusLabel(val),
    },
    city: {
      label: 'Miasto',
      getDisplayValue: (val) => val,
    },
  })

  {
    /* Render - Loading State */
  }
  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-950">
                  Moje Alerty
                </h1>
                <p className="text-gray-600 mt-2">
                  Zarządzaj swoimi alertami mieszkaniowymi
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  {
    /* Render - Main */
  }
  return (
    <>
      <Header />
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
        <div className="max-w-6xl w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-950">Moje Alerty</h1>
              <p className="text-gray-600 mt-2">
                Zarządzaj swoimi alertami mieszkaniowymi
              </p>
            </div>
            <button
              onClick={() => navigate('/alerts/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <CirclePlus size={20} />
              Nowy Alert
            </button>
          </div>

          {alerts.length > 0 && (
            <FilterBar
              sortOptions={ALERT_SORT_OPTIONS}
              sortBy={filters.sortBy}
              onSortChange={(value) => updateFilter('sortBy', value)}
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  value: filters.status,
                  onChange: (value) => updateFilter('status', value),
                  options: ALERT_STATUS_OPTIONS,
                },
                {
                  key: 'city',
                  label: 'Miasto',
                  value: filters.city,
                  onChange: (value) => updateFilter('city', value),
                  options: [
                    { value: 'ALL', label: 'Wszystkie miasta' },
                    ...uniqueCities.map((city) => ({
                      value: city,
                      label: city,
                    })),
                  ],
                },
              ]}
              showFilters={showFilters}
              onToggleFilters={toggleShowFilters}
              activeFilters={activeFiltersList}
              onClearFilter={clearFilter}
              onClearAllFilters={clearAllFilters}
              showSearch={true}
              searchValue={filters.search}
              onSearchChange={(value) => updateFilter('search', value)}
              searchPlaceholder="Szukaj po nazwie alertu..."
            />
          )}

          {alerts.length > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Wyświetlam {alerts.length} alertów
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg mb-4">
                Nie masz jeszcze żadnych alertów
              </p>
              <button
                onClick={() => navigate('/alerts/new')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Utwórz pierwszy alert
              </button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Filter className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">
                Brak alertów spełniających kryteria
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Spróbuj zmienić filtry lub wyszukiwanie
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-blue-950">
                          {alert.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : alert.status === 'PAUSED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {alert.status === 'ACTIVE'
                            ? 'Aktywny'
                            : alert.status === 'PAUSED'
                            ? 'Wstrzymany'
                            : 'Usunięty'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Miasto</p>
                          <p className="font-medium">{alert.city}</p>
                        </div>
                        {alert.district && (
                          <div>
                            <p className="text-sm text-gray-600">Dzielnica</p>
                            <p className="font-medium">{alert.district}</p>
                          </div>
                        )}
                        {(alert.minPrice || alert.maxPrice) && (
                          <div>
                            <p className="text-sm text-gray-600">Cena</p>
                            <p className="font-medium">
                              {alert.minPrice && `od ${alert.minPrice} zł`}
                              {alert.minPrice && alert.maxPrice && ' - '}
                              {alert.maxPrice && `do ${alert.maxPrice} zł`}
                            </p>
                          </div>
                        )}
                        {(alert.minFootage || alert.maxFootage) && (
                          <div>
                            <p className="text-sm text-gray-600">Metraż</p>
                            <p className="font-medium">
                              {alert.minFootage && `od ${alert.minFootage} m²`}
                              {alert.minFootage && alert.maxFootage && ' - '}
                              {alert.maxFootage && `do ${alert.maxFootage} m²`}
                            </p>
                          </div>
                        )}
                        {(alert.minRooms || alert.maxRooms) && (
                          <div>
                            <p className="text-sm text-gray-600">Pokoje</p>
                            <p className="font-medium">
                              {alert.minRooms && `od ${alert.minRooms}`}
                              {alert.minRooms && alert.maxRooms && ' - '}
                              {alert.maxRooms && `do ${alert.maxRooms}`}
                            </p>
                          </div>
                        )}
                      </div>

                      {alert.keywords && alert.keywords.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Słowa kluczowe
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {alert.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span>
                          Utworzono dnia:{' '}
                          {new Date(alert.createdAt).toLocaleDateString(
                            'pl-PL'
                          )}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>
                          Dopasowania:{' '}
                          <span className="font-semibold text-blue-950">
                            {alert._count?.matches || 0}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-2">
                      <button
                        onClick={() => navigate(`/matches?alert=${alert.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <Heart size={16} />
                        <span className="text-sm font-medium">
                          Zobacz dopasowania
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          <Edit size={14} />
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleToggleStatus(alert.id)}
                          disabled={actionLoading[alert.id] === 'toggle'}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            alert.status === 'ACTIVE' ? 'Wstrzymaj' : 'Aktywuj'
                          }
                        >
                          {actionLoading[alert.id] === 'toggle' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : alert.status === 'ACTIVE' ? (
                            <ToggleRight size={14} />
                          ) : (
                            <ToggleLeft size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id, alert.name)}
                          disabled={actionLoading[alert.id] === 'delete'}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Usuń"
                        >
                          {actionLoading[alert.id] === 'delete' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default AlertsPage
