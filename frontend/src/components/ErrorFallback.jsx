import { useNavigate } from 'react-router-dom'

function ErrorFallback({ error }) {
  const navigate = useNavigate()

  {
    /* Render */
  }
  return (
    <div className="flex flex-col items-center justify-center gap-5 min-h-screen">
      <h1 className="text-center text-blue-950 font-bold text-4xl tracking-wider">
        Coś poszło nie tak
      </h1>
      <p className="text-center text-blue-950 text-2xl">{error?.message}</p>
      <button
        onClick={() => navigate('/')}
        className="rounded-lg border-solid border-1  p-3 text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
      >
        Powrót do strony głównej
      </button>
    </div>
  )
}

export default ErrorFallback
