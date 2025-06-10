import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { User, Course, UserProfile } from '@/types'
import { ActivityLevel } from '@/types/activity'
import { UserRole, MainCategory, RegionCode } from '@/enums'
import { calculateUserLevel, calculateNextLevelProgress } from '@/utils/userLevelUtils'
import { userService } from '@/services/UserService'

interface State {
  user: User
  profile: UserProfile
  favs: Course[]
  completedCoursesCount: number
  error: string | null
  isLoading: boolean
  lastProfileUpdate: Date | null
}

/**
 * User Store - 結合版本
 * 保留原有功能，整合新的用戶行為分析和 AI 推薦功能
 */
export const useUserStore = defineStore('user', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    user: {} as User,
    profile: {} as UserProfile,
    favs: [],
    completedCoursesCount: 50,
    error: null,
    isLoading: false,
    lastProfileUpdate: null,
  })

  /* ---------- getters (保留原有) ---------- */
  const displayName = computed(() => state.profile?.name ?? UserRole.Guest)
  const userId = computed(() => state.profile?.userId ?? 0)
  const favoriteCourses = computed(() => state.favs)
  const userInterests = computed(() => state.profile?.interests ?? [])
  const userLevel = computed(() => calculateUserLevel(state.completedCoursesCount))
  const levelProgress = computed(() => calculateNextLevelProgress(state.completedCoursesCount))
  const isFavorite = (id: number) => state.favs.some(c => c.id === id)

  /* ---------- 新增的 getters ---------- */
  const userName = computed(() => state.profile?.name || '訪客')
  const userRegion = computed(() => state.profile?.preferredRegions)
  const userAvatar = computed(() => state.user?.avatarUrl)

  // 用戶等級計算（基於積分的新版本）
  const enhancedUserLevel = computed(() => {
    const points = state.user?.points ?? 0
    if (points >= 10000) return { level: 'VIP', name: '終身學習者', color: '#FFD700' }
    if (points >= 5000) return { level: 'Advanced', name: '進階探索者', color: '#9333EA' }
    if (points >= 1000) return { level: 'Intermediate', name: '學習達人', color: '#3B82F6' }
    return { level: 'Beginner', name: '新手探索者', color: '#10B981' }
  })

  // 活躍度等級
  const activityKind = computed((): ActivityLevel => {
    const level = state.profile?.activityLevel
    return typeof level === 'number' ? ActivityLevel.MEDIUM : (level ?? ActivityLevel.MEDIUM)
  })

  // 是否需要更新用戶檔案（超過24小時）
  const needsProfileUpdate = computed(() => {
    if (!state.lastProfileUpdate) return true
    const now = new Date()
    const diff = now.getTime() - state.lastProfileUpdate.getTime()
    return diff > 24 * 60 * 60 * 1000 // 24小時
  })

  // 獲取用戶主要興趣（前3個）
  const getPrimaryInterests = computed(() => {
    return state.profile?.interests.slice(0, 3)
  })

  /* ---------- actions (保留並增強原有) ---------- */
  async function fetchProfile(id?: number) {
    if (state.isLoading) return
    state.isLoading = true
    try {
      const userData = await userService.fetchProfile(id)
      if (userData.success && userData.data) {
        state.user = userData.data
        state.lastProfileUpdate = new Date()
      }

    } catch (error) {
      console.error('❌ 載入用戶檔案失敗:', error)
    } finally {
      state.isLoading = false
    }
  }

  async function fetchFavoriteCourses() {
    if (!userId.value) return
    const list = await userService.fetchFavoriteCourses(userId.value)
    if (list.success && list.data) state.favs = list.data
  }

  async function addFavorite(course: Course) {
    if (!userId.value) return
    if (isFavorite(course.id)) return

    const ok = await userService.addFavorite(userId.value, course.id)
    if (ok.success) {
      state.favs.push({ ...course })
    }
  }

  async function removeFavorite(id: number) {
    if (!userId.value) return

    const ok = await userService.removeFavorite(userId.value, id)
    if (ok.success) {
      state.favs = state.favs.filter(c => c.id !== id)
    }
    return ok;
  }

  function adjustPoints(amount: number) {
    if (!state.profile) return { success: false, message: '用户未登录' }

    const oldPoints = state.user?.points ?? 0
    state.user.points += amount

    if (state.profile) {
      state.user.points = state.user.points
    }

    // 積分變化提示
    const diff = state.user.points - oldPoints
    if (diff > 0) {
      // 可以在這裡觸發 toast 通知
      console.log(`獲得 ${diff} 積分！`)
    }

    // saveProfileToLocal()
    return { success: true, data: state.user.points }
  }

  async function updateProfile(data: Partial<User>) {
    if (!userId.value) return { success: false, message: '用戶未登入' }

    const updated = await userService.updateProfile(userId.value, data)
    if (updated.success && updated.data) {
      state.profile = { ...state.profile!, ...updated.data }
      // saveProfileToLocal()
    }
    return updated
  }

  function updateUserInterests(newInterests: MainCategory[]) {
    state.profile!.interests = newInterests
    // saveInterestsToLocal(newInterests)
  }

  function increaseCompletedCourses(count = 1) {
    state.completedCoursesCount += count
  }

  function setCompletedCoursesCount(count: number) {
    state.completedCoursesCount = count
  }


  /**
   * 載入用戶行為檔案
   */
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

  /**
   * 更新新格式興趣
   */
  async function updateNewFormatInterests(newInterests: MainCategory[]) {
    if (!userId.value) return false

    try {
      state.isLoading = true
      await userService.updateUserInterests(userId.value, newInterests)
      return true
    } catch (error) {
      console.error('更新興趣失敗:', error)
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * 更新用戶地址
   */
  async function updateAddress(newAddress: string) {
    if (!userId.value) return false

    try {
      const result = await userService.updateAddress(userId.value, newAddress)
      if (result.success && state.profile) {
        state.user.address = newAddress
        // saveProfileToLocal()
      }
      return result.success
    } catch (error) {
      console.error('更新地址失敗:', error)
      return false
    }
  }

  /**
   * 刷新用戶檔案（強制更新）
   */
  async function refreshProfile() {
    if (!userId.value) return

    try {
      state.lastProfileUpdate = null // 強制更新
      await fetchProfile(userId.value)
    } catch (error) {
      console.error('刷新用戶檔案失敗:', error)
    }
  }

  /**
   * 用戶登出
   */
  async function logout() {
    try {
      if (userId.value) {
        // 記錄登出活動
        // 調用登出 API
        await userService.logout()
      }
    } catch (error) {
      console.warn('登出 API 調用失敗:', error)
    } finally {
      // 清除狀態
      clearUserData()
    }
  }

  /**
   * 清除用戶資料
   */
  function clearUserData() {
    Object.assign(state, {
      user: {} as User,
      profile: {} as UserProfile,
      favs: [],
      completedCoursesCount: 0,
      error: null,
      isLoading: false,
      lastProfileUpdate: null,
    })

    // 清除本地存儲
  }

  /**
   * 檢查並更新過期檔案
   */
  async function checkAndUpdateProfile() {
    if (userId.value > 0 && needsProfileUpdate.value) {
      console.log('🔄 檢測到用戶檔案需要更新，自動刷新中...')
      await refreshProfile()
    }
  }

  /**
   * 初始化 store（應用啟動時調用）
   */
  async function initialize() {
    // 載入本地備份
    // loadLocalBackup()

    // 如果有用戶 ID，檢查是否需要更新
    if (userId.value) {
      await checkAndUpdateProfile()
    }
  }

  /* ---------- 工具方法 ---------- */

  /**
   * 檢查用戶是否有特定興趣
   */
  function hasInterest(category: MainCategory): boolean {
    return state.profile.interests.includes(category)
  }

  /**
   * 檢查用戶是否在特定地區
   */
  function isInRegion(region: RegionCode): boolean {
    return state.profile.preferredRegions.includes(region)
  }

  /* ---------- expose (保留原有 + 新增) ---------- */
  return {
    // 原有狀態
    ...toRefs(state),

    // 原有計算屬性
    displayName,
    userId,
    favoriteCourses,
    userInterests,
    userLevel,
    levelProgress,
    isFavorite,

    // 新增計算屬性
    userName,
    userRegion,
    userAvatar,
    enhancedUserLevel,
    activityKind,
    needsProfileUpdate,
    getPrimaryInterests,

    // 原有方法
    fetchProfile,
    fetchBehaviorProfile,
    fetchFavoriteCourses,
    addFavorite,
    removeFavorite,
    adjustPoints,
    increaseCompletedCourses,
    setCompletedCoursesCount,
    updateProfile,
    updateUserInterests,

    // 新增方法
    updateNewFormatInterests,
    updateAddress,
    refreshProfile,
    logout,
    clearUserData,
    initialize,
    checkAndUpdateProfile,
    // saveProfileToLocal,

    // 工具方法
    hasInterest,
    isInRegion
  }
}, {
  persist: {
    key: 'user',
    storage: sessionStorage,
    pick: ['user', 'profile', 'favs', 'completedCoursesCount']
  }
})