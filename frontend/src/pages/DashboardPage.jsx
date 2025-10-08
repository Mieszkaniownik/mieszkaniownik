import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import useUser from '../context/UserContext/useUser'
import { API_BASE_URL } from '../api/api'
import {
  Bell,
  Heart,
  Eye,
  TrendingUp,
  MapPin,
  Clock,
  AlertCircle,
  Activity,
  Home,
  Euro,
  Calendar,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import CardSkeleton from '../components/CardSkeleton'
import StatsSkeleton from '../components/StatsSkeleton'

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    fetchDashboardData()
  }, [user, navigate])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const [statsRes, matchesRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matches/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/matches?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/alerts?status=ACTIVE&limit=3`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      console.log('Stats response status:', statsRes.status)
      console.log('Matches response status:', matchesRes.status)
      console.log('Alerts response status:', alertsRes.status)

      if (!statsRes.ok) {
        const errorText = await statsRes.text()
        console.error('Stats error:', errorText)
        throw new Error(`Failed to fetch stats: ${statsRes.status}`)
      }

      if (!matchesRes.ok) {
        const errorText = await matchesRes.text()
        console.error('Matches error:', errorText)
        throw new Error(`Failed to fetch matches: ${matchesRes.status}`)
      }

      if (!alertsRes.ok) {
        const errorText = await alertsRes.text()
        console.error('Alerts error:', errorText)
        throw new Error(`Failed to fetch alerts: ${alertsRes.status}`)
      }

      const [statsData, matchesData, alertsData] = await Promise.all([
        statsRes.json(),
        matchesRes.json(),
        alertsRes.json(),
      ])

      console.log('Stats data:', statsData)
      console.log('Matches data:', matchesData)
      console.log('Alerts data:', alertsData)

      setStats(statsData)
      setRecentMatches(matchesData)
      setActiveAlerts(alertsData)
    } catch (err) {
      setError(err.message)
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8">
          <div className="max-w-7xl w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-950 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Twój osobisty przegląd mieszkaniowy
              </p>
            </div>

            <StatsSkeleton />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8">
          <div className="max-w-7xl w-full">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
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
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 bg-gray-50">
        <div className="max-w-7xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">
              Witaj, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              Twój osobisty przegląd poszukiwań mieszkaniowych
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Heart className="text-purple-600" size={24} />
                </div>
                <button
                  onClick={() => navigate('/matches')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-1">Dopasowania</p>
              <p className="text-3xl font-bold text-blue-950">
                {stats?.totalMatches || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.unreadMatches || 0} nowych
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bell className="text-blue-600" size={24} />
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-1">Aktywne Alerty</p>
              <p className="text-3xl font-bold text-blue-950">
                {activeAlerts.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Monitorują nowe oferty
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Śr. na alert</p>
              <p className="text-3xl font-bold text-blue-950">
                {stats?.matchesByAlert && activeAlerts.length > 0
                  ? Math.round(stats.totalMatches / activeAlerts.length)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Średnia dopasowań</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
                    <Activity size={24} className="text-purple-600" />
                    Ostatnie Dopasowania
                  </h2>
                  <button
                    onClick={() => navigate('/matches')}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Zobacz wszystkie
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentMatches.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>Brak dopasowań</p>
                    <button
                      onClick={() => navigate('/alerts/new')}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Utwórz pierwszy alert
                    </button>
                  </div>
                ) : (
                  recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() =>
                        window.open(match.offer.link, '_blank', 'noopener')
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-blue-950 mb-1">
                            {match.offer.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {match.offer.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Euro size={14} />
                              {match.offer.price} zł
                            </span>
                            {match.offer.footage && (
                              <span className="flex items-center gap-1">
                                <Home size={14} />
                                {match.offer.footage} m²
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {match.matchScore}% dopasowanie
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(match.matchedAt).toLocaleDateString(
                                'pl-PL'
                              )}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          size={20}
                          className="text-gray-400 mt-2 flex-shrink-0"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
                    <Bell size={24} className="text-blue-600" />
                    Aktywne Alerty
                  </h2>
                  <button
                    onClick={() => navigate('/alerts')}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Zobacz wszystkie
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {activeAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="mx-auto mb-2" size={32} />
                    <p>Brak aktywnych alertów</p>
                    <button
                      onClick={() => navigate('/alerts/new')}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Utwórz pierwszy alert
                    </button>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => navigate(`/matches?alert=${alert.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-blue-950 mb-1">
                            {alert.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {alert.city}
                            </span>
                            {(alert.minPrice || alert.maxPrice) && (
                              <span className="flex items-center gap-1">
                                <Euro size={14} />
                                {alert.minPrice && `${alert.minPrice} zł`}
                                {alert.minPrice && alert.maxPrice && ' - '}
                                {alert.maxPrice && `${alert.maxPrice} zł`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                              <Heart size={12} />
                              {alert._count?.matches || 0} dopasowań
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(alert.createdAt).toLocaleDateString(
                                'pl-PL'
                              )}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          size={20}
                          className="text-gray-400 mt-2 flex-shrink-0"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default DashboardPage
