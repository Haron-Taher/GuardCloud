export const useApi = () =>
{
  const config = useRuntimeConfig()

  const api = $fetch.create(
  {
    baseURL: config.public.apiBase
  })

  return api
}
