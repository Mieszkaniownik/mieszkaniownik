import { ArrowUpIcon, CircleArrowLeft, CircleArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authRegister } from "../api/api";
import logo from "../assets/logo.png";
import Button from "../components/Button";
import PasswordField from "../components/PasswordField";
import useUser from "../context/UserContext/useUser";

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

      {/* Registration Form Container */}
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

        {/* Registration Form Steps */}
        <div className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-sm">
          {/* Form Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-blue-950">Rejestracja</h1>
            <p className="text-sm text-gray-500">
              Wypełnij formularz, aby utworzyć konto
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="relative my-1 flex items-center gap-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">{`Krok ${step} z 3`}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Step 1: Email & Password */}
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
                  required={true}
                  placeholder="Podaj nazwę użytkownika"
                />
              </div>

              <Button
                className="items-centers w-full cursor-pointer"
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
                  className="items-centers w-full cursor-pointer"
                  onClick={prevStep}
                >
                  <CircleArrowLeft />
                  <span>Wróć</span>
                </Button>

                <Button
                  type="submit"
                  className="items-centers w-full cursor-pointer"
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
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
                  className="w-full rounded-lg border-1 border-solid border-gray-300 p-2"
                  required={true}
                  placeholder="Podaj miasto"
                />
              </div>

              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  className="items-centers w-full cursor-pointer"
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
          <p className="w-full text-right text-sm text-gray-500">
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
