import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

function Logo({ onClick = () => {}, isMobile = false }) {
  {
    /* Render */
  }
  return (
    <div
      className={`flex items-center mr-auto ${
        isMobile ? 'block' : 'hidden sm:block'
      }`}
    >
      <Link
        to="/"
        onClick={onClick}
        className="flex flex-row items-center gap-2"
      >
        <img
          src={logo}
          alt="Logo strony Mieszkaniownik"
          className="w-12 aspect-square"
        />
        <span className="text-2xl font-bold">Mieszkaniownik</span>
      </Link>
    </div>
  )
}

export default Logo
