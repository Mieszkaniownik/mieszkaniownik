import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  Heart,
  Home,
  MapPin,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet } from "../api/api";
import CardSkeleton from "../components/CardSkeleton";
import Footer from "../components/Footer";
import Header from "../components/Header";
import StatsSkeleton from "../components/StatsSkeleton";
import useUser from "../context/UserContext/useUser";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    if (!user && !sessionStorage.getItem("mieszkaniownik:token")) {
      navigate("/login", { replace: true });
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [statsData, matchesData, alertsData] = await Promise.all([
        apiGet(`/matches/stats`),
        apiGet(`/matches?limit=5`),
        apiGet(`/alerts?status=ACTIVE&limit=3`),
      ]);

      setStats(statsData);
      setRecentMatches(matchesData);
      setActiveAlerts(alertsData);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        {/* Loading State */}
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-7xl">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-blue-950">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Twój osobisty przegląd poszukiwań mieszkaniowych
              </p>
            </div>

            {/* Skeleton Loading */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <StatsSkeleton key={i} />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        {/* Error State */}
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-7xl">
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center bg-gray-50 px-6 py-8 md:px-8">
        <div className="w-full max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-blue-950">
              {`Witaj${user?.name && `, ${user.name}`}! 👋`}
            </h1>
            <p className="text-gray-600">
              Twój osobisty przegląd poszukiwań mieszkaniowych
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="rounded-lg bg-purple-100 p-3">
                <Heart className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Dopasowania</p>
                <p className="text-3xl font-bold text-blue-950">
                  {stats?.totalMatches || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {stats?.unreadMatches || 0} nowych
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="rounded-lg bg-green-100 p-3">
                <Activity className="text-green-600" size={24} />
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Śr. na alert</p>
                <p className="text-3xl font-bold text-blue-950">
                  {stats?.matchesByAlert && activeAlerts.length > 0
                    ? Math.round(stats.totalMatches / activeAlerts.length)
                    : 0}
                </p>
                <p className="mt-2 text-xs text-gray-500">Średnia dopasowań</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="rounded-lg bg-blue-100 p-3">
                <Bell className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Aktywne Alerty</p>
                <p className="text-3xl font-bold text-blue-950">
                  {activeAlerts.length}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Monitorują nowe oferty
                </p>
              </div>
            </div>
          </div>

          {/* Recent Matches and Active Alerts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Matches Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-2 md:justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-blue-950">
                    <Activity size={24} className="text-purple-600" />
                    Ostatnie Dopasowania
                  </h2>
                  <button
                    onClick={() => navigate("/matches")}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span className="hidden md:flex">Zobacz wszystkie</span>
                    <SquareArrowOutUpRight size={16} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentMatches.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>Brak dopasowań</p>
                    <button
                      onClick={() => navigate("/alerts/new")}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Utwórz pierwszy alert
                    </button>
                  </div>
                ) : (
                  recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="cursor-pointer p-4 transition hover:bg-gray-50"
                      onClick={() =>
                        window.open(match.offer.link, "_blank", "noopener")
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="mb-1 font-semibold text-blue-950">
                            {match.offer.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {match.offer.city}
                            </span>
                            <span className="flex items-center gap-1">
                              {match.offer.price} zł
                            </span>
                            {match.offer.footage && (
                              <span className="flex items-center gap-1">
                                <Home size={14} />
                                {match.offer.footage} m²
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                              {match.matchScore}% dopasowanie
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              {new Date(match.matchedAt).toLocaleDateString(
                                "pl-PL",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Alerts Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-1 md:justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-blue-950">
                    <Bell size={24} className="text-blue-600" />
                    Aktywne Alerty
                  </h2>
                  <button
                    onClick={() => navigate("/alerts")}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span className="hidden md:flex">Zobacz wszystkie</span>
                    <SquareArrowOutUpRight size={16} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {activeAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="mx-auto mb-2" size={32} />
                    <p>Brak aktywnych alertów</p>
                    <button
                      onClick={() => navigate("/alerts/new")}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Utwórz pierwszy alert
                    </button>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="cursor-pointer p-4 transition hover:bg-gray-50"
                      onClick={() => navigate(`/matches?alert=${alert.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h3 className="mb-1 font-semibold text-blue-950">
                            {alert.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {alert.city}
                            </span>
                            {(alert.minPrice || alert.maxPrice) && (
                              <span className="flex items-center gap-1">
                                {alert.minPrice && `${alert.minPrice} zł`}
                                {alert.minPrice && alert.maxPrice && " - "}
                                {alert.maxPrice && `${alert.maxPrice} zł`}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                              <Heart size={12} />
                              {alert._count?.matches || 0} dopasowań
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              {new Date(alert.createdAt).toLocaleDateString(
                                "pl-PL",
                              )}
                            </span>
                          </div>
                        </div>
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
  );
}

export default DashboardPage;
