import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import useUser from "../context/UserContext/useUser";
import { useEffect, useState } from "react";
import { ArrowUpIcon, CircleArrowRight, CircleArrowLeft } from "lucide-react";
import PasswordField from "../components/PasswordField";
import Button from "../components/Button";
import { authRegister } from "../api/api";

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user, login } = useUser();
  const [passwordError, setPasswordError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    role: "USER",
    username: "",
    name: "",
    surname: "",
    phone: null,
    city: "",
    googleId: null,
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    formData.phone = formData.phone || null;
    delete formData.repeatPassword;

    const newUserData = await authRegister(formData);
    if (newUserData) {
      login(newUserData);
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

        <div className="flex flex-col gap-4 w-full border-gray-200 rounded-xl border p-4 shadow-sm">
          <div className="gap-1 flex flex-col">
            <h1 className="font-semibold text-xl text-blue-950 ">
              Rejestracja
            </h1>
            <p className="text-gray-500 text-sm">
              Wypełnij formularz, aby utworzyć konto
            </p>
          </div>

          <div className="relative flex items-center gap-3 my-1">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">{`Krok ${step} z 3`}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {step === 1 && (
            <form
              id="step1-form"
              className="flex flex-col gap-4"
              onSubmit={nextStep}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-medium text-blue-950">
                  Email:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  required={true}
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="font-medium text-blue-950">
                  Nazwa użytkownika:
                </label>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  required={true}
                  placeholder="Podaj nazwę użytkownika"
                />
              </div>

              <Button
                className="w-full cursor-pointer items-centers"
                type="submit"
              >
                <span>Dalej</span>
                <CircleArrowRight />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form
              id="step2-form"
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!passwordError) {
                  nextStep();
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="font-medium text-blue-950">
                  Hasło:
                </label>
                <PasswordField
                  error={passwordError}
                  value={formData.password}
                  onChange={(event) => {
                    formData.repeatPassword === event.target.value
                      ? setPasswordError(false)
                      : setPasswordError(true);

                    handleChange(event);
                  }}
                  minLength={6}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="repeatPassword"
                  className="font-medium text-blue-950"
                >
                  Powtórz hasło:
                </label>
                <PasswordField
                  id="repeatPassword"
                  name="repeatPassword"
                  placeholder="Powtórz hasło"
                  onChange={(event) => {
                    formData.password === event.target.value
                      ? setPasswordError(false)
                      : setPasswordError(true);

                    handleChange(event);
                  }}
                  value={formData.repeatPassword}
                  error={passwordError}
                  minLength={6}
                />
              </div>

              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  className="w-full cursor-pointer items-centers"
                  onClick={prevStep}
                >
                  <CircleArrowLeft />
                  <span>Wróć</span>
                </Button>

                <Button
                  type="submit"
                  className="w-full cursor-pointer items-centers"
                >
                  <span>Dalej</span>
                  <CircleArrowRight />
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              id="step3-form"
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="font-medium text-blue-950">
                  Imię:
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  required={true}
                  placeholder="Jan"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="surname" className="font-medium text-blue-950">
                  Nazwisko:
                </label>
                <input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  required={true}
                  placeholder="Nowak"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="font-medium text-blue-950">
                  Numer telefonu:
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  type="tel"
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  placeholder="Podaj numer telefonu"
                  pattern="[0-9+*#]*"
                  title="Dozwolone znaki: cyfry, +, * i #"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="city" className="font-medium text-blue-950">
                  Nazwa miasta:
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  type="text"
                  className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
                  required={true}
                  placeholder="Podaj miasto"
                />
              </div>

              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  className="w-full cursor-pointer items-centers"
                  onClick={prevStep}
                  disabled={loading}
                >
                  <CircleArrowLeft />
                  <span>Wróć</span>
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full cursor-pointer"
                >
                  Zarejestruj się
                </Button>
              </div>
            </form>
          )}
          <p className="text-gray-500 text-sm text-right w-full">
            Już masz konto?{" "}
            <Link
              to="/login"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default RegisterForm;
