import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FilterBar from '../components/FilterBar'
import AlertFilterButtons from '../components/AlertFilterButtons'
import useUser from '../context/UserContext/useUser'
import useFilters from '../hooks/useFilters'
import { API_BASE_URL } from '../api/api'
import {
  MapPin,
  Home,
  Euro,
  Ruler,
  Calendar,
  ExternalLink,
  Filter,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import CardSkeleton from '../components/CardSkeleton'
import StatsSkeleton from '../components/StatsSkeleton'
import {
  MATCH_SORT_OPTIONS,
  DEFAULT_SORT,
  DEFAULT_FILTER,
} from '../utils/filterSortConfig'

function MatchesPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [matches, setMatches] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndexes, setImageIndexes] = useState({})

  const { filters, updateFilter } = useFilters({
    alertId: searchParams.get('alert') || DEFAULT_FILTER.ALERT,
    sortBy: DEFAULT_SORT.MATCHES,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const params = new URLSearchParams()

      if (filters.alertId !== 'all') {
        params.append('alertId', filters.alertId)
      }

      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const matchesUrl = `${API_BASE_URL}/matches?${params.toString()}`

      const [matchesRes, alertsRes] = await Promise.all([
        fetch(matchesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!matchesRes.ok || !alertsRes.ok) {
        throw new Error('Nie udało się pobrać danych')
      }

      const [matchesData, alertsData] = await Promise.all([
        matchesRes.json(),
        alertsRes.json(),
      ])

      console.log('Matches data:', matchesData)
      console.log('Sample match images:', matchesData[0]?.offer?.images)

      setMatches(matchesData)
      setAlerts(alertsData)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    fetchData()
  }, [user, navigate, fetchData])

  function handleAlertFilter(alertId) {
    updateFilter('alertId', alertId)
    if (alertId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ alert: alertId })
    }
  }

  const nextImage = (matchId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [matchId]: ((prev[matchId] || 0) + 1) % totalImages,
    }))
  }

  const prevImage = (matchId, totalImages) => {
    setImageIndexes((prev) => ({
      ...prev,
      [matchId]: ((prev[matchId] || 0) - 1 + totalImages) % totalImages,
    }))
  }

  const goToImage = (matchId, index) => {
    setImageIndexes((prev) => ({
      ...prev,
      [matchId]: index,
    }))
  }

  const calculateStats = () => {
    if (!matches || matches.length === 0) {
      return {
        totalMatches: 0,
        activeAlerts: alerts.filter((a) => a.status === 'ACTIVE').length,
        recentMatches: 0,
      }
    }

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const recentCount = matches.filter(
      (match) => new Date(match.matchedAt) > oneDayAgo
    ).length

    return {
      totalMatches: matches.length,
      activeAlerts:
        filters.alertId === 'all'
          ? alerts.filter((a) => a.status === 'ACTIVE').length
          : alerts.find((a) => a.id.toString() === filters.alertId)?.status ===
            'ACTIVE'
          ? 1
          : 0,
      recentMatches: recentCount,
    }
  }

  const currentStats = calculateStats()

  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8">
          <div className="max-w-7xl w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-950 mb-2">
                Dopasowania
              </h1>
              <p className="text-gray-600">
                Mieszkania dopasowane do Twoich alertów
              </p>
            </div>

            <StatsSkeleton />

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

  return (
    <>
      <Header />
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8">
        <div className="max-w-7xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">
              Dopasowania
            </h1>
            <p className="text-gray-600">
              Mieszkania dopasowane do Twoich alertów
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    {filters.alertId === 'all'
                      ? 'Wszystkie dopasowania'
                      : 'Dopasowania alertu'}
                  </p>
                  <p className="text-2xl font-bold text-blue-950">
                    {currentStats.totalMatches}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bell className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    {filters.alertId === 'all'
                      ? 'Aktywne alerty'
                      : 'Status alertu'}
                  </p>
                  <p className="text-2xl font-bold text-blue-950">
                    {currentStats.activeAlerts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Home className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Nowe oferty (24h)</p>
                  <p className="text-2xl font-bold text-blue-950">
                    {currentStats.recentMatches}
                  </p>
                </div>
              </div>
            </div>
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
            <div className="grid gap-6">
              {matches.map((match) => {
                const currentImageIndex = imageIndexes[match.id] || 0
                const images = match.offer?.images || []
                const hasImages = images.length > 0

                return (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {hasImages ? (
                      <div className="relative bg-gray-900 aspect-video">
                        <img
                          src={images[currentImageIndex]}
                          alt={`${match.offer.title} - zdjęcie ${
                            currentImageIndex + 1
                          }`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E'
                          }}
                        />

                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(match.id, images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                              aria-label="Poprzednie zdjęcie"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button
                              onClick={() => nextImage(match.id, images.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                              aria-label="Następne zdjęcie"
                            >
                              <ChevronRight size={24} />
                            </button>

                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {images.length}
                            </div>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => goToImage(match.id, index)}
                                  className={`w-2 h-2 rounded-full transition ${
                                    index === currentImageIndex
                                      ? 'bg-white'
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                  aria-label={`Przejdź do zdjęcia ${index + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 aspect-video flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <ImageIcon size={48} className="mx-auto mb-2" />
                          <p className="text-sm">Brak zdjęć</p>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {match.alert && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            <Bell size={14} />
                            {match.alert.name}
                          </span>
                        </div>
                      )}

                      {match.offer && (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow">
                              <h3 className="text-xl font-semibold text-blue-950 mb-2">
                                {match.offer.title}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin size={16} />
                                  <span>
                                    {match.offer.city}
                                    {match.offer.district &&
                                      `, ${match.offer.district}`}
                                  </span>
                                </div>
                                {match.offer.street && (
                                  <div className="flex items-center gap-1">
                                    <Home size={16} />
                                    <span>
                                      {match.offer.street}{' '}
                                      {match.offer.streetNumber}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-950">
                                {parseFloat(match.offer.price).toLocaleString(
                                  'pl-PL'
                                )}{' '}
                                zł
                              </div>
                              {match.offer.negotiable && (
                                <span className="text-sm text-green-600">
                                  Do negocjacji
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {match.offer.footage && (
                              <div className="flex items-center gap-2">
                                <Ruler size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Metraż
                                  </p>
                                  <p className="font-medium">
                                    {parseFloat(match.offer.footage)} m²
                                  </p>
                                </div>
                              </div>
                            )}
                            {match.offer.rooms && (
                              <div className="flex items-center gap-2">
                                <Home size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Pokoje
                                  </p>
                                  <p className="font-medium">
                                    {match.offer.rooms}
                                  </p>
                                </div>
                              </div>
                            )}
                            {match.offer.floor !== null &&
                              match.offer.floor !== undefined && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp
                                    size={16}
                                    className="text-gray-400"
                                  />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Piętro
                                    </p>
                                    <p className="font-medium">
                                      {match.offer.floor}
                                    </p>
                                  </div>
                                </div>
                              )}
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Dopasowano
                                </p>
                                <p className="font-medium text-sm">
                                  {new Date(match.matchedAt).toLocaleDateString(
                                    'pl-PL'
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {match.offer.buildingType && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {match.offer.buildingType}
                              </span>
                            )}
                            {match.offer.furniture && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                Umeblowane
                              </span>
                            )}
                            {match.offer.elevator && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                Winda
                              </span>
                            )}
                            {match.offer.pets && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                Zwierzęta OK
                              </span>
                            )}
                            {match.offer.isNew && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                NOWA OFERTA
                              </span>
                            )}
                          </div>

                          {match.offer.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {match.offer.description}
                            </p>
                          )}

                          <div className="flex gap-3">
                            <a
                              href={match.offer.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                              <ExternalLink size={18} />
                              Zobacz ofertę
                            </a>
                            {match.offer.contact && (
                              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                Kontakt
                              </button>
                            )}
                          </div>
                        </>
                      )}
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
