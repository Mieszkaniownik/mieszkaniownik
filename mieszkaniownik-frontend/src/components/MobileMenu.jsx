import { X } from "lucide-react";
import { Link } from "react-router-dom";

import { menuItems } from "../constants/menuItems";
import Logo from "./Logo";

function MobileMenu({ setMenuOpen, user }) {
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <menu className="fixed top-0 left-0 z-50 flex min-h-screen w-full flex-col bg-blue-950 p-6 text-white">
      <div className="flex flex-row items-center justify-between">
        <Logo onClick={closeMenu} isMobile={true} />
        <X className="h-10 w-10" onClick={closeMenu} />
      </div>
      <ul className="mt-10 flex flex-col items-center text-center align-middle text-2xl font-semibold uppercase">
        {menuItems
          .filter((item, index) => user || index === 0)
          .map((item, key) => (
            <li
              className="w-full border-b border-blue-100 p-6 last:border-none"
              onClick={closeMenu}
              key={key}
            >
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
      </ul>
    </menu>
  );
}

export default MobileMenu;
