import {
  CirclePlus,
  Edit,
  Filter,
  Heart,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiDelete, apiGet, apiPatch } from "../api/api";
import CardSkeleton from "../components/CardSkeleton";
import FilterBar from "../components/FilterBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useUser from "../context/UserContext/useUser";
import useFilters from "../hooks/useFilters";
import {
  ALERT_SORT_OPTIONS,
  ALERT_STATUS_OPTIONS,
  DEFAULT_FILTER,
  DEFAULT_SORT,
  getStatusLabel,
} from "../utils/filterSortConfig";

function AlertsPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const {
    filters,
    showFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    toggleShowFilters,
    getActiveFilters,
  } = useFilters({
    search: "",
    status: DEFAULT_FILTER.STATUS,
    city: DEFAULT_FILTER.CITY,
    sortBy: DEFAULT_SORT.ALERTS,
  });

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (filters.status !== "ALL") {
        params.append("status", filters.status);
      }

      if (filters.city !== "ALL") {
        params.append("city", filters.city);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }

      const data = await apiGet(`/alerts?${params.toString()}`);

      setAlerts(data);
    } catch (err) {
      setError("Błąd: Nie udało się pobrać alertów");
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
    fetchAlerts();
  }, [user, navigate, fetchAlerts]);

  async function handleToggleStatus(alertId) {
    setActionLoading((prev) => ({ ...prev, [alertId]: "toggle" }));
    try {
      await apiPatch(`/alerts/${alertId}/toggle`);

      fetchAlerts();
    } catch (err) {
      alert("Błąd: Nie udało się zmienić statusu alertu");
      console.error(err);
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[alertId];
        return newState;
      });
    }
  }

  async function handleDelete(alertId, alertName) {
    if (!window.confirm(`Czy na pewno chcesz usunąć alert "${alertName}"?`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [alertId]: "delete" }));
    try {
      await apiDelete(`/alerts/${alertId}`);

      fetchAlerts();
    } catch (err) {
      alert("Błąd: Nie udało się usunąć alertu");
      console.error(err);
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[alertId];
        return newState;
      });
    }
  }

  const uniqueCities = [...new Set(alerts.map((alert) => alert.city))].sort();

  const activeFiltersList = getActiveFilters({
    search: {
      label: "Szukaj",
      getDisplayValue: (val) => `"${val}"`,
    },
    status: {
      label: "Status",
      getDisplayValue: (val) => getStatusLabel(val),
    },
    city: {
      label: "Miasto",
      getDisplayValue: (val) => val,
    },
  });

  if (loading) {
    return (
      <>
        <Header />
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-950">
                  Moje Alerty
                </h1>
                <p className="mt-2 text-gray-600">
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
    );
  }

  return (
    <>
      <Header />
      <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
        <div className="w-full max-w-6xl">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-950">Moje Alerty</h1>
              <p className="mt-2 text-gray-600">
                Zarządzaj swoimi alertami mieszkaniowymi
              </p>
            </div>
            {/* Create New Alert Button */}
            <button
              onClick={() => navigate("/alerts/new")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              <CirclePlus size={20} />
              Nowy Alert
            </button>
          </div>

          {/* Filter and Sort Bar */}
          {alerts.length > 0 && (
            <FilterBar
              sortOptions={ALERT_SORT_OPTIONS}
              sortBy={filters.sortBy}
              onSortChange={(value) => updateFilter("sortBy", value)}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: filters.status,
                  onChange: (value) => updateFilter("status", value),
                  options: ALERT_STATUS_OPTIONS,
                },
                {
                  key: "city",
                  label: "Miasto",
                  value: filters.city,
                  onChange: (value) => updateFilter("city", value),
                  options: [
                    { value: "ALL", label: "Wszystkie miasta" },
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
              onSearchChange={(value) => updateFilter("search", value)}
              searchPlaceholder="Szukaj po nazwie alertu..."
            />
          )}

          {/* Results Count */}
          {alerts.length > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Wyświetlam {alerts.length} alertów
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Empty State or Alerts List */}
          {alerts.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <p className="mb-4 text-lg text-gray-600">
                Nie masz jeszcze żadnych alertów
              </p>
              <button
                onClick={() => navigate("/alerts/new")}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              >
                Utwórz pierwszy alert
              </button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <Filter className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="mb-2 text-lg text-gray-600">
                Brak alertów spełniających kryteria
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Spróbuj zmienić filtry lub wyszukiwanie
              </p>
              <button
                onClick={clearAllFilters}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    {/* Alert Content */}
                    <div className="flex-grow">
                      {/* Alert Header */}
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-blue-950">
                          {alert.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            alert.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : alert.status === "PAUSED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {alert.status === "ACTIVE"
                            ? "Aktywny"
                            : alert.status === "PAUSED"
                              ? "Wstrzymany"
                              : "Usunięty"}
                        </span>
                      </div>

                      {/* Alert Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
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
                              {alert.minPrice && alert.maxPrice && " - "}
                              {alert.maxPrice && `do ${alert.maxPrice} zł`}
                            </p>
                          </div>
                        )}
                        {(alert.minFootage || alert.maxFootage) && (
                          <div>
                            <p className="text-sm text-gray-600">Metraż</p>
                            <p className="font-medium">
                              {alert.minFootage && `od ${alert.minFootage} m²`}
                              {alert.minFootage && alert.maxFootage && " - "}
                              {alert.maxFootage && `do ${alert.maxFootage} m²`}
                            </p>
                          </div>
                        )}
                        {(alert.minRooms || alert.maxRooms) && (
                          <div>
                            <p className="text-sm text-gray-600">Pokoje</p>
                            <p className="font-medium">
                              {alert.minRooms && `od ${alert.minRooms}`}
                              {alert.minRooms && alert.maxRooms && " - "}
                              {alert.maxRooms && `do ${alert.maxRooms}`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      {alert.keywords && alert.keywords.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm text-gray-600">
                            Słowa kluczowe
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {alert.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Utworzono dnia:{" "}
                          {new Date(alert.createdAt).toLocaleDateString(
                            "pl-PL",
                          )}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>
                          Dopasowania:{" "}
                          <span className="font-semibold text-blue-950">
                            {alert._count?.matches || 0}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      <button
                        onClick={() => navigate(`/matches?alert=${alert.id}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700"
                      >
                        <Heart size={16} />
                        <span className="text-sm font-medium">
                          Zobacz dopasowania
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <Edit size={14} />
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleToggleStatus(alert.id)}
                          disabled={actionLoading[alert.id] === "toggle"}
                          className="flex items-center justify-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            alert.status === "ACTIVE" ? "Wstrzymaj" : "Aktywuj"
                          }
                        >
                          {actionLoading[alert.id] === "toggle" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : alert.status === "ACTIVE" ? (
                            <ToggleRight size={14} />
                          ) : (
                            <ToggleLeft size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id, alert.name)}
                          disabled={actionLoading[alert.id] === "delete"}
                          className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Usuń"
                        >
                          {actionLoading[alert.id] === "delete" ? (
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
  );
}

export default AlertsPage;
