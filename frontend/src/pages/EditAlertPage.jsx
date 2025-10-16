import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import useUser from '../context/UserContext/useUser'
import { apiGet, apiPatch } from '../api/api'
import { ArrowLeft, CirclePlus, Loader2 } from 'lucide-react'
import Button from '../components/Button'

function EditAlertPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [keywords, setKeywords] = useState([])
  const [keywordInput, setKeywordInput] = useState('')

  const fetchAlert = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet(`/alerts/${id}`)
      setAlert(data)
      if (data.keywords) {
        setKeywords(data.keywords)
      }
    } catch (err) {
      alert('Błąd: Nie udało się pobrać alertu')
      console.error(err)
      navigate('/alerts')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (!user && !sessionStorage.getItem('mieszkaniownik:token')) {
      navigate('/login', { replace: true })
      return
    }
    fetchAlert()
  }, [user, navigate, fetchAlert])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.target)

    const alertData = {
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
      await apiPatch(`/alerts/${id}`, alertData)
      navigate(`/matches?alert=${id}`)
    } catch (err) {
      alert('Błąd: Nie udało się zaktualizować alertu')
      console.error(err)
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-center h-64">
              <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!alert) {
    return (
      <>
        <Header />
        <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
          <div className="max-w-4xl w-full">
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition mb-6"
            >
              <ArrowLeft size={20} />
              Powrót do alertów
            </button>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Alert nie został znaleziony
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
      <main className="w-full flex flex-col items-center flex-grow min-h-[80vh] p-8 mt-16">
        <div className="max-w-4xl w-full">
          <button
            onClick={() => navigate(`/alerts`)}
            className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition mb-6"
          >
            <ArrowLeft size={20} />
            Powrót do alertów
          </button>

          <form
            onSubmit={handleSubmit}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 md:px-6 py-6 shadow-sm"
          >
            <h1 className="text-xl md:text-2xl font-bold text-blue-950 mb-2">
              Edytuj alert
            </h1>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Zmień parametry swojego alertu
            </p>

            <div className="w-full grid grid-cols-1 gap-4">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Nazwa alertu*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={alert.name}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                  placeholder="np. Kawalerka w centrum"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-medium text-blue-950 mb-2"
                  >
                    Miasto*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    defaultValue={alert.city}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. Wrocław"
                  />
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="text-sm font-medium text-blue-950 mb-2"
                  >
                    Dzielnica
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    defaultValue={alert.district || ''}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. Stare Miasto"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-950 mb-2">
                  Cena (zł)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    defaultValue={alert.minPrice || ''}
                    className="rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    min="0"
                    step="0.01"
                    defaultValue={alert.maxPrice || ''}
                    className="rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className=" text-sm font-medium text-blue-950 mb-2">
                  Metraż (m²)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minFootage"
                    min="0"
                    step="0.01"
                    defaultValue={alert.minFootage || ''}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFootage"
                    min="0"
                    step="0.01"
                    defaultValue={alert.maxFootage || ''}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className=" text-sm font-medium text-blue-950 mb-2">
                  Liczba pokoi
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minRooms"
                    min="1"
                    max="20"
                    defaultValue={alert.minRooms || ''}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxRooms"
                    min="1"
                    max="20"
                    defaultValue={alert.maxRooms || ''}
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-950 mb-2">
                  Piętro
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minFloor"
                    min="0"
                    max="50"
                    defaultValue={
                      alert.minFloor !== null && alert.minFloor !== undefined
                        ? alert.minFloor
                        : ''
                    }
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFloor"
                    min="0"
                    max="50"
                    defaultValue={alert.maxFloor || ''}
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ownerType"
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Typ właściciela
                </label>
                <select
                  id="ownerType"
                  name="ownerType"
                  defaultValue={alert.ownerType || ''}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
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
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Typ budynku
                </label>
                <select
                  id="buildingType"
                  name="buildingType"
                  defaultValue={alert.buildingType || ''}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
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
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Parking
                </label>
                <select
                  id="parkingType"
                  name="parkingType"
                  defaultValue={alert.parkingType || ''}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                >
                  <option value="">Dowolny</option>
                  <option value="NONE">Brak</option>
                  <option value="STREET">Uliczny</option>
                  <option value="SECURED">Strzeżony</option>
                  <option value="GARAGE">Garaż</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-950 mb-2">
                  Dodatkowe wymagania
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="elevator"
                      className="text-sm text-gray-700 mb-1"
                    >
                      Winda
                    </label>
                    <select
                      id="elevator"
                      name="elevator"
                      defaultValue={
                        alert.elevator === null
                          ? ''
                          : alert.elevator
                          ? 'true'
                          : 'false'
                      }
                      className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Tak</option>
                      <option value="false">Nie</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="furniture"
                      className="text-sm text-gray-700 mb-1"
                    >
                      Umeblowane
                    </label>
                    <select
                      id="furniture"
                      name="furniture"
                      defaultValue={
                        alert.furniture === null
                          ? ''
                          : alert.furniture
                          ? 'true'
                          : 'false'
                      }
                      className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Tak</option>
                      <option value="false">Nie</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="pets"
                      className="text-sm text-gray-700 mb-1"
                    >
                      Zwierzęta
                    </label>
                    <select
                      id="pets"
                      name="pets"
                      defaultValue={
                        alert.pets === null ? '' : alert.pets ? 'true' : 'false'
                      }
                      className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Dozwolone</option>
                      <option value="false">Niedozwolone</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col">
                <label
                  htmlFor="keywordInput"
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Słowa kluczowe
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    id="keywordInput"
                    name="keywordInput"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addKeyword())
                    }
                    className="min-w-0 flex-1 rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. balkon, blisko metra"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="flex-shrink-0 bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                  >
                    <span className="hidden md:inline">Dodaj</span>
                    <CirclePlus className="md:hidden" size={16} />
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
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
                          <CirclePlus className="rotate-45" size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="notificationMethod"
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Sposób powiadamiania
                </label>
                <select
                  id="notificationMethod"
                  name="notificationMethod"
                  defaultValue={alert.notificationMethod || 'EMAIL'}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                >
                  <option value="EMAIL">Email</option>
                  <option value="DISCORD">Discord</option>
                  <option value="BOTH">Email i Discord</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discordWebhook"
                  className="text-sm font-medium text-blue-950 mb-2"
                >
                  Discord Webhook URL (opcjonalnie)
                </label>
                <input
                  type="url"
                  id="discordWebhook"
                  name="discordWebhook"
                  defaultValue={alert.discordWebhook || ''}
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" loading={saving} className="flex-1">
                  Zapisz <span className="hidden sm:inline">zmiany</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(`/alerts`)}
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

export default EditAlertPage
