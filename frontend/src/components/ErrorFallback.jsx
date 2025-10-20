import { useNavigate } from "react-router-dom";

function ErrorFallback({ error }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5">
      <h1 className="text-center text-4xl font-bold tracking-wider text-blue-950">
        Coś poszło nie tak
      </h1>
      <p className="text-center text-2xl text-blue-950">{error?.message}</p>
      <button
        onClick={() => navigate("/")}
        className="rounded-lg border-1 border-solid bg-blue-500 p-3 text-white transition-colors duration-300 hover:bg-blue-600"
      >
        Powrót do strony głównej
      </button>
    </div>
  );
}

export default ErrorFallback;
