// Login/register pages: skip them when already logged in
export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn.value) return navigateTo("/customers");
});
