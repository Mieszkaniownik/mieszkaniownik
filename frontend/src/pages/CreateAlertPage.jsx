import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import useUser from '../context/UserContext/useUser'
import { API_BASE_URL } from '../api/api'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/Button'

function CreateAlertPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [keywords, setKeywords] = useState([])
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)

    const alertData = {
      userId: user.id,
      name: formData.get('name'),
      city: formData.get('city'),
      district: formData.get('district') || undefined,
      minPrice: formData.get('minPrice')
        ? parseFloat(formData.get('minPrice'))
        : undefined,
      maxPrice: formData.get('maxPrice')
        ? parseFloat(formData.get('maxPrice'))
        : undefined,
      minFootage: formData.get('minFootage')
        ? parseFloat(formData.get('minFootage'))
        : undefined,
      maxFootage: formData.get('maxFootage')
        ? parseFloat(formData.get('maxFootage'))
        : undefined,
      minRooms: formData.get('minRooms')
        ? parseInt(formData.get('minRooms'))
        : undefined,
      maxRooms: formData.get('maxRooms')
        ? parseInt(formData.get('maxRooms'))
        : undefined,
      minFloor: formData.get('minFloor')
        ? parseInt(formData.get('minFloor'))
        : undefined,
      maxFloor: formData.get('maxFloor')
        ? parseInt(formData.get('maxFloor'))
        : undefined,
      ownerType: formData.get('ownerType') || undefined,
      buildingType: formData.get('buildingType') || undefined,
      parkingType: formData.get('parkingType') || undefined,
      elevator: formData.get('elevator') === 'true' ? true : undefined,
      furniture: formData.get('furniture') === 'true' ? true : undefined,
      pets: formData.get('pets') === 'true' ? true : undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      discordWebhook: formData.get('discordWebhook') || undefined,
      notificationMethod: formData.get('notificationMethod') || 'EMAIL',
    }

    Object.keys(alertData).forEach(
      (key) => alertData[key] === undefined && delete alertData[key]
    )

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Nie udało się utworzyć alertu')
      }

      navigate('/alerts')
    } catch (err) {
      alert('Błąd: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function addKeyword() {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  function removeKeyword(keyword) {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  return (
    <>
      <Header />
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8">
        <div className="max-w-4xl w-full">
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition mb-6"
          >
            <ArrowLeft size={20} />
            Powrót do alertów
          </button>

          <h1 className="text-3xl font-bold text-blue-950 mb-2">
            Utwórz nowy alert
          </h1>
          <p className="text-gray-600 mb-8">
            Wypełnij formularz, aby otrzymywać powiadomienia o nowych ofertach
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="grid gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Nazwa alertu *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-gray-300 p-3"
                  placeholder="np. Kawalerka w centrum"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-blue-950 mb-2"
                  >
                    Miasto *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="np. Wrocław"
                  />
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-blue-950 mb-2"
                  >
                    Dzielnica
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="np. Stare Miasto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Cena (zł)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Metraż (m²)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minFootage"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFootage"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Liczba pokoi
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minRooms"
                    min="1"
                    max="20"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxRooms"
                    min="1"
                    max="20"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Piętro
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minFloor"
                    min="0"
                    max="50"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFloor"
                    min="0"
                    max="50"
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ownerType"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Typ właściciela
                </label>
                <select
                  id="ownerType"
                  name="ownerType"
                  className="w-full rounded-lg border border-gray-300 p-3"
                >
                  <option value="">Dowolny</option>
                  <option value="PRIVATE">Prywatny</option>
                  <option value="COMPANY">Firma</option>
                  <option value="ALL">Wszystkie</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="buildingType"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Typ budynku
                </label>
                <select
                  id="buildingType"
                  name="buildingType"
                  className="w-full rounded-lg border border-gray-300 p-3"
                >
                  <option value="">Dowolny</option>
                  <option value="BLOCK_OF_FLATS">Blok</option>
                  <option value="TENEMENT">Kamienica</option>
                  <option value="DETACHED">Dom wolnostojący</option>
                  <option value="TERRACED">Szeregowiec</option>
                  <option value="APARTMENT">Apartament</option>
                  <option value="LOFT">Loft</option>
                  <option value="OTHER">Inne</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="parkingType"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Parking
                </label>
                <select
                  id="parkingType"
                  name="parkingType"
                  className="w-full rounded-lg border border-gray-300 p-3"
                >
                  <option value="">Dowolny</option>
                  <option value="NONE">Brak</option>
                  <option value="STREET">Uliczny</option>
                  <option value="SECURED">Strzeżony</option>
                  <option value="GARAGE">Garaż</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Dodatkowe wymagania
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="elevator"
                      className="block text-sm text-gray-700 mb-1"
                    >
                      Winda
                    </label>
                    <select
                      id="elevator"
                      name="elevator"
                      className="w-full rounded-lg border border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Tak</option>
                      <option value="false">Nie</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="furniture"
                      className="block text-sm text-gray-700 mb-1"
                    >
                      Umeblowane
                    </label>
                    <select
                      id="furniture"
                      name="furniture"
                      className="w-full rounded-lg border border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Tak</option>
                      <option value="false">Nie</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="pets"
                      className="block text-sm text-gray-700 mb-1"
                    >
                      Zwierzęta
                    </label>
                    <select
                      id="pets"
                      name="pets"
                      className="w-full rounded-lg border border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Dozwolone</option>
                      <option value="false">Niedozwolone</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-950 mb-2">
                  Słowa kluczowe
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addKeyword())
                    }
                    className="flex-grow rounded-lg border border-gray-300 p-3"
                    placeholder="np. balkon, blisko metra"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                  >
                    Dodaj
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="notificationMethod"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Sposób powiadamiania
                </label>
                <select
                  id="notificationMethod"
                  name="notificationMethod"
                  className="w-full rounded-lg border border-gray-300 p-3"
                >
                  <option value="EMAIL">Email</option>
                  <option value="DISCORD">Discord</option>
                  <option value="BOTH">Email i Discord</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discordWebhook"
                  className="block text-sm font-medium text-blue-950 mb-2"
                >
                  Discord Webhook URL (opcjonalnie)
                </label>
                <input
                  type="url"
                  id="discordWebhook"
                  name="discordWebhook"
                  className="w-full rounded-lg border border-gray-300 p-3"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" loading={loading} className="flex-1">
                  Utwórz alert
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  variant="secondary"
                >
                  Anuluj
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default CreateAlertPage
