import { ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authLogin } from "../api/api";
import logo from "../assets/logo.png";
import Button from "../components/Button";
import PasswordField from "../components/PasswordField";
import useUser from "../context/UserContext/useUser";

function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, login } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoading(true);

    const userData = await authLogin({ email, password });

    if (userData) {
      login(userData);
      navigate("/dashboard", { replace: true });
    }

    setLoading(false);
  }

  return (
    <main className="flex w-full flex-col items-center justify-center p-5">
      {/* Back Button */}
      <div className="flex w-full max-w-350 flex-col items-start gap-8">
        <button
          className="flex items-center gap-2 text-blue-950 transition-colors duration-300 hover:text-blue-700"
          onClick={() => navigate("/")}
        >
          <ArrowUpIcon className="rotate-[-90deg]" />
          Powrót do strony głównej
        </button>
      </div>

      {/* Login Form Container */}
      <div className="flex h-auto w-full max-w-md flex-col items-center justify-center gap-1 p-4">
        {/* Logo and Title */}
        <div className="flex w-full flex-col items-center gap-1 p-4">
          <img
            src={logo}
            alt="Logo strony Mieszkaniownik"
            width={80}
            height={80}
            className="bg-transparent"
          />
          <span className="text-center text-2xl font-bold tracking-wider text-blue-950">
            Mieszkaniownik
          </span>
          <p className="text-center text-base text-blue-950">
            Twój klucz do studenckiego mieszkania
          </p>
        </div>

        {/* Login Form */}
        <form
          className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-blue-950">Logowanie</h1>
            <p className="text-sm text-gray-500">Podaj swój email oraz hasło</p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium text-blue-950">
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
              required={true}
              placeholder="email@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-medium text-blue-950">
              Hasło:
            </label>
            <PasswordField />
          </div>

          <div className="flex flex-col gap-1">
            <Button
              type="submit"
              loading={loading}
              className="w-full cursor-pointer"
            >
              Zaloguj się
            </Button>

            <p className="w-full text-right text-sm text-gray-500">
              Nie masz konta?{" "}
              <Link
                to="/register"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Zarejestruj się
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default LoginForm;
