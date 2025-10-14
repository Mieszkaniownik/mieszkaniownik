import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import useUser from '../context/UserContext/useUser'
import { apiGet, apiDelete } from '../api/api'
import {
  ArrowLeft,
  MapPin,
  Home,
  Ruler,
  Calendar,
  ExternalLink,
  Bell,
  TrendingUp,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Building2,
  Car,
  Dog,
  Sofa,
  ArrowUpDown,
  Tag,
  DollarSign,
  Users,
  Phone,
  Mail,
} from 'lucide-react'

function MatchDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useUser()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet(`/matches/${id}`)
      setMatch(data)
    } catch (err) {
      setError('Błąd: Nie udało się pobrać szczegółów dopasowania')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!user && !sessionStorage.getItem('mieszkaniownik:token')) {
      navigate('/login', { replace: true })
      return
    }
    fetchMatch()
  }, [user, navigate, fetchMatch])

  async function handleDelete() {
    if (!window.confirm(`Czy na pewno chcesz usunąć to dopasowanie?`)) {
      return
    }

    setDeleting(true)
    try {
      await apiDelete(`/matches/${id}`)
      navigate('/matches')
    } catch (err) {
      alert('Błąd: Nie udało się usunąć dopasowania')
      console.error(err)
      setDeleting(false)
    }
  }

  const nextImage = () => {
    if (match?.offer?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % match.offer.images.length)
    }
  }

  const prevImage = () => {
    if (match?.offer?.images) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + match.offer.images.length) % match.offer.images.length
      )
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-6xl w-full">
            <div className="flex items-center justify-center h-64">
              <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !match) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-6xl w-full">
            <button
              onClick={() => navigate('/matches')}
              className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition mb-6"
            >
              <ArrowLeft size={20} />
              Powrót do dopasowań
            </button>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || 'Dopasowanie nie zostało znalezione'}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const images = match.offer?.images || []
  const hasImages = images.length > 0

  return (
    <>
      <Header />
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
        <div className="max-w-6xl w-full">
          <button
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition mb-6"
          >
            <ArrowLeft size={20} />
            Powrót do dopasowań
          </button>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Image Gallery */}
            {hasImages ? (
              <div className="relative bg-gray-900 aspect-video">
                <img
                  src={images[currentImageIndex]}
                  alt={`${match.offer.title} - zdjęcie ${
                    currentImageIndex + 1
                  }`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E'
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                    >
                      <ChevronRight size={28} />
                    </button>

                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {match.offer.isNew && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                      NOWA OFERTA
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageIcon size={64} className="mx-auto mb-3" />
                  <p>Brak zdjęć</p>
                </div>
              </div>
            )}

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === currentImageIndex
                          ? 'border-blue-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-grow">
                  <h1 className="text-2xl md:text-3xl font-bold text-blue-950 mb-2">
                    {match.offer.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span className="font-medium">
                        {match.offer.city}
                        {match.offer.district && `, ${match.offer.district}`}
                      </span>
                    </div>
                    {match.offer.street && (
                      <div className="flex items-center gap-2">
                        <Home size={18} />
                        <span>
                          {match.offer.street} {match.offer.streetNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-blue-950">
                    {parseFloat(match.offer.price).toLocaleString('pl-PL')} zł
                  </div>
                  {match.offer.negotiable && (
                    <span className="text-green-600 font-medium">
                      Do negocjacji
                    </span>
                  )}
                </div>
              </div>

              {match.alert && (
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                    <Bell size={16} />
                    Dopasowano do: {match.alert.name}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
              {match.offer.footage && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Ruler className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metraż</p>
                    <p className="text-xl font-bold text-blue-950">
                      {parseFloat(match.offer.footage)} m²
                    </p>
                  </div>
                </div>
              )}
              {match.offer.rooms && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Home className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pokoje</p>
                    <p className="text-xl font-bold text-blue-950">
                      {match.offer.rooms}
                    </p>
                  </div>
                </div>
              )}
              {match.offer.floor !== null &&
                match.offer.floor !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ArrowUpDown className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Piętro</p>
                      <p className="text-xl font-bold text-blue-950">
                        {match.offer.floor}
                      </p>
                    </div>
                  </div>
                )}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dopasowano</p>
                  <p className="text-lg font-bold text-blue-950">
                    {new Date(match.matchedAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {match.offer.description && (
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-blue-950 mb-3">Opis</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {match.offer.description}
                </p>
              </div>
            )}

            {/* Detailed Information */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-blue-950 mb-4">
                Szczegółowe informacje
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Building Details */}
                {match.offer.buildingType && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Typ budynku</p>
                      <p className="font-medium">{match.offer.buildingType}</p>
                    </div>
                  </div>
                )}

                {match.offer.ownerType && (
                  <div className="flex items-start gap-3">
                    <Users className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Właściciel</p>
                      <p className="font-medium">
                        {match.offer.ownerType === 'PRIVATE'
                          ? 'Prywatny'
                          : match.offer.ownerType === 'COMPANY'
                          ? 'Firma'
                          : match.offer.ownerType}
                      </p>
                    </div>
                  </div>
                )}

                {match.offer.parkingType && (
                  <div className="flex items-start gap-3">
                    <Car className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Parking</p>
                      <p className="font-medium">
                        {match.offer.parkingType === 'NONE'
                          ? 'Brak'
                          : match.offer.parkingType === 'STREET'
                          ? 'Uliczny'
                          : match.offer.parkingType === 'SECURED'
                          ? 'Strzeżony'
                          : match.offer.parkingType === 'GARAGE'
                          ? 'Garaż'
                          : match.offer.parkingType}
                      </p>
                    </div>
                  </div>
                )}

                {match.offer.deposit !== null &&
                  match.offer.deposit !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Kaucja</p>
                        <p className="font-medium">
                          {parseFloat(match.offer.deposit).toLocaleString(
                            'pl-PL'
                          )}{' '}
                          zł
                        </p>
                      </div>
                    </div>
                  )}

                {match.offer.rentPrice !== null &&
                  match.offer.rentPrice !== undefined && (
                    <div className="flex items-start gap-3">
                      <Tag className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Czynsz</p>
                        <p className="font-medium">
                          {parseFloat(match.offer.rentPrice).toLocaleString(
                            'pl-PL'
                          )}{' '}
                          zł
                        </p>
                      </div>
                    </div>
                  )}

                {match.offer.yearBuilt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Rok budowy</p>
                      <p className="font-medium">{match.offer.yearBuilt}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {(match.offer.furniture !== null ||
              match.offer.elevator !== null ||
              match.offer.pets !== null ||
              match.offer.balcony !== null ||
              match.offer.garden !== null ||
              match.offer.terrace !== null) && (
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-blue-950 mb-4">
                  Udogodnienia
                </h2>
                <div className="flex flex-wrap gap-3">
                  {match.offer.furniture && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                      <Sofa size={18} className="text-green-600" />
                      <span className="text-green-700 font-medium">
                        Umeblowane
                      </span>
                    </div>
                  )}
                  {match.offer.elevator && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      <ArrowUpDown size={18} className="text-blue-600" />
                      <span className="text-blue-700 font-medium">Winda</span>
                    </div>
                  )}
                  {match.offer.pets && (
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                      <Dog size={18} className="text-purple-600" />
                      <span className="text-purple-700 font-medium">
                        Zwierzęta dozwolone
                      </span>
                    </div>
                  )}
                  {match.offer.balcony && (
                    <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                      <Home size={18} className="text-orange-600" />
                      <span className="text-orange-700 font-medium">
                        Balkon
                      </span>
                    </div>
                  )}
                  {match.offer.garden && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                      <TrendingUp size={18} className="text-green-600" />
                      <span className="text-green-700 font-medium">Ogród</span>
                    </div>
                  )}
                  {match.offer.terrace && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                      <Home size={18} className="text-yellow-600" />
                      <span className="text-yellow-700 font-medium">Taras</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {match.offer.contact && (
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-blue-950 mb-4">
                  Kontakt
                </h2>
                <div className="space-y-3">
                  {match.offer.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-blue-600" />
                      <a
                        href={`tel:${match.offer.contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {match.offer.contact.phone}
                      </a>
                    </div>
                  )}
                  {match.offer.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-blue-600" />
                      <a
                        href={`mailto:${match.offer.contact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {match.offer.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 flex flex-wrap gap-3">
              <a
                href={match.offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                <ExternalLink size={20} />
                Zobacz ogłoszenie źródłowe
              </a>
              {match.alert && (
                <button
                  onClick={() => navigate(`/matches?alert=${match.alert.id}`)}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium"
                >
                  <Eye size={20} />
                  Zobacz dopasowania alertu
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Usuń dopasowanie
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default MatchDetailPage
