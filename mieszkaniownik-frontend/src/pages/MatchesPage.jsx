import {
  Bell,
  ExternalLink,
  Eye,
  Filter,
  Home,
  Info,
  Loader2,
  MapPin,
  Ruler,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiDelete, apiGet } from "../api/api";
import AlertFilterButtons from "../components/AlertFilterButtons";
import CardSkeleton from "../components/CardSkeleton";
import FilterBar from "../components/FilterBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useUser from "../context/UserContext/useUser";
import useFilters from "../hooks/useFilters";
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  MATCH_SORT_OPTIONS,
} from "../utils/filterSortConfig";

function MatchesPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [matches, setMatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  const { filters, updateFilter } = useFilters({
    alertId: searchParams.get("alert") || DEFAULT_FILTER.ALERT,
    sortBy: DEFAULT_SORT.MATCHES,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.alertId !== "all") {
        params.append("alertId", filters.alertId);
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }

      const [matchesData, alertsData] = await Promise.all([
        apiGet(`/matches?${params.toString()}`),
        apiGet("/alerts"),
      ]);

      setMatches(matchesData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err.message || "Nie udało się pobrać danych");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!user && !sessionStorage.getItem("mieszkaniownik:token")) {
      navigate("/login", { replace: true });
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  function handleAlertFilter(alertId) {
    updateFilter("alertId", alertId);
    if (alertId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ alert: alertId });
    }
  }

  async function handleDeleteMatch(matchId, offerTitle) {
    if (
      !window.confirm(`Czy na pewno chcesz usunąć dopasowanie "${offerTitle}"?`)
    ) {
      return;
    }

    setDeletingMatchId(matchId);
    try {
      await apiDelete(`/matches/${matchId}`);
      await fetchData();
    } catch (err) {
      alert("Błąd: Nie udało się usunąć dopasowania");
      console.error(err);
    } finally {
      setDeletingMatchId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-7xl">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-blue-950">
                Dopasowania
              </h1>
              <p className="text-gray-600">
                Mieszkania dopasowane do Twoich alertów
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
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
      <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
        <div className="w-full max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-blue-950">
              Dopasowania
            </h1>
            <p className="text-gray-600">
              Mieszkania dopasowane do Twoich alertów
            </p>
          </div>

          {/* Alert Filter */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              onSortChange={(value) => updateFilter("sortBy", value)}
            />
          )}

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {matches.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <Home size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-lg text-gray-600">
                Brak dopasowanych ofert
              </p>
              <p className="mb-4 text-gray-500">
                {filters.alertId === "all"
                  ? "Nie znaleziono jeszcze żadnych dopasowań do Twoich alertów"
                  : "Brak dopasowań dla wybranego alertu"}
              </p>
              <button
                onClick={() => navigate("/alerts")}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              >
                Zarządzaj alertami
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => {
                const firstImage = match.offer?.images?.[0];

                return (
                  <div
                    key={match.id}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-video bg-gray-900">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={match.offer.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <Home size={48} />
                        </div>
                      )}
                      {match.offer.isNew && (
                        <div className="absolute top-2 right-2">
                          <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                            NOWE
                          </span>
                        </div>
                      )}
                      {match.offer?.images && match.offer.images.length > 1 && (
                        <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                          +{match.offer.images.length - 1} zdjęć
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-grow flex-col p-4">
                      {/* Alert badge */}
                      {match.alert && (
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            <Bell size={12} />
                            {match.alert.name}
                          </span>
                          {match.alert._count?.matches !== undefined && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                              <Bell size={12} />
                              {match.alert._count.matches}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title and Price */}
                      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-blue-950">
                        {match.offer.title}
                      </h3>
                      <div className="mb-3 text-2xl font-bold text-blue-950">
                        {parseFloat(match.offer.price).toLocaleString("pl-PL")}{" "}
                        zł
                      </div>

                      {/* Location */}
                      <div className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span className="line-clamp-1">
                          {match.offer.city}
                          {match.offer.district && `, ${match.offer.district}`}
                        </span>
                      </div>

                      {/* Key Stats */}
                      <div className="mb-4 flex flex-wrap gap-3 text-sm">
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
                      <div className="mb-4 flex flex-wrap gap-1">
                        {match.offer.furniture && (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                            Umeblowane
                          </span>
                        )}
                        {match.offer.elevator && (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            Winda
                          </span>
                        )}
                        {match.offer.pets && (
                          <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                            Zwierzęta
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto space-y-2">
                        <button
                          onClick={() => navigate(`/matches/${match.id}`)}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700"
                        >
                          <Info size={16} />
                          <span className="text-sm font-medium">Szczegóły</span>
                        </button>
                        <div className="flex gap-2">
                          <a
                            href={match.offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            <ExternalLink size={14} />
                            Oferta
                          </a>
                          {match.alert && (
                            <button
                              onClick={() =>
                                navigate(`/matches?alert=${match.alert.id}`)
                              }
                              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
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
                            className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MatchesPage;
