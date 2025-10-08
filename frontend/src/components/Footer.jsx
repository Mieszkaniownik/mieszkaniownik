function Footer() {
  return (
    <footer className="flex flex-col w-full bg-blue-950 text-white p-4 gap-4 text-center">
      <div className="flex flex-col gap-6 items-center max-w-5xl mx-auto md:flex-row justify-between">
        <span>
          Frontend:{" "}
          <a
            href="https://github.com/moshenetsb"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors inline-block underline-offset-4 hover:underline"
          >
            @moshenetsb
          </a>
        </span>
        <span>
          Backend:{" "}
          <a
            href="https://github.com/Drake3001"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors inline-block underline-offset-4 hover:underline"
          >
            @Drake3001
          </a>{" "}
          <a
            href="https://github.com/wsparcie"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors inline-block underline-offset-4 hover:underline"
          >
            @wsparcie
          </a>{" "}
          <a
            href="https://github.com/ptakj"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors inline-block underline-offset-4 hover:underline"
          >
            @ptakj
          </a>
        </span>
        <span>
          PM:{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors inline-block underline-offset-4 hover:underline"
          >
            @#
          </a>
        </span>
      </div>
      <div className="text-gray-300 text-sm w-full text-center">
        &copy; 2025 – Zrobione w czasie Solvro Wakacyjne Wyzwanie 2025
      </div>
    </footer>
  );
}

export default Footer;
