import { useState } from 'react'
import { Eye, EyeClosed } from 'lucide-react'

function PasswordField({
  id = 'password',
  name = 'password',
  placeholder = 'Podaj hasło',
  required = true,
  error = false,
  errorMessage = 'Hasła nie są identyczne',
  ...props
}) {
  {
    /* State */
  }
  const [showPassword, setShowPassword] = useState(false)

  {
    /* Render */
  }
  return (
    <>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          className={`w-full rounded-lg border-solid border-1 border-gray-300 p-2 ${
            error ? 'border-red-500' : ''
          }`}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </>
  )
}

export default PasswordField
