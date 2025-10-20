import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { editUser, getUserData } from "../api/api";
import useUser from "../context/UserContext/useUser";
import Button from "./Button";
import Loading from "./Loading";
import PasswordField from "./PasswordField";

function EditPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, login } = useUser();
  const [passwordError, setPasswordError] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    repeatPassword: "",
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (passwordError) {
      return;
    }

    setLoading(true);

    const resBody = { password: formData.password, active: true };
    const saveOk = await editUser(resBody, user.email);
    if (saveOk) {
      login(await getUserData());
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
            <h1 className="text-xl font-semibold text-blue-950">
              Zmiana hasła
            </h1>
            <p className="text-sm text-gray-500">Edytuj swoje hasło do konta</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-medium text-blue-950">
                Nowe hasło:
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
                minLength={5}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="repeatPassword"
                className="font-medium text-blue-950"
              >
                Powtórz nowe hasło:
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
                minLength={5}
              />
            </div>

            <div className="flex flex-row gap-1">
              <Button
                type="submit"
                loading={loading}
                className="w-full cursor-pointer"
              >
                Zapisz zmiany hasła
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default EditPassword;
