export function useAuth()
{
  const loading = ref(false)

  const error = ref<string | null>(null)

  const user = useState('user', () => null as null | { username: string })


  const base = (useRuntimeConfig().public as any)?.apiBase || 'http://localhost:8000'


  const login = async (username: string, password: string) =>
  {
    loading.value = true
    error.value = null

    try
    {
      const res: any = await $fetch(`${base}/auth/login`, {
        method: 'POST',
        body: { username, password }
      })

      user.value = res?.user || { username }

      return true
    }
    catch (e: any)
    {
      error.value = e?.data?.detail || e?.message || 'Login failed'
      return false
    }
    finally
    {
      loading.value = false
    }
  }


  const signup = async (username: string, password: string) =>
  {
    loading.value = true
    error.value = null

    try
    {
      const res: any = await $fetch(`${base}/auth/signup`, {
        method: 'POST',
        body: { username, password }
      })

      user.value = res?.user || { username }

      return true
    }
    catch (e: any)
    {
      error.value = e?.data?.detail || e?.message || 'Signup failed'
      return false
    }
    finally
    {
      loading.value = false
    }
  }


  const logout = () =>
  {
    user.value = null
  }


  return { login, signup, logout, loading, error, user }
}
