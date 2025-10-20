import { ArrowLeft, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiPost } from "../api/api";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useUser from "../context/UserContext/useUser";

function CreateAlertPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (!user && !sessionStorage.getItem("mieszkaniownik:token")) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const alertData = {
      userId: user.id,
      name: formData.get("name"),
      city: formData.get("city"),
      district: formData.get("district") || undefined,
      minPrice: formData.get("minPrice")
        ? parseFloat(formData.get("minPrice"))
        : undefined,
      maxPrice: formData.get("maxPrice")
        ? parseFloat(formData.get("maxPrice"))
        : undefined,
      minFootage: formData.get("minFootage")
        ? parseFloat(formData.get("minFootage"))
        : undefined,
      maxFootage: formData.get("maxFootage")
        ? parseFloat(formData.get("maxFootage"))
        : undefined,
      minRooms: formData.get("minRooms")
        ? parseInt(formData.get("minRooms"))
        : undefined,
      maxRooms: formData.get("maxRooms")
        ? parseInt(formData.get("maxRooms"))
        : undefined,
      minFloor: formData.get("minFloor")
        ? parseInt(formData.get("minFloor"))
        : undefined,
      maxFloor: formData.get("maxFloor")
        ? parseInt(formData.get("maxFloor"))
        : undefined,
      ownerType: formData.get("ownerType") || undefined,
      buildingType: formData.get("buildingType") || undefined,
      parkingType: formData.get("parkingType") || undefined,
      elevator: formData.get("elevator") === "true" ? true : undefined,
      furniture: formData.get("furniture") === "true" ? true : undefined,
      pets: formData.get("pets") === "true" ? true : undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      discordWebhook: formData.get("discordWebhook") || undefined,
      notificationMethod: formData.get("notificationMethod") || "EMAIL",
    };

    Object.keys(alertData).forEach(
      (key) => alertData[key] === undefined && delete alertData[key],
    );

    try {
      await apiPost("/alerts", alertData);

      navigate("/alerts");
    } catch (err) {
      alert("Błąd: Nie udało się utworzyć alertu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function addKeyword() {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  }

  function removeKeyword(keyword) {
    setKeywords(keywords.filter((k) => k !== keyword));
  }

  return (
    <>
      <Header />
      <main className="mt-16 flex min-h-[80vh] w-full flex-grow flex-col items-center p-8">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/alerts")}
            className="mb-6 flex items-center gap-2 text-blue-950 transition hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            Powrót do alertów
          </button>

          {/* Alert Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-6 shadow-sm md:px-6"
          >
            {/* Form Header */}
            <h1 className="mb-2 text-xl font-bold text-blue-950 md:text-2xl">
              Utwórz nowy alert
            </h1>
            <p className="mb-4 text-sm text-gray-600 md:text-base">
              Nie przegap nowych ofert - wypełnij formularz
            </p>

            {/* Basic Information */}
            <div className="grid w-full grid-cols-1 gap-4">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Nazwa alertu*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                  placeholder="np. Kawalerka w centrum"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 text-sm font-medium text-blue-950"
                  >
                    Miasto*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. Wrocław"
                  />
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 text-sm font-medium text-blue-950"
                  >
                    Dzielnica
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. Stare Miasto"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 text-sm font-medium text-blue-950">
                  Cena (zł)
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    className="rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    min="0"
                    step="0.01"
                    className="rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              {/* Property Parameters Section */}
              <div>
                <label className="mb-2 text-sm font-medium text-blue-950">
                  Metraż (m²)
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    name="minFootage"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFootage"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 text-sm font-medium text-blue-950">
                  Liczba pokoi
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    name="minRooms"
                    min="1"
                    max="20"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
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
                <label className="mb-2 text-sm font-medium text-blue-950">
                  Piętro
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    name="minFloor"
                    min="0"
                    max="50"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Od"
                  />
                  <input
                    type="number"
                    name="maxFloor"
                    min="0"
                    max="50"
                    className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="Do"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ownerType"
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Typ właściciela
                </label>
                <select
                  id="ownerType"
                  name="ownerType"
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
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Typ budynku
                </label>
                <select
                  id="buildingType"
                  name="buildingType"
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
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Parking
                </label>
                <select
                  id="parkingType"
                  name="parkingType"
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                >
                  <option value="">Dowolny</option>
                  <option value="NONE">Brak</option>
                  <option value="STREET">Uliczny</option>
                  <option value="SECURED">Strzeżony</option>
                  <option value="GARAGE">Garaż</option>
                </select>
              </div>

              {/* Preferences Section */}
              <div>
                <label className="mb-2 text-sm font-medium text-blue-950">
                  Dodatkowe wymagania
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="elevator"
                      className="mb-1 text-sm text-gray-700"
                    >
                      Winda
                    </label>
                    <select
                      id="elevator"
                      name="elevator"
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
                      className="mb-1 text-sm text-gray-700"
                    >
                      Umeblowane
                    </label>
                    <select
                      id="furniture"
                      name="furniture"
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
                      className="mb-1 text-sm text-gray-700"
                    >
                      Zwierzęta
                    </label>
                    <select
                      id="pets"
                      name="pets"
                      className="w-full rounded-lg border border-solid border-gray-300 p-2"
                    >
                      <option value="">Dowolne</option>
                      <option value="true">Dozwolone</option>
                      <option value="false">Niedozwolone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Keywords Section */}
              <div className="flex w-full flex-col">
                <label
                  htmlFor="keywordInput"
                  className="mb-2 text-sm font-medium text-blue-950"
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
                      e.key === "Enter" && (e.preventDefault(), addKeyword())
                    }
                    className="min-w-0 flex-1 rounded-lg border border-solid border-gray-300 p-2"
                    placeholder="np. balkon, blisko metra"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="flex-shrink-0 rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700"
                  >
                    <span className="hidden md:inline">Dodaj</span>
                    <CirclePlus className="md:hidden" size={16} />
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
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

              {/* Notification Settings */}
              <div>
                <label
                  htmlFor="notificationMethod"
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Sposób powiadamiania
                </label>
                <select
                  id="notificationMethod"
                  name="notificationMethod"
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
                  className="mb-2 text-sm font-medium text-blue-950"
                >
                  Discord Webhook URL (opcjonalnie)
                </label>
                <input
                  type="url"
                  id="discordWebhook"
                  name="discordWebhook"
                  className="w-full rounded-lg border border-solid border-gray-300 p-2"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-2">
                <Button type="submit" loading={loading} className="flex-1">
                  Utwórz <span className="hidden sm:inline">alert</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/alerts")}
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
  );
}

export default CreateAlertPage;
