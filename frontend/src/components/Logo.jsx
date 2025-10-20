import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

function Logo({ onClick = () => {}, isMobile = false }) {
  return (
    <div
      className={`mr-auto flex items-center ${
        isMobile ? "block" : "hidden sm:block"
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
          className="aspect-square w-12"
        />
        <span className="text-2xl font-bold">Mieszkaniownik</span>
      </Link>
    </div>
  );
}

export default Logo;
