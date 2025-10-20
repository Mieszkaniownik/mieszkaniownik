import {
  ArrowLeft,
  ArrowUpDown,
  Bell,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Dog,
  DollarSign,
  ExternalLink,
  Eye,
  Home,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Sofa,
  Tag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiDelete, apiGet } from "../api/api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useUser from "../context/UserContext/useUser";

function MatchDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/matches/${id}`);
      setMatch(data);
    } catch (err) {
      setError("Błąd: Nie udało się pobrać szczegółów dopasowania");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user && !sessionStorage.getItem("mieszkaniownik:token")) {
      navigate("/login", { replace: true });
      return;
    }
    fetchMatch();
  }, [user, navigate, fetchMatch]);

  async function handleDelete() {
    if (!window.confirm(`Czy na pewno chcesz usunąć to dopasowanie?`)) {
      return;
    }

    setDeleting(true);
    try {
      await apiDelete(`/matches/${id}`);
      navigate("/matches");
    } catch (err) {
      alert("Błąd: Nie udało się usunąć dopasowania");
      console.error(err);
      setDeleting(false);
    }
  }

  const nextImage = () => {
    if (match?.offer?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % match.offer.images.length);
    }
  };

  const prevImage = () => {
    if (match?.offer?.images) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + match.offer.images.length) % match.offer.images.length,
      );
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-6xl">
            <div className="flex h-64 items-center justify-center">
              <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !match) {
    return (
      <>
        <Header />
        <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
          <div className="w-full max-w-6xl">
            <button
              onClick={() => navigate("/matches")}
              className="mb-6 flex items-center gap-2 text-blue-950 transition hover:text-blue-700"
            >
              <ArrowLeft size={20} />
              Powrót do dopasowań
            </button>
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error || "Dopasowanie nie zostało znalezione"}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = match.offer?.images || [];
  const hasImages = images.length > 0;

  return (
    <>
      <Header />
      <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
        <div className="w-full max-w-6xl">
          <button
            onClick={() => navigate("/matches")}
            className="mb-6 flex items-center gap-2 text-blue-950 transition hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            Powrót do dopasowań
          </button>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Image Gallery */}
            {hasImages ? (
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={images[currentImageIndex]}
                  alt={`${match.offer.title} - zdjęcie ${
                    currentImageIndex + 1
                  }`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBrak zdjęcia%3C/text%3E%3C/svg%3E';
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
                    >
                      <ChevronRight size={28} />
                    </button>

                    <div className="absolute right-4 bottom-4 rounded-full bg-black/70 px-4 py-2 text-white">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {match.offer.isNew && (
                  <div className="absolute top-4 right-4">
                    <span className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-white shadow-lg">
                      NOWA OFERTA
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-100">
                <div className="text-center text-gray-400">
                  <ImageIcon size={64} className="mx-auto mb-3" />
                  <p>Brak zdjęć</p>
                </div>
              </div>
            )}

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="border-b bg-gray-50 p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        index === currentImageIndex
                          ? "border-blue-600"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniatura ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="border-b p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <h1 className="mb-2 text-2xl font-bold text-blue-950 md:text-3xl">
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
                  <div className="text-3xl font-bold text-blue-950 md:text-4xl">
                    {parseFloat(match.offer.price).toLocaleString("pl-PL")} zł
                  </div>
                  {match.offer.negotiable && (
                    <span className="font-medium text-green-600">
                      Do negocjacji
                    </span>
                  )}
                </div>
              </div>

              {match.alert && (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-700">
                    <Bell size={16} />
                    Dopasowano do: {match.alert.name}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 border-b bg-gray-50 p-6 md:grid-cols-4">
              {match.offer.footage && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
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
                  <div className="rounded-lg bg-purple-100 p-3">
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
                    <div className="rounded-lg bg-green-100 p-3">
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
                <div className="rounded-lg bg-orange-100 p-3">
                  <Calendar className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dopasowano</p>
                  <p className="text-lg font-bold text-blue-950">
                    {new Date(match.matchedAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {match.offer.description && (
              <div className="border-b p-6">
                <h2 className="mb-3 text-xl font-bold text-blue-950">Opis</h2>
                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {match.offer.description}
                </p>
              </div>
            )}

            {/* Detailed Information */}
            <div className="border-b p-6">
              <h2 className="mb-4 text-xl font-bold text-blue-950">
                Szczegółowe informacje
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Building Details */}
                {match.offer.buildingType && (
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Typ budynku</p>
                      <p className="font-medium">{match.offer.buildingType}</p>
                    </div>
                  </div>
                )}

                {match.offer.ownerType && (
                  <div className="flex items-start gap-3">
                    <Users className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Właściciel</p>
                      <p className="font-medium">
                        {match.offer.ownerType === "PRIVATE"
                          ? "Prywatny"
                          : match.offer.ownerType === "COMPANY"
                            ? "Firma"
                            : match.offer.ownerType}
                      </p>
                    </div>
                  </div>
                )}

                {match.offer.parkingType && (
                  <div className="flex items-start gap-3">
                    <Car className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Parking</p>
                      <p className="font-medium">
                        {match.offer.parkingType === "NONE"
                          ? "Brak"
                          : match.offer.parkingType === "STREET"
                            ? "Uliczny"
                            : match.offer.parkingType === "SECURED"
                              ? "Strzeżony"
                              : match.offer.parkingType === "GARAGE"
                                ? "Garaż"
                                : match.offer.parkingType}
                      </p>
                    </div>
                  </div>
                )}

                {match.offer.deposit !== null &&
                  match.offer.deposit !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-1 text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Kaucja</p>
                        <p className="font-medium">
                          {parseFloat(match.offer.deposit).toLocaleString(
                            "pl-PL",
                          )}{" "}
                          zł
                        </p>
                      </div>
                    </div>
                  )}

                {match.offer.rentPrice !== null &&
                  match.offer.rentPrice !== undefined && (
                    <div className="flex items-start gap-3">
                      <Tag className="mt-1 text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Czynsz</p>
                        <p className="font-medium">
                          {parseFloat(match.offer.rentPrice).toLocaleString(
                            "pl-PL",
                          )}{" "}
                          zł
                        </p>
                      </div>
                    </div>
                  )}

                {match.offer.yearBuilt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 text-blue-600" size={20} />
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
              <div className="border-b p-6">
                <h2 className="mb-4 text-xl font-bold text-blue-950">
                  Udogodnienia
                </h2>
                <div className="flex flex-wrap gap-3">
                  {match.offer.furniture && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                      <Sofa size={18} className="text-green-600" />
                      <span className="font-medium text-green-700">
                        Umeblowane
                      </span>
                    </div>
                  )}
                  {match.offer.elevator && (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                      <ArrowUpDown size={18} className="text-blue-600" />
                      <span className="font-medium text-blue-700">Winda</span>
                    </div>
                  )}
                  {match.offer.pets && (
                    <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2">
                      <Dog size={18} className="text-purple-600" />
                      <span className="font-medium text-purple-700">
                        Zwierzęta dozwolone
                      </span>
                    </div>
                  )}
                  {match.offer.balcony && (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2">
                      <Home size={18} className="text-orange-600" />
                      <span className="font-medium text-orange-700">
                        Balkon
                      </span>
                    </div>
                  )}
                  {match.offer.garden && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                      <TrendingUp size={18} className="text-green-600" />
                      <span className="font-medium text-green-700">Ogród</span>
                    </div>
                  )}
                  {match.offer.terrace && (
                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2">
                      <Home size={18} className="text-yellow-600" />
                      <span className="font-medium text-yellow-700">Taras</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {match.offer.contact && (
              <div className="border-b p-6">
                <h2 className="mb-4 text-xl font-bold text-blue-950">
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
            <div className="flex flex-wrap gap-3 p-6">
              <a
                href={match.offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <ExternalLink size={20} />
                Zobacz ogłoszenie źródłowe
              </a>
              {match.alert && (
                <button
                  onClick={() => navigate(`/matches?alert=${match.alert.id}`)}
                  className="flex items-center justify-center gap-2 rounded-full border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <Eye size={20} />
                  Zobacz dopasowania alertu
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-6 py-3 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}

export default MatchDetailPage;
