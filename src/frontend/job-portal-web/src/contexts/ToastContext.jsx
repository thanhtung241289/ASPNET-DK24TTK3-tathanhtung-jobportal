// File: src/contexts/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Tự động xóa toast sau 4 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose showToast globally for non-React contexts (like axiosClient.js)
  useEffect(() => {
    window.showToast = showToast;
    return () => {
      delete window.showToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-5 py-4 rounded-2xl shadow-xl backdrop-blur-md border transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in ${
              toast.type === "success"
                ? "bg-emerald-500/95 border-emerald-400/30 text-white"
                : toast.type === "warning"
                ? "bg-amber-500/95 border-amber-400/30 text-white"
                : toast.type === "info"
                ? "bg-blue-500/95 border-blue-400/30 text-white"
                : "bg-rose-500/95 border-rose-400/30 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">
                {toast.type === "success" && "✓"}
                {toast.type === "warning" && "⚠️"}
                {toast.type === "info" && "ℹ️"}
                {(toast.type === "danger" || toast.type === "error") && "✕"}
              </span>
              <p className="text-xs font-semibold leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white active:scale-95 transition-all text-[10px] font-bold bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer ml-3 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được sử dụng bên trong một ToastProvider");
  }
  return context;
};
