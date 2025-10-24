import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUserData } from "../../api/api";

const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = window.sessionStorage.getItem("mieszkaniownik:token");
    if (!token) return;

    async function fetchUser() {
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
      }
    }

    fetchUser();
  }, []);

  function logout() {
    window.sessionStorage.removeItem("mieszkaniownik:token");
    setUser(null);
    navigate("/dashboard");
  }

  return (
    <UserContext.Provider value={{ user, login: setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
export { UserContext };
