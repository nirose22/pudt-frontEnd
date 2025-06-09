import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type { User, Course, Result, UserProfile } from '@/types'
import { ActivityLevel } from '@/types/activity'
import { UserRole, MainCategory, RegionCode } from '@/enums'
import { calculateUserLevel, calculateNextLevelProgress } from '@/utils/userLevelUtils'
import { userService } from '@/services/UserService'
import { errorHandler } from '@/utils/errorHandler'
import { ERROR_MESSAGES } from '@/utils/apiConfig'

interface State {
  profile: User | null
  points: number
  favs: Course[]
  interests: string[]
  completedCoursesCount: number
  error: string | null
  isLoading: boolean
  lastProfileUpdate: Date | null
  behaviorProfile: UserProfile | null
  newInterests: MainCategory[]
}

/**
 * User Store - 結合版本
 * 保留原有功能，整合新的用戶行為分析和 AI 推薦功能
 */
export const useUserStore = defineStore('user', () => {
  /* ---------- state ---------- */
  const state = reactive<State>({
    profile: null,
    points: 0,
    favs: [],
    interests: [],
    completedCoursesCount: 50,
    error: null,
    isLoading: false,
    lastProfileUpdate: null,
    behaviorProfile: null,
    newInterests: []
  })

  /* ---------- getters (保留原有) ---------- */
  const isLoggedIn = computed(() => !!state.profile)
  const displayName = computed(() => state.profile?.name ?? UserRole.Guest)
  const userId = computed(() => state.profile?.id ?? 0)
  const favoriteCourses = computed(() => state.favs)
  const userInterests = computed(() => state.interests)
  const userLevel = computed(() => calculateUserLevel(state.completedCoursesCount))
  const levelProgress = computed(() => calculateNextLevelProgress(state.completedCoursesCount))
  const isFavorite = (id: number) => state.favs.some(c => c.id === id)

  /* ---------- 新增的 getters ---------- */
  const userName = computed(() => state.profile?.name || '訪客')
  const userEmail = computed(() => state.profile?.email || '')
  const userRegion = computed(() => state.profile?.regionCode)
  const userAvatar = computed(() => state.profile?.avatarUrl)
  
  // 用戶等級計算（基於積分的新版本）
  const enhancedUserLevel = computed(() => {
    const points = state.points
    if (points >= 10000) return { level: 'VIP', name: '終身學習者', color: '#FFD700' }
    if (points >= 5000) return { level: 'Advanced', name: '進階探索者', color: '#9333EA' }
    if (points >= 1000) return { level: 'Intermediate', name: '學習達人', color: '#3B82F6' }
    return { level: 'Beginner', name: '新手探索者', color: '#10B981' }
  })

  // 活躍度等級
  const activityKind = computed((): ActivityLevel => {
    const level = state.behaviorProfile?.activityLevel
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
    return state.newInterests.slice(0, 3)
  })

  /* ---------- utilities (保留原有) ---------- */
  async function withLoading<T>(fn: () => Promise<Result<T>>): Promise<T | undefined> {
    try {
      const res = await fn()
      if (!res.success) throw new Error(res.message || '操作失敗')
      return res.data
    } catch (e) {
      state.error = e instanceof Error ? e.message : ERROR_MESSAGES.USER_ERROR ?? '操作失敗'
      errorHandler.handleBusinessError(e, state.error)
      return undefined
    }
  }

  /* ---------- 本地存儲管理 ---------- */
  function loadInterestsFromLocal() {
    const cached = localStorage.getItem('userInterests')
    if (cached) {
      try {
        const interests = JSON.parse(cached)
        if (Array.isArray(interests)) {
          state.interests = interests
        }
      } catch (error) {
        console.warn('載入本地興趣備份失敗:', error)
      }
    }
  }

  function saveInterestsToLocal(interests: string[] | MainCategory[]) {
    try {
      localStorage.setItem('userInterests', JSON.stringify(interests))
    } catch (error) {
      console.warn('保存興趣到本地失敗:', error)
    }
  }

  function saveProfileToLocal() {
    try {
      const backup = {
        profile: state.profile,
        points: state.points,
        interests: state.interests,
        newInterests: state.newInterests,
        lastUpdate: new Date().toISOString()
      }
      localStorage.setItem('userProfile', JSON.stringify(backup))
    } catch (error) {
      console.warn('保存用戶檔案到本地失敗:', error)
    }
  }

  function loadLocalBackup() {
    const cached = localStorage.getItem('userProfile')
    if (cached) {
      try {
        const backup = JSON.parse(cached)
        if (backup.profile) {
          state.profile = backup.profile
          state.points = backup.points ?? 0
          state.newInterests = backup.newInterests || []
        }
      } catch (error) {
        console.warn('載入本地備份失敗:', error)
      }
    }
    loadInterestsFromLocal()
  }

  /* ---------- actions (保留並增強原有) ---------- */
  async function fetchProfile(id?: number) {
    if (state.isLoading) return
    console.log('fetchProfile', id);
    state.isLoading = true
    
    try {
      const data = await withLoading(() => userService.fetchProfile(id))
      if (data) {
        state.profile = data
        state.points = data.points ?? 0
        state.lastProfileUpdate = new Date()
      }

      loadInterestsFromLocal()

      if (data?.id) {
        await Promise.allSettled([
          loadUserBehaviorProfile(data.id),
          loadNewFormatInterests(data.id),
        ])
      }
      
    } catch (error) {
      console.error('❌ 載入用戶檔案失敗:', error)
      loadLocalBackup()
    } finally {
      state.isLoading = false
    }
  }

  async function fetchFavoriteCourses() {
    if (!userId.value) return
    const list = await withLoading(() => userService.fetchFavoriteCourses(userId.value!))
    if (list) state.favs = list
  }

  async function addFavorite(course: Course) {
    if (!userId.value) return
    if (isFavorite(course.id)) return
    
    const ok = await withLoading(() => userService.addFavorite(userId.value!, course.id))
    if (ok !== undefined) {
      state.favs.push({ ...course })
    }
  }

  async function removeFavorite(id: number) {
    if (!userId.value) return
    
    const ok = await withLoading(() => userService.removeFavorite(userId.value!, id))
    if (ok !== undefined) {
      state.favs = state.favs.filter(c => c.id !== id)
    }
  }

  function adjustPoints(amount: number) {
    if (!state.profile) return { success: false, message: '用户未登录' }
    
    const oldPoints = state.points
    state.points += amount
    
    if (state.profile) {
      state.profile.points = state.points
    }
    
    // 積分變化提示
    const diff = state.points - oldPoints
    if (diff > 0) {
      // 可以在這裡觸發 toast 通知
      console.log(`獲得 ${diff} 積分！`)
    }
    
    saveProfileToLocal()
    return { success: true, data: state.points }
  }

  async function updateProfile(data: Partial<User>) {
    if (!userId.value) return
    
    const updated = await withLoading(() => userService.updateProfile(userId.value!, data))
    if (updated) {
      state.profile = { ...state.profile!, ...updated }
      saveProfileToLocal()
    }
  }

  function updateUserInterests(newInterests: string[]) {
    state.interests = newInterests
    saveInterestsToLocal(newInterests)
  }

  function increaseCompletedCourses(count = 1) {
    state.completedCoursesCount += count
  }

  function setCompletedCoursesCount(count: number) {
    state.completedCoursesCount = count
  }

  /* ---------- 新增的方法 ---------- */
  
  /**
   * 載入用戶行為檔案
   */
  async function loadUserBehaviorProfile(userId: number) {
    try {
      const behaviorProfile = await userService.fetchBehaviorProfile(userId)
      if (behaviorProfile?.success && behaviorProfile.data) {
        state.behaviorProfile = behaviorProfile.data
      }
    } catch (error) {
      console.warn('載入行為檔案失敗:', error)
    }
  }

  /**
   * 載入新格式的興趣
   */
  async function loadNewFormatInterests(userId: number) {
    try {
      const interests = await userService.fetchUserInterests(userId)
      if (interests?.success && interests.data) {
        state.newInterests = interests.data
        saveInterestsToLocal(interests.data)
      }
    } catch (error) {
      console.warn('載入新格式興趣失敗:', error)
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
      
      state.newInterests = newInterests
      saveInterestsToLocal(newInterests)
      saveProfileToLocal()
      
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
        state.profile.address = newAddress
        saveProfileToLocal()
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
        await userService.logout(userId.value)
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
      profile: null,
      points: 0,
      favs: [],
      interests: [],
      completedCoursesCount: 50,
      error: null,
      isLoading: false,
      lastProfileUpdate: null,
      behaviorProfile: null,
      newInterests: []
    })
    
    // 清除本地存儲
    localStorage.removeItem('userProfile')
    localStorage.removeItem('userInterests')
    localStorage.removeItem('authToken')
  }

  /**
   * 檢查並更新過期檔案
   */
  async function checkAndUpdateProfile() {
    if (isLoggedIn.value && needsProfileUpdate.value) {
      console.log('🔄 檢測到用戶檔案需要更新，自動刷新中...')
      await refreshProfile()
    }
  }

  /**
   * 初始化 store（應用啟動時調用）
   */
  async function initialize() {
    // 載入本地備份
    loadLocalBackup()
    
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
    return state.newInterests.includes(category)
  }

  /**
   * 檢查用戶是否在特定地區
   */
  function isInRegion(region: RegionCode): boolean {
    return state.profile?.regionCode === region
  }

  /* ---------- expose (保留原有 + 新增) ---------- */
  return {
    // 原有狀態
    ...toRefs(state),
    
    // 原有計算屬性
    isLoggedIn,
    displayName,
    userId,
    favoriteCourses,
    userInterests,
    userLevel,
    levelProgress,
    isFavorite,
    
    // 新增計算屬性
    userName,
    userEmail,
    userRegion,
    userAvatar,
    enhancedUserLevel,
    activityKind,
    needsProfileUpdate,
    getPrimaryInterests,
    
    // 原有方法
    fetchProfile,
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
    saveProfileToLocal,
    
    // 工具方法
    hasInterest,
    isInRegion
  }
}, {
  persist: {
    key: 'user',
    storage: sessionStorage,
    pick: ['profile', 'points', 'favs', 'interests', 'newInterests', 'completedCoursesCount']
  }
})