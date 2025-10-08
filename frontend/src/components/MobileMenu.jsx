import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import Logo from './Logo'
import useUser from '../context/UserContext/useUser'

function MobileMenu({ setMenuOpen }) {
  const { user } = useUser()

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <menu className="fixed top-0 left-0 w-full min-h-screen bg-blue-950 text-white p-6 flex flex-col z-50">
      <div className="flex flex-row justify-between items-center">
        <Logo onClick={closeMenu} isMobile={true} />
        <X className="w-10 h-10 " onClick={closeMenu} />
      </div>
      <ul className="flex flex-col align-middle items-center text-center uppercase mt-10 text-2xl font-semibold">
        {user && (
          <>
            <li
              className="p-4 w-full border-b border-blue-100 last:border-none"
              onClick={closeMenu}
            >
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li
              className="p-4 w-full border-b border-blue-100 last:border-none"
              onClick={closeMenu}
            >
              <Link to="/alerts">Moje Alerty</Link>
            </li>
            <li
              className="p-4 w-full border-b border-blue-100 last:border-none"
              onClick={closeMenu}
            >
              <Link to="/matches">Dopasowania</Link>
            </li>
            <li
              className="p-4 w-full border-b border-blue-100 last:border-none"
              onClick={closeMenu}
            >
              <Link to="/heatmap">Mapa</Link>
            </li>
          </>
        )}
      </ul>
    </menu>
  )
}

export default MobileMenu
