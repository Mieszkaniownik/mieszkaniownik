import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import backgroundImage from "../assets/home-background.png";
import useUser from "../context/UserContext/useUser";

function Home() {
  const navigate = useNavigate();
  const { user } = useUser();

  function handleOnClick() {
    if (user) navigate("/dashboard");
    else navigate("/login");
  }

  return (
    <>
      <section
        className="relative flex h-[90dvh] w-full flex-col items-center justify-center bg-cover bg-fixed bg-top bg-no-repeat p-8"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-wider text-white sm:text-4xl md:text-6xl">
            Witamy w MIESZKANIOWNIKU!
          </h1>
          <p className="text-lg text-white sm:text-xl md:text-2xl">
            Twój klucz do studenckiego mieszkania
          </p>
          <button
            onClick={handleOnClick}
            className="rounded-md bg-blue-800 px-8 py-3 text-white transition duration-300 hover:bg-blue-700"
          >
            Zacznij teraz
          </button>
        </div>
      </section>

      <section className="flex flex-col items-center bg-gray-50 px-4 py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold text-blue-950 sm:text-4xl">
          Jak działa MIESZKANIOWNIK?
        </h2>
        <p className="max-w-2xl text-lg text-gray-700 sm:text-xl">
          Znajdź idealne mieszkanie studenckie w kilka minut. Przeglądaj oferty,
          kontaktuj się bezpośrednio z właścicielami i zarządzaj swoimi
          ogłoszeniami w jednym miejscu.
        </p>
      </section>

      <section className="flex w-full flex-col items-center gap-12 bg-white px-4 py-20">
        <h2 className="mb-12 text-center text-2xl font-bold text-blue-950 sm:text-4xl">
          Nasze funkcje
        </h2>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl p-6 text-center shadow transition hover:shadow-lg">
            <HomeIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="mb-2 text-xl font-semibold">Łatwe wyszukiwanie</h3>
            <p className="text-gray-600">
              Przeglądaj mieszkania według lokalizacji, ceny i preferencji.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl p-6 text-center shadow transition hover:shadow-lg">
            <UserIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="mb-2 text-xl font-semibold">Bezpieczne konto</h3>
            <p className="text-gray-600">
              Zarejestruj się i zarządzaj swoimi ogłoszeniami w bezpieczny
              sposób.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl p-6 text-center shadow transition hover:shadow-lg">
            <BellIcon size={48} className="mb-4 text-blue-950" />
            <h3 className="mb-2 text-xl font-semibold">
              Znajdź mieszkanie pierwszy
            </h3>
            <p className="text-gray-600">
              Bądź pierwszy, który dowie się o nowych ofertach dopasowanych do
              Twoich preferencji!
            </p>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center justify-center bg-blue-900 px-4 py-20 text-white">
        <h2 className="mb-6 text-center text-2xl font-bold sm:text-4xl">
          Gotowy, aby znaleźć swoje mieszkanie?
        </h2>
        <button
          onClick={handleOnClick}
          className="rounded-md bg-white px-8 py-3 text-blue-950 transition duration-300 hover:bg-gray-200"
        >
          Zacznij teraz
        </button>
      </section>
    </>
  );
}

export default Home;
