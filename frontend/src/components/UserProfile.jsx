import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { editUser, getUserData } from "../api/api";
import useUser from "../context/UserContext/useUser";
import Button from "./Button";
import Loading from "./Loading";

function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { user, login } = useUser();
  const [formData, setFormData] = useState({
    ...user,
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (!user && !sessionStorage.getItem("mieszkaniownik:token")) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setFormData({
      ...user,
      password: "",
      repeatPassword: "",
      phone: user?.phone || "",
    });
  }, [user]);

  const nextStep = () => setPage(page + 1);
  const prevStep = () => setPage(page - 1);

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

    const resBody = { active: true };

    for (const key in formData) {
      if (formData[key] && formData[key] !== user[key]) {
        resBody[key] = formData[key];
      }
    }

    if (Object.keys(resBody).length === 1) {
      alert("Brak zmian do zapisania");
      setLoading(false);
      return;
    }

    const saveOk = await editUser(resBody, user.email);
    if (saveOk) {
      login(await getUserData());
      setPage(1);
    }

    setLoading(false);
  }

  if (!user && sessionStorage.getItem("mieszkaniownik:token")) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loading />
      </main>
    );
  }

  return (
    <main className="mt-16 flex w-full flex-1 flex-col items-center justify-center p-5">
      <div className="flex h-auto w-full max-w-md flex-col items-center justify-center gap-1 p-4">
        <div className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-blue-950">Twoje konto</h1>
            <p className="text-sm text-gray-500">
              Przeglądaj i edytuj swoje dane
            </p>
          </div>

          <div className="relative my-1 flex items-center gap-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">{`Strona ${page} z 2`}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {page === 1 && (
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

          {page === 2 && (
            <form
              id="step2-form"
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
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          )}

          <p className="w-full text-right text-sm text-gray-500">
            Konto utworzone:{" "}
            <time dateTime={user.createdAt}>
              {new Date(user.createdAt).toLocaleDateString("pl-PL")}
            </time>
          </p>
        </div>
      </div>
    </main>
  );
}

export default UserProfile;
