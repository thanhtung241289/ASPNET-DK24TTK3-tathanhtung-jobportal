// File: src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";

// Định nghĩa cấu trúc các tuyến đường (Routes)
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // MainLayout bao bọc toàn bộ hệ thống
    children: [
      {
        index: true, // index: true nghĩa là khi vào url '/' thì render element này
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "jobs", // Thay thế dòng component mockup cũ bằng component thật dưới đây:
        element: <JobsPage />,
      },
      { path: "jobs/:id", element: <JobDetailPage /> },
    ],
  },
  // Nếu sau này bạn có Layout dành riêng cho Admin (không có Footer chẳng hạn),
  // bạn sẽ định nghĩa một Object mới ở đây, ngang hàng với Object path: '/'
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
