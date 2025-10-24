import {
  ChevronsUpDown,
  CircleUserRound,
  KeyRound,
  LogOut,
  Menu,
  UserRoundPen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Skeleton from "../components/Skeleton";
import { menuItems } from "../constants/menuItems";
import useUser from "../context/UserContext/useUser";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

function Navigation() {
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="flex w-full max-w-350 flex-row items-center px-6 py-3 align-middle">
      <Menu
        className="mr-auto h-8 w-8 cursor-pointer sm:mr-4 xl:hidden"
        onClick={() => setMenuOpen(true)}
      />
      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} user={user} />}

      <Logo />

      <div className="flex flex-row items-center gap-4 text-lg font-semibold">
        <ul className="hidden flex-row gap-2 xl:flex">
          {menuItems
            .filter(() => user)
            .map((item, key) => (
              <li
                className="rounded-lg p-2 transition-colors hover:bg-blue-600/40"
                key={key}
              >
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
        </ul>

        <div className="relative ml-auto flex flex-row items-center gap-2">
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-blue-600/40"
                >
                  <CircleUserRound className="h-8 w-8" />
                  <div className="flex flex-row items-center gap-1">
                    {`${user.name} ${user.surname}`}
                    <ChevronsUpDown className="h-5 w-5" />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 flex w-40 flex-col overflow-hidden rounded-lg bg-white text-blue-950 shadow-lg">
                    <Link
                      to="/profile"
                      className="w-full px-4 py-2 hover:bg-blue-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserRoundPen className="mr-2 inline-block h-4 w-4" />
                      Profil
                    </Link>
                    <Link
                      to="/profile/edit/password"
                      className="w-full px-4 py-2 hover:bg-blue-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <KeyRound className="mr-2 inline-block h-4 w-4" />
                      Edytuj hasło
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-blue-100"
                    >
                      <LogOut className="mr-2 inline-block h-4 w-4" />
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : !user && window.sessionStorage.getItem("mieszkaniownik:token") ? (
            <>
              <Skeleton className="h-8 w-8" variant="circular" />
              <Skeleton className="h-4 w-30" />
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 p-2 transition-colors hover:bg-blue-700"
            >
              Zaloguj się
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
