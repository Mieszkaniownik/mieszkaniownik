import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import useUser from '../context/UserContext/useUser'
import { API_BASE_URL } from '../api/api'
import {
  MapPin,
  Layers,
  TrendingUp,
  Euro,
  Home,
  Eye,
  Filter,
  X,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Loading from '../components/Loading'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

function HeatmapPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)
  const [matchMarkers, setMatchMarkers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState('viewsPerDay')
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showMatchMarkers, setShowMatchMarkers] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const [heatmapLayer, setHeatmapLayer] = useState(null)
  const [markers, setMarkers] = useState([])

  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    buildingType: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    if (!window.google) {
      loadGoogleMapsScript()
    } else {
      setMapLoaded(true)
    }

    fetchHeatmapData()
  }, [user, navigate])

  function loadGoogleMapsScript() {
    if (!GOOGLE_MAPS_API_KEY) {
      setError(
        'Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
      )
      setLoading(false)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => {
      setError('Failed to load Google Maps API')
      setLoading(false)
    }
    document.head.appendChild(script)
  }

  async function fetchHeatmapData() {
    setLoading(true)
    try {
      const token = window.sessionStorage.getItem('mieszkaniownik:token')
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value)
        }
      })

      const heatmapRes = await fetch(
        `${API_BASE_URL}/heatmap/data?${params.toString()}`
      )

      if (!heatmapRes.ok) {
        throw new Error('Failed to fetch heatmap data')
      }

      const heatmapResponse = await heatmapRes.json()
      console.log('Heatmap data received:', heatmapResponse.data)
      setHeatmapData(heatmapResponse.data)

      if (user) {
        try {
          const matchesRes = await fetch(
            `${API_BASE_URL}/heatmap/matches?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (matchesRes.ok) {
            const matchesResponse = await matchesRes.json()
            setMatchMarkers(matchesResponse.data.points || [])
          } else {
            console.warn('Failed to fetch user matches')
            setMatchMarkers([])
          }
        } catch (matchErr) {
          console.warn('Error fetching user matches:', matchErr)
          setMatchMarkers([])
        }
      } else {
        setMatchMarkers([])
      }
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const initMap = useCallback(
    (mapElement) => {
      if (!mapElement || !window.google || !heatmapData) return

      const defaultCenter = {
        lat: heatmapData.bounds
          ? (heatmapData.bounds.north + heatmapData.bounds.south) / 2
          : 51.1079,
        lng: heatmapData.bounds
          ? (heatmapData.bounds.east + heatmapData.bounds.west) / 2
          : 17.0385,
      }

      const mapInstance = new window.google.maps.Map(mapElement, {
        center: defaultCenter,
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      setMap(mapInstance)

      if (heatmapData.bounds && heatmapData.points.length > 0) {
        const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(
            heatmapData.bounds.south,
            heatmapData.bounds.west
          ),
          new window.google.maps.LatLng(
            heatmapData.bounds.north,
            heatmapData.bounds.east
          )
        )
        mapInstance.fitBounds(bounds)
      }
    },
    [heatmapData]
  )

  useEffect(() => {
    if (map && heatmapData && mapLoaded) {
      updateHeatmapLayer()
    }
  }, [map, heatmapData, selectedLayer, mapLoaded])

  useEffect(() => {
    if (map && mapLoaded && user) {
      addMatchMarkers()
    }
  }, [map, mapLoaded, matchMarkers, user, showMatchMarkers])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedPoint])

  function updateHeatmapLayer() {
    if (!map || !window.google || !heatmapData) return

    if (heatmapLayer) {
      heatmapLayer.setMap(null)
    }

    const heatmapDataPoints = heatmapData.points.map((point) => {
      let weight = 1

      switch (selectedLayer) {
        case 'viewsPerDay':
          if (point.viewsPerDay !== undefined && heatmapData.maxViewsPerDay) {
            weight = point.viewsPerDay / (heatmapData.maxViewsPerDay || 1)
          }
          break
        case 'pricePerSqm':
          if (point.pricePerSqm !== undefined && heatmapData.maxPricePerSqm) {
            weight = point.pricePerSqm / (heatmapData.maxPricePerSqm || 1)
          }
          break
        case 'density':
          if (point.offerDensity !== undefined && heatmapData.maxDensity) {
            weight = point.offerDensity / (heatmapData.maxDensity || 1)
          }
          break
        case 'footage':
          if (point.footage !== undefined && heatmapData.maxFootage) {
            weight = point.footage / (heatmapData.maxFootage || 1)
          }
          break
        default:
          weight = point.intensity
      }

      return {
        location: new window.google.maps.LatLng(point.lat, point.lng),
        weight: Math.max(0.1, weight),
      }
    })

    const newHeatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapDataPoints,
      map: map,
      radius: 30,
      opacity: 0.7,
      gradient: getGradientForLayer(selectedLayer),
    })

    setHeatmapLayer(newHeatmap)
  }

  function getGradientForLayer(layer) {
    switch (layer) {
      case 'viewsPerDay':
        return [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
        ]
      case 'pricePerSqm':
        return [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(127, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 191, 0, 1)',
          'rgba(255, 127, 0, 1)',
          'rgba(255, 63, 0, 1)',
          'rgba(255, 0, 0, 1)',
        ]
      case 'density':
        return [
          'rgba(255, 0, 255, 0)',
          'rgba(255, 0, 255, 1)',
          'rgba(223, 0, 255, 1)',
          'rgba(191, 0, 255, 1)',
          'rgba(159, 0, 255, 1)',
          'rgba(127, 0, 255, 1)',
          'rgba(95, 0, 255, 1)',
        ]
      case 'footage':
        return [
          'rgba(255, 165, 0, 0)',
          'rgba(255, 165, 0, 1)',
          'rgba(255, 140, 0, 1)',
          'rgba(255, 127, 0, 1)',
          'rgba(255, 99, 71, 1)',
          'rgba(255, 69, 0, 1)',
          'rgba(255, 0, 0, 1)',
        ]
      default:
        return null
    }
  }

  function addMatchMarkers() {
    if (!map || !window.google || !matchMarkers || matchMarkers.length === 0)
      return

    markers.forEach((marker) => marker.setMap(null))

    if (!showMatchMarkers) {
      setMarkers([])
      return
    }

    const newMarkers = matchMarkers.map((point) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        title: point.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#EF4444',
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      })

      marker.addListener('click', () => {
        setSelectedPoint(point)
      })

      return marker
    })

    setMarkers(newMarkers)
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function applyFilters() {
    fetchHeatmapData()
    setShowFilters(false)
  }

  function clearFilters() {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      buildingType: '',
    })
    setTimeout(() => fetchHeatmapData(), 100)
  }

  if (loading || !mapLoaded) {
    return (
      <>
        <Header />
        <main className="w-full flex justify-center items-center flex-grow min-h-[80vh] pt-16">
          <Loading />
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-2xl text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold mb-2">Error Loading Map</h2>
              <p>{error}</p>
            </div>
            {!GOOGLE_MAPS_API_KEY && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg">
                <h3 className="font-semibold mb-2">Setup Required:</h3>
                <ol className="text-left list-decimal list-inside space-y-2">
                  <li>
                    Get a Google Maps API key from{' '}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>
                    Enable the Maps JavaScript API and Visualization Library
                  </li>
                  <li>
                    Add{' '}
                    <code className="bg-blue-200 px-1 rounded">
                      VITE_GOOGLE_MAPS_API_KEY=your_key_here
                    </code>{' '}
                    to your .env file
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] pt-16">
        <div className="w-full bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-950 mb-2">
                  Mapa Cieplna Ofert
                </h1>
                <p className="text-gray-600">
                  Wizualizacja ofert mieszkań z dopasowaniami
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                <Filter size={20} />
                Filtry
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Home size={20} />
                  <div>
                    <p className="text-sm">Oferty</p>
                    <p className="text-xl font-bold">
                      {heatmapData?.totalOffers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Euro size={20} />
                  <div>
                    <p className="text-sm">Śr. cena/m²</p>
                    <p className="text-xl font-bold">
                      {heatmapData?.avgPricePerSqm
                        ? Math.round(heatmapData.avgPricePerSqm)
                        : '-'}{' '}
                      zł
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <TrendingUp size={20} />
                  <div>
                    <p className="text-sm">Śr. metraż</p>
                    <p className="text-xl font-bold">
                      {heatmapData?.avgFootage
                        ? Math.round(heatmapData.avgFootage)
                        : '-'}{' '}
                      m²
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <Eye size={20} />
                  <div>
                    <p className="text-sm">Śr. wyświetleń/dzień</p>
                    <p className="text-xl font-bold">
                      {heatmapData?.avgViewsPerDay
                        ? Math.round(heatmapData.avgViewsPerDay).toLocaleString(
                            'pl-PL'
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLayer('viewsPerDay')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                  selectedLayer === 'viewsPerDay'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye size={16} />
                Wyświetlenia/dzień
              </button>
              <button
                onClick={() => setSelectedLayer('pricePerSqm')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                  selectedLayer === 'pricePerSqm'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Euro size={16} />
                Cena/m²
              </button>
              <button
                onClick={() => setSelectedLayer('density')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                  selectedLayer === 'density'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Layers size={16} />
                Gęstość ofert
              </button>
              <button
                onClick={() => setSelectedLayer('footage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                  selectedLayer === 'footage'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home size={16} />
                Metraż
              </button>

              {user && matchMarkers.length > 0 && (
                <button
                  onClick={() => setShowMatchMarkers(!showMatchMarkers)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                    showMatchMarkers
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={16} />
                  Moje dopasowania ({matchMarkers.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="w-full bg-white border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Filtry</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miasto
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="np. Wrocław"
                    className="w-full rounded-lg border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. cena (zł)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange('minPrice', e.target.value)
                    }
                    placeholder="Od"
                    className="w-full rounded-lg border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maks. cena (zł)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange('maxPrice', e.target.value)
                    }
                    placeholder="Do"
                    className="w-full rounded-lg border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ budynku
                  </label>
                  <select
                    value={filters.buildingType}
                    onChange={(e) =>
                      handleFilterChange('buildingType', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-2"
                  >
                    <option value="">Wszystkie</option>
                    <option value="BLOCK_OF_FLATS">Blok</option>
                    <option value="TENEMENT">Kamienica</option>
                    <option value="DETACHED">Dom wolnostojący</option>
                    <option value="TERRACED">Szeregowiec</option>
                    <option value="APARTMENT">Apartament</option>
                    <option value="LOFT">Loft</option>
                    <option value="OTHER">Inne</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium"
                >
                  Zastosuj filtry
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex-grow relative">
          <div
            ref={initMap}
            className="w-full h-full min-h-[600px]"
            style={{ background: '#f0f0f0' }}
          />

          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Legenda</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
                <span>Dopasowane oferty</span>
              </div>
              {selectedLayer === 'viewsPerDay' && (
                <p className="text-gray-600">
                  Cieplejsze kolory = więcej wyświetleń dziennie
                </p>
              )}
              {selectedLayer === 'pricePerSqm' && (
                <p className="text-gray-600">
                  Zielony (tańsze) → Czerwony (droższe)
                </p>
              )}
              {selectedLayer === 'density' && (
                <p className="text-gray-600">
                  Ciemniejsze = większa koncentracja ofert
                </p>
              )}
              {selectedLayer === 'footage' && (
                <p className="text-gray-600">
                  Pomarańczowy → Czerwony = większy metraż
                </p>
              )}
            </div>
          </div>

          {selectedPoint && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
              {selectedPoint.images && selectedPoint.images.length > 0 && (
                <div className="relative aspect-video bg-gray-900 group">
                  <img
                    src={selectedPoint.images[currentImageIndex]}
                    alt={selectedPoint.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E'
                    }}
                  />

                  {selectedPoint.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (prev) =>
                              (prev - 1 + selectedPoint.images.length) %
                              selectedPoint.images.length
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (prev) => (prev + 1) % selectedPoint.images.length
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>

                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {currentImageIndex + 1} / {selectedPoint.images.length}
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedPoint.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 pr-4 line-clamp-2">
                    {selectedPoint.title}
                  </h3>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {selectedPoint.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cena:</span>
                      <span className="font-semibold">
                        {parseFloat(selectedPoint.price).toLocaleString(
                          'pl-PL'
                        )}{' '}
                        zł
                      </span>
                    </div>
                  )}
                  {selectedPoint.footage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metraż:</span>
                      <span className="font-semibold">
                        {parseFloat(selectedPoint.footage)} m²
                      </span>
                    </div>
                  )}
                  {selectedPoint.pricePerSqm && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cena/m²:</span>
                      <span className="font-semibold">
                        {Math.round(selectedPoint.pricePerSqm)} zł/m²
                      </span>
                    </div>
                  )}
                  {selectedPoint.viewsPerDay !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wyświetlenia/dzień:</span>
                      <span className="font-semibold">
                        {Math.round(selectedPoint.viewsPerDay * 10) / 10}
                      </span>
                    </div>
                  )}
                  {selectedPoint.address && (
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-gray-600">
                        {selectedPoint.address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedPoint.matchId && (
                    <button
                      onClick={() =>
                        navigate(`/matches/${selectedPoint.matchId}`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Info size={16} />
                      Szczegóły
                    </button>
                  )}
                  <a
                    href={selectedPoint.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                      selectedPoint.matchId
                        ? 'flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50'
                        : 'flex-1 bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedPoint.matchId ? 'Oferta' : 'Zobacz ofertę'}
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default HeatmapPage
