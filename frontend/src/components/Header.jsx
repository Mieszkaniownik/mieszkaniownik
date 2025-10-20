import Navigation from "./Navigation";

function Header() {
  return (
    <header className="fixed top-0 left-0 z-1000 flex w-full justify-center bg-blue-900 text-white">
      <Navigation />
    </header>
  );
}

export default Header;
