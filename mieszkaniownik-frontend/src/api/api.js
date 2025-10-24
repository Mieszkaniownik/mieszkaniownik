export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = window.sessionStorage.getItem("mieszkaniownik:token");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: options.body }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "Nieznany błąd API",
        response.status,
      );
    }

    return response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    throw new ApiError("Błąd sieci", { originalError: err });
  }
}

export const apiGet = (endpoint) => apiRequest(endpoint, { method: "GET" });

export const apiPost = (endpoint, data) =>
  apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiPatch = (endpoint, data) =>
  apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiDelete = (endpoint) =>
  apiRequest(endpoint, { method: "DELETE" });

export async function authLogin({ email, password }) {
  try {
    const data = await apiPost("/auth/login", { email, password });

    window.sessionStorage.setItem("mieszkaniownik:token", data.token);

    const userData = await getUserData();
    return userData;
  } catch (err) {
    console.error(err);
    if (err.status === 400) {
      alert("Podany email nie jest poprawny");
      return null;
    }

    if (err.status === 401) {
      alert("Nieprawidłowy email, hasło lub konto nieaktywne");
      return null;
    }

    if (err.status === 404) {
      alert("Konto o podanym emailu nie istnieje");
      return null;
    }

    alert("Błąd logowania");
    return null;
  }
}

export async function authRegister(userData = {}) {
  try {
    await apiPost("/auth/register", userData);

    alert("Rejestracja zakończona sukcesem");
    const newUserData = authLogin({
      email: userData.email,
      password: userData.password,
    });

    return newUserData;
  } catch (err) {
    console.error(err);
    if (err.status === 400) {
      alert("Nieprawidłowe dane lub walidacja nie powiodła się");
      return null;
    }

    if (err.status === 409) {
      alert("Konto o podanych danych już istnieje");
      return null;
    }

    alert("Błąd rejestracji");
    return null;
  }
}

export async function getUserData() {
  try {
    const userData = await apiGet("/auth/me");

    return userData;
  } catch (err) {
    console.error(err);
    if (err.status === 401 || err.status === 500) {
      window.sessionStorage.removeItem("mieszkaniownik:token");
      alert("Sesja wygasła, zaloguj się ponownie");
      return;
    }
    alert("Nie udało się pobrać danych użytkownika");
  }
}

export async function editUser(body, email) {
  try {
    await apiPatch(`/users/${email}`, {
      ...body,
      updatedAt: new Date().toISOString(),
    });
    alert("Dane użytkownika zaktualizowane pomyślnie");
    return true;
  } catch (err) {
    console.error(err);
    if (err.status === 400) {
      alert("Złe dane lub walidacja nie powiodła się");
    } else if (err.status === 403) {
      alert("Zmiana danych innego użytkownika jest niedozwolona");
    } else alert("Nie udało się zaktualizować danych użytkownika");
    return false;
  }
}
