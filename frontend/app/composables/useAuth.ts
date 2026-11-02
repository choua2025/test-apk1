export interface Member {
  member_id: number;
  member_name: string;
}

// Token expires after 1h on the backend, so the cookie does too
const MAX_AGE = 60 * 60;

export function useAuth() {
  const token = useCookie<string | null>("token", { maxAge: MAX_AGE, sameSite: "lax" });
  const member = useCookie<Member | null>("member", { maxAge: MAX_AGE, sameSite: "lax" });

  const isLoggedIn = computed(() => !!token.value);

  function setSession(newToken: string, newMember: Member) {
    token.value = newToken;
    member.value = newMember;
  }

  async function logout() {
    token.value = null;
    member.value = null;
    await navigateTo("/login");
  }

  return { token, member, isLoggedIn, setSession, logout };
}
