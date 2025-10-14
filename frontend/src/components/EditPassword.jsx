import { useNavigate } from "react-router-dom";
import useUser from "../context/UserContext/useUser";
import { useEffect, useState } from "react";
import Button from "./Button";
import { editUser, getUserData } from "../api/api";
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
      <main className="flex flex-1 justify-center items-center">
        <Loading />
      </main>
    );
  }

  return (
    <main className="w-full flex flex-1 justify-center items-center flex-col p-5 mt-16">
      <div className="flex flex-col justify-center items-center max-w-md w-full gap-1 p-4 h-auto">
        <div className="flex flex-col gap-4 w-full border-gray-200 rounded-xl border p-4 shadow-sm">
          <div className="gap-1 flex flex-col">
            <h1 className="font-semibold text-xl text-blue-950 ">
              Zmiana hasła
            </h1>
            <p className="text-gray-500 text-sm">Edytuj swoje hasło do konta</p>
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
