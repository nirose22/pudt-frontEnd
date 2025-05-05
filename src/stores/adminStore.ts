// stores/adminStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';  // 假設使用 axios 進行 API 請求

// 管理員用戶接口
interface Admin {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'super_admin';
  email: string;
  lastLogin: Date;
}

// 登入表單類型
interface AdminLoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 登入響應類型
interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: Admin;
}

export const useAdminStore = defineStore('admin', () => {
  // 管理員基本資料
  const adminId = ref<number | null>(null);
  const adminInfo = ref<Admin | null>(null);
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);

  // 計算屬性：檢查管理員是否已登入
  const isLoggedIn = computed(() => isAuthenticated.value && !!token.value);

  // 檢查是否為超級管理員
  const isSuperAdmin = computed(() => adminInfo.value?.role === 'super_admin');

  // 登入方法
  const adminLogin = async (credentials: AdminLoginCredentials): Promise<AdminLoginResponse> => {
    try {
      // 實際應用中，這裡應該是 API 請求
      // const response = await axios.post('/api/admin/login', credentials);
      // const { success, message, token, admin } = response.data;

      // 模擬成功登入
      const success = true;
      const message = '管理員登入成功';
      const mockToken = 'admin_mock_jwt_token';
      const mockAdmin: Admin = {
        id: 1,
        username: credentials.username,
        name: '系統管理員',
        role: 'admin',
        email: 'admin@example.com',
        lastLogin: new Date()
      };

      if (success) {
        // 存儲登入信息
        adminId.value = mockAdmin.id;
        adminInfo.value = mockAdmin;
        isAuthenticated.value = true;
        token.value = mockToken;

        // 保存 token 到 localStorage（如果啟用記住我）
        if (credentials.rememberMe) {
          localStorage.setItem('admin_token', mockToken);
          localStorage.setItem('admin_id', String(mockAdmin.id));
        } else {
          // 使用 sessionStorage 僅在當前會話有效
          sessionStorage.setItem('admin_token', mockToken);
          sessionStorage.setItem('admin_id', String(mockAdmin.id));
        }
      }

      return { success, message, token: mockToken, admin: mockAdmin };
    } catch (error) {
      console.error('管理員登入失敗:', error);
      return { success: false, message: '登入失敗，請檢查您的帳號密碼' };
    }
  };

  // 登出方法
  const logout = () => {
    // 清除 store 中的數據
    adminId.value = null;
    adminInfo.value = null;
    isAuthenticated.value = false;
    token.value = null;

    // 清除 localStorage/sessionStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_id');

    return { success: true };
  };

  // 檢查並恢復登入狀態（從 localStorage 或 sessionStorage）
  const checkAuth = async () => {
    // 嘗試從 localStorage 或 sessionStorage 獲取 token
    const savedToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    const savedId = localStorage.getItem('admin_id') || sessionStorage.getItem('admin_id');

    if (savedToken && savedId) {
      // 實際應用中，應該驗證 token 是否有效
      // const response = await axios.post('/api/admin/verify-token', { token: savedToken });
      // const { valid } = response.data;

      // 模擬 token 驗證
      const valid = true;

      if (valid) {
        // 如果 token 有效，載入管理員資料
        const id = parseInt(savedId);
        token.value = savedToken;
        adminId.value = id;
        isAuthenticated.value = true;

        // 獲取管理員資料
        // await fetchAdminInfo(id);
        return { success: true };
      }
    }

    return { success: false };
  };

  // 獲取管理員資料
  const fetchAdminInfo = async (id: number) => {
    try {
      // 實際應用中，這裡應該是 API 請求
      // const response = await axios.get(`/api/admin/${id}`);
      // adminInfo.value = response.data;

      // 模擬數據
      adminInfo.value = {
        id,
        username: 'admin',
        name: '系統管理員',
        role: 'admin',
        email: 'admin@example.com',
        lastLogin: new Date()
      };

      return { success: true };
    } catch (error) {
      console.error('獲取管理員資料失敗:', error);
      return { success: false, error };
    }
  };

  return {
    adminId,
    adminInfo,
    isAuthenticated,
    token,
    isLoggedIn,
    isSuperAdmin,
    adminLogin,
    logout,
    checkAuth,
    fetchAdminInfo
  };
}); 