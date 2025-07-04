import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { User, Course,  UserBehaviorProfile } from '@/types'
import { ActivityLevel } from '@/types/activity'
import { UserRole, MainCategory, RegionCode } from '@/enums'
import { userService } from '@/services/UserService'

interface State {
  user: User
  profile: UserBehaviorProfile
  favs: Course[]
  error: string | null
  isLoading: boolean
  lastProfileUpdate: Date | null
}

export const useUserStore = defineStore('user', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    user: {} as User,
    profile: {} as UserBehaviorProfile,
    favs: [],
    error: null,
    isLoading: false,
    lastProfileUpdate: null,
  })

  /* ---------- getters ---------- */
  const userName = computed(() => state.profile?.name)
  const userId = computed(() => state.user?.id ?? 0)
  const userInterests = computed(() => state.profile?.interests ?? [])
  const userAvatar = computed(() => state.user?.avatarUrl)
  const userRegion = computed(() => state.profile?.preferredRegions)

  // 統一的用戶等級計算（基於積分）
  const userLevel = computed(() => {
    const points = state.user?.points ?? 0
    if (points >= 10000) return { level: 'VIP', name: '終身學習者', color: '#FFD700', points }
    if (points >= 5000) return { level: 'Advanced', name: '進階探索者', color: '#9333EA', points }
    if (points >= 1000) return { level: 'Intermediate', name: '學習達人', color: '#3B82F6', points }
    return { level: 'Beginner', name: '新手探索者', color: '#10B981', points }
  })

  const activityLevel = computed((): ActivityLevel => {
    const level = state.profile?.activityLevel
    return typeof level === 'number' ? ActivityLevel.MEDIUM : (level ?? ActivityLevel.MEDIUM)
  })

  const needsProfileUpdate = computed(() => {
    if (!state.lastProfileUpdate) return true
    const now = new Date()
    const diff = now.getTime() - state.lastProfileUpdate.getTime()
    return diff > 24 * 60 * 60 * 1000 // 24小時
  })

  const primaryInterests = computed(() => state.profile?.interests.slice(0, 3))


  /* ---------- actions ---------- */

  async function fetchUserProfile(id: number) {
    if (state.isLoading) return
    state.isLoading = true
    try {
      const userData = await userService.fetchUserProfile(id)
      if (userData.success && userData.data) {
        state.user = userData.data
        state.lastProfileUpdate = new Date()
      }
    } catch (error) {
      console.error('❌ 載入用戶檔案失敗:', error)
      state.error = error instanceof Error ? error.message : '載入失敗'
    } finally {
      state.isLoading = false
    }
  }

  async function fetchBehaviorProfile(userId: number) {
    try {
      const behaviorProfile = await userService.fetchBehaviorProfile(userId)
      if (behaviorProfile?.success && behaviorProfile.data) {
        state.profile = behaviorProfile.data
      }
    } catch (error) {
      console.warn('載入行為檔案失敗:', error)
    }
  }

  function adjustPoints(amount: number) {
    if (!state.user) return { success: false, message: '用戶未登入' }

    const oldPoints = state.user.points ?? 0
    state.user.points = oldPoints + amount

    if (amount > 0) {
      console.log(`獲得 ${amount} 積分！`)
    }

    return { success: true, data: state.user.points }
  }

  // 統一的興趣更新方法
  async function updateInterests(newInterests: MainCategory[]) {
    if (!userId.value) return { success: false, message: '用戶未登入' }

    try {
      state.isLoading = true
      // 使用正確的API方法，發送對象格式
      const interestsRequest = { categories: newInterests }
      
      console.log('🔍 [userStore] 準備發送到 API:');
      console.log('📊 用戶ID:', userId.value);
      console.log('📊 請求資料:', interestsRequest);
      console.log('📊 API 端點:', `PUT /users/${userId.value}/interests`);
      
      const result = await userService.updateUserInterestsAndRegions(userId.value, interestsRequest)
      
      console.log('📨 [userStore] API 回應:');
      console.log('📊 成功狀態:', result.success);
      console.log('📊 回應訊息:', result.message);
      console.log('📊 完整回應:', result);
      
      if (result.success) {
        console.log('✅ [userStore] 更新本地狀態');
        state.profile.interests = newInterests
      } else {
        console.error('❌ [userStore] API 回應失敗:', result.message);
      }
      return result
    } catch (error) {
      console.error('❌ [userStore] 更新興趣失敗:', error)
      return { success: false, message: '更新失敗' }
    } finally {
      state.isLoading = false
    }
  }

  // 統一的地區偏好更新方法
  async function updatePreferredRegions(newRegions: RegionCode[]) {
    if (!userId.value) return { success: false, message: '用戶未登入' }

    try {
      state.isLoading = true
      
      console.log('🗺️ [userStore] 準備更新地區偏好:');
      console.log('📊 用戶ID:', userId.value);
      console.log('📊 新地區資料:', newRegions);
      console.log('📊 是否為清空操作:', newRegions.length === 0);
      console.log('📊 API 端點:', `PUT /users/${userId.value}/regions`);
      console.log('📊 請求資料:', { preferredRegions: newRegions });
      
      const result = await userService.updateUserRegions(userId.value, newRegions)
      
      console.log('📨 [userStore] API 回應:');
      console.log('📊 成功狀態:', result.success);
      console.log('📊 回應訊息:', result.message);
      console.log('📊 完整回應:', result);
      
      if (result.success) {
        console.log('✅ [userStore] 更新本地狀態 - 舊資料:', state.profile.preferredRegions);
        state.profile.preferredRegions = newRegions
        console.log('✅ [userStore] 更新本地狀態 - 新資料:', state.profile.preferredRegions);
      } else {
        console.error('❌ [userStore] API 回應失敗:', result.message);
      }
      return result
    } catch (error) {
      console.error('❌ [userStore] 更新地區偏好失敗:', error)
      return { success: false, message: '更新失敗' }
    } finally {
      state.isLoading = false
    }
  }

  async function refreshProfile(id?: number) {
    const userUid = id ?? userId.value
    if (!userUid) return
    state.lastProfileUpdate = null
    await fetchUserProfile(userUid)
    await fetchBehaviorProfile(userUid)
  }

  function clearUserData() {
    state.user = {} as User;
    state.profile = {} as UserBehaviorProfile;
    state.favs = [];
    state.error = null;
    state.isLoading = false;
    state.lastProfileUpdate = null;
		localStorage.clear();
    console.log('✅ 已清除用戶數據和 sessionStorage')
  }

  async function initialize() {
    if (userId.value && needsProfileUpdate.value) {
      console.log('🔄 檢測到用戶檔案需要更新，自動刷新中...')
      await refreshProfile()
    }
  }

  // 工具方法
  const hasInterest = (category: MainCategory): boolean => 
    state.profile.interests?.includes(category) ?? false

  const isInRegion = (region: RegionCode): boolean => 
    state.profile.preferredRegions?.includes(region) ?? false

  /* ---------- expose ---------- */
  return {
    // 狀態
    ...toRefs(state),

    // 計算屬性
    userName,
    userId,
    userInterests,
    userLevel,
    userAvatar,
    userRegion,
    activityLevel,
    needsProfileUpdate,
    primaryInterests,

    // 方法
    fetchUserProfile,
    fetchBehaviorProfile,
    adjustPoints,
    updateInterests,
    updatePreferredRegions,
    refreshProfile,
    clearUserData,
    initialize,
    hasInterest,
    isInRegion
  }
}, {
  persist: {
    key: 'user',
    storage: sessionStorage,
    pick: ['profile', 'user']
  }
})