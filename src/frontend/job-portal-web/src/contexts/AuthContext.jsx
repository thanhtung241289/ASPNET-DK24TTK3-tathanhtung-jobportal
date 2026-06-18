// File: src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm đồng bộ trạng thái user dựa trên token trong localStorage
  const syncAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Kiểm tra xem token đã hết hạn chưa (exp tính bằng giây)
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({
            id: decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ],
            email:
              decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
              ],
            role: decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ],
          });
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncAuth();
  }, []);

  // Hàm xử lý khi đăng nhập thành công
  const login = (token, role) => {
    localStorage.setItem("token", token);
    if (role) {
      localStorage.setItem("userRole", role);
    }
    syncAuth();
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng Auth context nhanh hơn ở các component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong một AuthProvider");
  }
  return context;
};
