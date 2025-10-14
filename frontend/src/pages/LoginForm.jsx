import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import useUser from "../context/UserContext/useUser";
import { useEffect, useState } from "react";
import { authLogin } from "../api/api";
import { ArrowUpIcon } from "lucide-react";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";

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
    <main className="w-full flex justify-center items-center flex-col p-5">
      <div className="flex flex-col gap-8 items-start w-full max-w-350">
        <button
          className="flex items-center gap-2 text-blue-950 hover:text-blue-700 transition-colors duration-300"
          onClick={() => navigate("/")}
        >
          <ArrowUpIcon className="rotate-[-90deg]" />
          Powrót do strony głównej
        </button>
      </div>
      <div className="flex flex-col justify-center items-center max-w-md w-full gap-1 p-4 h-auto">
        <div className="flex flex-col items-center gap-1 p-4 w-full">
          <img
            src={logo}
            alt="Logo strony Mieszkaniownik"
            width={80}
            height={80}
            className="bg-transparent"
          />
          <span className="text-center text-blue-950 font-bold text-2xl tracking-wider">
            Mieszkaniownik
          </span>
          <p className="text-center text-blue-950 text-base">
            Twój klucz do studenckiego mieszkania
          </p>
        </div>

        <form
          className="flex flex-col gap-4 w-full border-gray-200 rounded-xl border p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="gap-1 flex flex-col">
            <h1 className="font-semibold text-xl text-blue-950 ">Logowanie</h1>
            <p className="text-gray-500 text-sm">Podaj swój email oraz hasło</p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium text-blue-950">
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
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

            <p className="text-gray-500 text-sm text-right w-full">
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
