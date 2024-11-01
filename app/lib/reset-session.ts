export function resetSession() {
  //
  //  Remove cookies
  //
  document.cookie = `SessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
