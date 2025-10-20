function Footer() {
  return (
    <footer className="flex w-full flex-col gap-4 bg-blue-950 p-4 text-center text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <span>
          Frontend:{" "}
          <a
            href="https://github.com/moshenetsb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @moshenetsb
          </a>{" "}
          <a
            href="https://github.com/wsparcie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @wsparcie
          </a>
        </span>
        <span>
          Backend:{" "}
          <a
            href="https://github.com/Drake3001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @Drake3001
          </a>{" "}
          <a
            href="https://github.com/wsparcie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @wsparcie
          </a>{" "}
          <a
            href="https://github.com/ptakj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @ptakj
          </a>
        </span>
        <span>
          PM:{" "}
          <a
            href="https://github.com/StudentSkunek"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block underline-offset-4 transition-colors hover:text-gray-300 hover:underline"
          >
            @StudentSkunek
          </a>
        </span>
      </div>
      <div className="w-full text-center text-sm text-gray-300">
        &copy; 2025 – Zrobione w czasie Solvro Wakacyjne Wyzwanie 2025
      </div>
    </footer>
  );
}

export default Footer;
