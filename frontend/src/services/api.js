const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const testAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
  }
};