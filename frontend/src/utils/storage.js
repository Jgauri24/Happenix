const AUTH_STORAGE_KEY = 'auth-storage';
// loading authentication from localstorage 
export const loadAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state || parsed || { user: null, token: null };
    }
  } catch (err) {
    console.error("Error loading authState:", err);
  }
  return { user: null, token: null };
};
// save authentication state to localstorage
export const saveAuthState=(state)=>{
    try{
        localStorage.setItem(AUTH_STORAGE_KEY,JSON.stringify({state}))

    }catch(e){
        console.error('Error saving auth state:', e);
    }
}
// clear authentication state from localstorage
export const clearAuthState=()=>{
    try{
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }catch(e){
        console.error('Error clearing auth state:', e);
    }
}
// get token from localstorage 
export const getToken = () => {
    const state = loadAuthState();
    return state.token;
  };
  