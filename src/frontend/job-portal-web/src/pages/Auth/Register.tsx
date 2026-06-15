// File: src/pages/Auth/Register.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ tên'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: yup.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
  role: yup.number().required('Vui lòng chọn vai trò'),
}).required();

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 2 } // Mặc định là Ứng viên (Seeker)
  });

  const onSubmit = async (data: any) => {
    try {
      await authApi.register(data);
      alert('Đăng ký tài khoản thành công!');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Đăng Ký Tài Khoản</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
            <input type="text" {...register('fullName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            <p className="text-red-500 text-xs mt-1">{errors.fullName?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input type="password" {...register('password')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bạn là:</label>
            <select {...register('role')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
              <option value={2}>Ứng viên tìm việc</option>
              <option value={3}>Nhà tuyển dụng</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400">
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
          </button>
        </form>
      </div>
    </div>
  );
}