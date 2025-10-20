import { ArrowUpDown, Filter, X } from "lucide-react";
import PropTypes from "prop-types";

function FilterBar({
  sortOptions = [],
  sortBy,
  onSortChange,

  filters = [],
  showFilters,
  onToggleFilters,

  activeFilters = [],
  onClearFilter,
  onClearAllFilters,

  searchValue,
  onSearchChange,
  searchPlaceholder = "Szukaj...",
  showSearch = false,
}) {
  const activeFiltersCount = activeFilters.length;

  return (
    <div className="mb-6 space-y-6">
      {(showSearch || filters.length > 0) && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            {showSearch && (
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {filters.length > 0 && (
              <button
                onClick={onToggleFilters}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition ${
                  showFilters || activeFiltersCount > 0
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={20} />
                Filtry
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {showFilters && filters.length > 0 && (
            <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-2 lg:grid-cols-3">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {filter.label}: {filter.displayValue}
                    <button
                      onClick={() => onClearFilter(filter.key)}
                      className="rounded-full p-0.5 hover:bg-blue-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={onClearAllFilters}
                className="text-sm text-gray-600 underline hover:text-gray-900"
              >
                Wyczyść wszystkie
              </button>
            </div>
          )}
        </div>
      )}

      {sortOptions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-start gap-4 md:justify-between">
            <div className="flex items-center gap-3">
              <ArrowUpDown size={20} className="text-gray-600" />
              <h2 className="font-semibold text-gray-900">Sortuj</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    sortBy === option.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FilterBar.propTypes = {
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func,

  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ),
  showFilters: PropTypes.bool,
  onToggleFilters: PropTypes.func,

  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      displayValue: PropTypes.string.isRequired,
    }),
  ),
  onClearFilter: PropTypes.func,
  onClearAllFilters: PropTypes.func,

  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
};

export default FilterBar;
