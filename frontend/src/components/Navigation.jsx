import { Link } from 'react-router-dom'
import useUser from '../context/UserContext/useUser'
import { useState, useEffect } from 'react'
import {
  Menu,
  ChevronsUpDown,
  LogOut,
  CircleUserRound,
  UserRoundPen,
  Bell,
  Heart,
  Map,
  LayoutDashboard,
} from 'lucide-react'
import MobileMenu from './MobileMenu'
import Logo from './Logo'

function Navigation() {
  const { user, logout } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav className="flex flex-row align-middle items-center w-full max-w-350 px-6 py-3">
      <Menu
        className="md:hidden w-8 h-8 mr-auto sm:mr-4 cursor-pointer "
        onClick={() => setMenuOpen(true)}
      />

      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} />}

      <Logo />

      <div className="flex text-lg flex-row gap-4 items-center font-semibold">
        <ul className="hidden md:flex flex-row">
          {user && (
            <>
              <li className="p-2 transition-colors rounded-lg hover:bg-blue-600/40 ">
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="p-2 transition-colors rounded-lg hover:bg-blue-600/40 ">
                <Link to="/alerts">Moje Alerty</Link>
              </li>
              <li className="p-2 transition-colors rounded-lg hover:bg-blue-600/40 ">
                <Link to="/matches">Dopasowania</Link>
              </li>
              <li className="p-2 transition-colors rounded-lg hover:bg-blue-600/40 ">
                <Link to="/heatmap">Mapa</Link>
              </li>
            </>
          )}
        </ul>

        <div className="flex flex-row items-center gap-2 ml-auto relative">
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-2 hover:bg-blue-600/40 rounded-lg transition-colors"
                >
                  <CircleUserRound className="w-8 h-8" />
                  <div className="flex items-center flex-row gap-1">
                    {`${user.name} ${user.surname}`}
                    <ChevronsUpDown className="w-5 h-5" />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute overflow-hidden right-0 mt-2 w-40 bg-white text-blue-950 rounded-lg shadow-lg flex flex-col">
                    <Link
                      to="/profile"
                      className="hover:bg-blue-100 py-2 px-4 w-full"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserRoundPen className="inline-block w-4 h-4 mr-2" />
                      Profil
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        setDropdownOpen(false)
                      }}
                      className="text-left hover:bg-blue-100 py-2 px-4 w-full"
                    >
                      <LogOut className="inline-block w-4 h-4 mr-2" />
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="p-2 transition-colors rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Zaloguj się
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
