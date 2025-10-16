import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FilterBar from '../components/FilterBar'
import AlertFilterButtons from '../components/AlertFilterButtons'
import useUser from '../context/UserContext/useUser'
import useFilters from '../hooks/useFilters'
import { apiGet, apiDelete } from '../api/api'
import {
  MapPin,
  Home,
  Ruler,
  ExternalLink,
  Filter,
  Trash2,
  Eye,
  Loader2,
  Info,
  Bell,
  TrendingUp,
} from 'lucide-react'
import CardSkeleton from '../components/CardSkeleton'
import {
  MATCH_SORT_OPTIONS,
  DEFAULT_SORT,
  DEFAULT_FILTER,
} from '../utils/filterSortConfig'

function MatchesPage() {
  {
    /* Hooks */
  }
  const navigate = useNavigate()
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()

  {
    /* State */
  }
  const [matches, setMatches] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingMatchId, setDeletingMatchId] = useState(null)

  {
    /* Filters */
  }
  const { filters, updateFilter } = useFilters({
    alertId: searchParams.get('alert') || DEFAULT_FILTER.ALERT,
    sortBy: DEFAULT_SORT.MATCHES,
  })

  {
    /* API Calls */
  }
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.alertId !== 'all') {
        params.append('alertId', filters.alertId)
      }

      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const [matchesData, alertsData] = await Promise.all([
        apiGet(`/matches?${params.toString()}`),
        apiGet('/alerts'),
      ])

      setMatches(matchesData)
      setAlerts(alertsData)
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać danych')
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
    fetchData()
  }, [user, navigate, fetchData])

  {
    /* Handlers */
  }
  function handleAlertFilter(alertId) {
    updateFilter('alertId', alertId)
    if (alertId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ alert: alertId })
    }
  }

  async function handleDeleteMatch(matchId, offerTitle) {
    if (
      !window.confirm(`Czy na pewno chcesz usunąć dopasowanie "${offerTitle}"?`)
    ) {
      return
    }

    setDeletingMatchId(matchId)
    try {
      await apiDelete(`/matches/${matchId}`)
      await fetchData()
    } catch (err) {
      alert('Błąd: Nie udało się usunąć dopasowania')
      console.error(err)
    } finally {
      setDeletingMatchId(null)
    }
  }

  {
    /* Render - Loading State */
  }
  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-7xl w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-950 mb-2">
                Dopasowania
              </h1>
              <p className="text-gray-600">
                Mieszkania dopasowane do Twoich alertów
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <div className="max-w-7xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">
              Dopasowania
            </h1>
            <p className="text-gray-600">
              Mieszkania dopasowane do Twoich alertów
            </p>
          </div>

          {/* Alert Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-gray-600" />
                <h2 className="font-semibold text-gray-900">
                  Filtruj według alertu
                </h2>
              </div>
              <AlertFilterButtons
                alerts={alerts}
                selectedAlertId={filters.alertId}
                onSelectAlert={handleAlertFilter}
                totalCount={matches.length}
              />
            </div>
          </div>

          {/* Sort Options */}
          {matches.length > 0 && (
            <FilterBar
              sortOptions={MATCH_SORT_OPTIONS}
              sortBy={filters.sortBy}
              onSortChange={(value) => updateFilter('sortBy', value)}
            />
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {matches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                Brak dopasowanych ofert
              </p>
              <p className="text-gray-500 mb-4">
                {filters.alertId === 'all'
                  ? 'Nie znaleziono jeszcze żadnych dopasowań do Twoich alertów'
                  : 'Brak dopasowań dla wybranego alertu'}
              </p>
              <button
                onClick={() => navigate('/alerts')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Zarządzaj alertami
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => {
                const firstImage = match.offer?.images?.[0]

                return (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="relative aspect-video bg-gray-900">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={match.offer.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Home size={48} />
                        </div>
                      )}
                      {match.offer.isNew && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            NOWE
                          </span>
                        </div>
                      )}
                      {match.offer?.images && match.offer.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          +{match.offer.images.length - 1} zdjęć
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Alert badge */}
                      {match.alert && (
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            <Bell size={12} />
                            {match.alert.name}
                          </span>
                          {match.alert._count?.matches !== undefined && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                              <Bell size={12} />
                              {match.alert._count.matches}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title and Price */}
                      <h3 className="text-lg font-semibold text-blue-950 mb-2 line-clamp-2">
                        {match.offer.title}
                      </h3>
                      <div className="text-2xl font-bold text-blue-950 mb-3">
                        {parseFloat(match.offer.price).toLocaleString('pl-PL')}{' '}
                        zł
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                        <MapPin size={14} />
                        <span className="line-clamp-1">
                          {match.offer.city}
                          {match.offer.district && `, ${match.offer.district}`}
                        </span>
                      </div>

                      {/* Key Stats */}
                      <div className="flex flex-wrap gap-3 mb-4 text-sm">
                        {match.offer.footage && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Ruler size={14} />
                            <span>{parseFloat(match.offer.footage)} m²</span>
                          </div>
                        )}
                        {match.offer.rooms && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Home size={14} />
                            <span>{match.offer.rooms} pok.</span>
                          </div>
                        )}
                        {match.offer.floor !== null &&
                          match.offer.floor !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <TrendingUp size={14} />
                              <span>{match.offer.floor} p.</span>
                            </div>
                          )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {match.offer.furniture && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Umeblowane
                          </span>
                        )}
                        {match.offer.elevator && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Winda
                          </span>
                        )}
                        {match.offer.pets && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Zwierzęta
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto space-y-2">
                        <button
                          onClick={() => navigate(`/matches/${match.id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <Info size={16} />
                          <span className="text-sm font-medium">Szczegóły</span>
                        </button>
                        <div className="flex gap-2">
                          <a
                            href={match.offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
                          >
                            <ExternalLink size={14} />
                            Oferta
                          </a>
                          {match.alert && (
                            <button
                              onClick={() =>
                                navigate(`/matches?alert=${match.alert.id}`)
                              }
                              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                              title="Zobacz dopasowania alertu"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteMatch(match.id, match.offer?.title)
                            }
                            disabled={deletingMatchId === match.id}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Usuń dopasowanie"
                          >
                            {deletingMatchId === match.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default MatchesPage
