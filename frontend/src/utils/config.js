// Backend URL configuration
export const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://happenix.vercel.app/';
    return apiUrl.replace('/api', '');
  };
  
  export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${getBackendUrl()}${path}`;
  };
  