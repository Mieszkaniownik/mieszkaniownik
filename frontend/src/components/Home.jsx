import backgroundImage from "../assets/home-background.png";
import { useNavigate } from "react-router-dom";
import { HomeIcon, UserIcon, KeyIcon } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section
        className="w-full relative flex flex-col items-center justify-center min-h-screen p-8 bg-top bg-fixed bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col gap-6 items-center text-center">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-wider">
            Witamy w MIESZKANIOWNIKU!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white">
            Twój klucz do studenckiego mieszkania
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-800 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Zacznij teraz
          </button>
        </div>
      </section>

      <section className="flex flex-col items-center text-center py-20 px-4 bg-gray-50">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-950">
          Jak działa MIESZKANIOWNIK?
        </h2>
        <p className="max-w-2xl text-gray-700 text-lg sm:text-xl">
          Znajdź idealne mieszkanie studenckie w kilka minut. Przeglądaj oferty,
          kontaktuj się bezpośrednio z właścicielami i zarządzaj swoimi
          ogłoszeniami w jednym miejscu.
        </p>
      </section>

      <section className="w-full flex flex-col items-center py-20 px-4 bg-white gap-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-blue-950 mb-12 text-center">
          Nasze funkcje
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl w-full">
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow hover:shadow-lg transition">
            <HomeIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="text-xl font-semibold mb-2">Łatwe wyszukiwanie</h3>
            <p className="text-gray-600">
              Przeglądaj mieszkania według lokalizacji, ceny i preferencji.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow hover:shadow-lg transition">
            <UserIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="text-xl font-semibold mb-2">Bezpieczne konto</h3>
            <p className="text-gray-600">
              Zarejestruj się i zarządzaj swoimi ogłoszeniami w bezpieczny
              sposób.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow hover:shadow-lg transition">
            <KeyIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="text-xl font-semibold mb-2">Łatwy kontakt</h3>
            <p className="text-gray-600">
              Kontaktuj się bezpośrednio z właścicielami i umów spotkanie
              online.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full flex flex-col items-center justify-center py-20 px-4 bg-blue-900 text-white">
        <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
          Gotowy, aby znaleźć swoje mieszkanie?
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-blue-950 px-8 py-3 rounded-md hover:bg-gray-200 transition duration-300"
        >
          Zacznij teraz
        </button>
      </section>
    </>
  );
}

export default Home;
