export const createGuestUser = (username: String) =>{
    const cleanUsername = username.trim();

  if (cleanUsername.length < 2 || cleanUsername.length > 16) {
    throw new Error('Username must be between 2 and 16 characters.');
  }

  return {
    username: cleanUsername,
  }
}