import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

function PasswordField({
  id = "password",
  name = "password",
  placeholder = "Podaj hasło",
  required = true,
  error = false,
  errorMessage = "Hasła nie są identyczne",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          className={`w-full rounded-lg border-1 border-solid border-gray-300 p-2 ${
            error ? "border-red-500" : ""
          }`}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500"
        >
          {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{errorMessage}</p>}
    </>
  );
}

export default PasswordField;
