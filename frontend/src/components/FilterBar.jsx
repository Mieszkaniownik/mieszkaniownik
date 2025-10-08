import { Filter, X, ArrowUpDown } from 'lucide-react'
import PropTypes from 'prop-types'

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
  searchPlaceholder = 'Szukaj...',
  showSearch = false,
}) {
  const activeFiltersCount = activeFilters.length

  return (
    <div className="space-y-6">
      {sortOptions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArrowUpDown size={20} className="text-gray-600" />
              <h2 className="font-semibold text-gray-900">Sortuj</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(showSearch || filters.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {showSearch && (
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {filters.length > 0 && (
              <button
                onClick={onToggleFilters}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={20} />
                Filtry
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {showFilters && filters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {filter.label}: {filter.displayValue}
                    <button
                      onClick={() => onClearFilter(filter.key)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={onClearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Wyczyść wszystkie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

FilterBar.propTypes = {
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
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
        })
      ).isRequired,
    })
  ),
  showFilters: PropTypes.bool,
  onToggleFilters: PropTypes.func,

  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      displayValue: PropTypes.string.isRequired,
    })
  ),
  onClearFilter: PropTypes.func,
  onClearAllFilters: PropTypes.func,

  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
}

export default FilterBar
