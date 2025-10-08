import { useNavigate } from 'react-router-dom'
import useUser from '../context/UserContext/useUser'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/api'
import Loading from './Loading'

function UserProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { user, login } = useUser()

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const [email, setEmail] = useState(user?.email || '')
  const [name, setName] = useState(user?.name || '')
  const [surname, setSurname] = useState(user?.surname || '')

  if (!user) return null

  async function handleSave(e) {
    e.preventDefault()
    if (!window.confirm('Czy na pewno chcesz zaktualizować dane konta?')) return

    const formData = new FormData(e.target)

    const updates = {}
    if (formData.get('email') !== user.email)
      updates.email = formData.get('email')
    if (formData.get('name') !== user.name) updates.name = formData.get('name')
    if (formData.get('surname') !== user.surname)
      updates.surname = formData.get('surname')

    if (Object.keys(updates).length === 0) {
      alert('Brak zmian do zapisania.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/users/${user.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Błąd aktualizacji')
      }

      const updatedUser = await res.json()
      alert('Dane konta zostały zmienione pomyślnie!')
      login(updatedUser)
      setEmail(updatedUser.email)
      setName(updatedUser.name)
      setSurname(updatedUser.surname)
    } catch (err) {
      alert(`Nie udało się zaktualizować danych: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full mt-18 flex justify-center items-center flex-col p-5">
      <div className="flex flex-col justify-center items-center max-w-md w-full gap-1 p-4 h-auto">
        <form
          className="flex flex-col gap-6 w-full border-gray-200 rounded-xl border p-4 shadow-sm"
          onSubmit={handleSave}
        >
          <div className="gap-1 flex flex-col">
            <h1 className="font-semibold text-xl text-blue-950 ">
              Twoje konto
            </h1>
            <p className="text-gray-500 text-sm">
              Przeglądaj i edytuj swoje dane
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium text-blue-950">
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-medium text-blue-950">
              Imię:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
              required={true}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="surname" className="font-medium text-blue-950">
              Nazwisko:
            </label>
            <input
              id="surname"
              name="surname"
              type="text"
              className="w-full rounded-lg border-solid border-1 border-gray-300 p-2"
              required={true}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Nowak"
            />
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="submit"
              className="cursor-pointer disabled:cursor-default disabled:opacity-50 rounded-lg border-solid border-1  p-2 text-white bg-blue-500 not-disabled:hover:bg-blue-600 transition-colors duration-300"
              disabled={loading}
            >
              Zapisz zmiany
            </button>

            <p className="text-gray-500 text-sm text-right w-full">
              Konto utworzone:{' '}
              <time dateTime={user.createdAt}>
                {new Date(user.createdAt).toLocaleDateString('pl-PL')}
              </time>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default UserProfile
