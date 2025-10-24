import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getUserData } from "../api/api";
import Loading from "../components/Loading";
import useUser from "../context/UserContext/useUser";

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const [error, setError] = useState(null);

  const handleCallback = useCallback(async () => {
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
  }, [searchParams, navigate, login]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="flex min-h-screen w-full flex-grow flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {error ? (
          <>
            {/* Error Display */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
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
              <h2 className="mb-2 text-2xl font-bold text-red-600">
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
            {/* Loading Display */}
            <div className="mb-6 text-center">
              <Loading />
              <h2 className="mt-4 mb-2 text-2xl font-bold text-blue-950">
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
