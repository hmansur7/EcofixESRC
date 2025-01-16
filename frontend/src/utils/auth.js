export const clearAuthData = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("pendingVerification");
    localStorage.removeItem("viewMode");  
  };
  
  export const setAuthData = (userData) => {
    clearAuthData(); 
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userName", userData.name);
    localStorage.setItem("userEmail", userData.email);
    if (userData.role === "admin") {
      localStorage.setItem("viewMode", "admin");
    }
  };