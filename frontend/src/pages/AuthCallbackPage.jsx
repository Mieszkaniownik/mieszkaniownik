import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useUser from "../context/UserContext/useUser";
import { getUserData } from "../api/api";
import Loading from "../components/Loading";

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Nie udało się zalogować przez Google. Spróbuj ponownie.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (!token) {
      setError("Brak tokenu autoryzacji.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    window.sessionStorage.setItem("mieszkaniownik:token", token);

    try {
      const userData = getUserData();
      if (!userData)
        throw new Error("Nie udało się pobrać danych użytkownika.");
      login(userData);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Error handling Google callback:", err);
      setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center flex-grow min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {error ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Błąd logowania
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <p className="text-center text-sm text-gray-500">
              Przekierowanie za chwilę...
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <Loading />
              <h2 className="text-2xl font-bold text-blue-950 mt-4 mb-2">
                Logowanie przez Google
              </h2>
              <p className="text-gray-600">Przetwarzanie danych...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallbackPage;
