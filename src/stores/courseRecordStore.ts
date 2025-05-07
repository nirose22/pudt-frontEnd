import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from '@/utils/api'  // 實際環境使用 API 呼叫

/**
 * 課程參與記錄項目
 */
export interface CourseHistoryItem {
  id: number
  date: string | Date
  courseId: number
  courseTitle: string
  merchantId: number
  merchantName: string
  location: string
  instructor?: {
    id: number
    name: string
    avatar?: string
  }
  duration: number      // 課程時長（分鐘）
  status: 'completed' | 'cancelled' | 'noshow' | 'leave'
  points: number         // 使用的點數
  rating?: number        // 評分 (1-5)
  feedback?: string      // 課後評價
  images?: string[]      // 課程照片
}

/**
 * 課程統計
 */
export interface CourseStats {
  totalCourses: number
  totalDuration: number  // 總時長（分鐘）
  totalPoints: number
  completedCourses: number
  cancelledCourses: number
  noshowCourses: number
  leaveOfAbsence: number
}

/**
 * 課程參與紀錄 Store - 管理會員課程參與歷史和統計數據
 */
export const useCourseRecordStore = defineStore('courseRecord', () => {
  /* ---------- state ---------- */
  /** 課程參與歷史 */
  const courseHistory = ref<CourseHistoryItem[]>([])
  
  /** 載入狀態 */
  const loading = ref(false)

  /* ---------- getters ---------- */
  /** 課程參與統計 */
  const stats = computed((): CourseStats => {
    const completed = courseHistory.value.filter(c => c.status === 'completed')
    const cancelled = courseHistory.value.filter(c => c.status === 'cancelled')
    const noshow = courseHistory.value.filter(c => c.status === 'noshow')
    const leave = courseHistory.value.filter(c => c.status === 'leave')
    
    return {
      totalCourses: courseHistory.value.length,
      totalDuration: completed.reduce((sum, c) => sum + c.duration, 0),
      totalPoints: courseHistory.value.reduce((sum, c) => sum + c.points, 0),
      completedCourses: completed.length,
      cancelledCourses: cancelled.length,
      noshowCourses: noshow.length,
      leaveOfAbsence: leave.length
    }
  })
  
  /** 每月課程統計 */
  const monthlyStats = computed(() => {
    const months: Record<string, number> = {}
    
    courseHistory.value.forEach(course => {
      const date = new Date(course.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = 0
      }
      
      if (course.status === 'completed') {
        months[monthKey]++
      }
    })
    
    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  })
  
  /** 商家課程統計 */
  const merchantStats = computed(() => {
    const merchants: Record<number, { name: string, count: number }> = {}
    
    courseHistory.value.forEach(course => {
      if (!merchants[course.merchantId]) {
        merchants[course.merchantId] = { 
          name: course.merchantName, 
          count: 0 
        }
      }
      
      if (course.status === 'completed') {
        merchants[course.merchantId].count++
      }
    })
    
    return Object.values(merchants)
      .sort((a, b) => b.count - a.count)
  })

  /* ---------- actions ---------- */
  /**
   * 獲取課程參與歷史
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   * @param params 查詢參數 (分頁、過濾等)
   */
  async function fetchCourseHistory(userId?: number, params?: { status?: string, from?: string, to?: string }) {
    loading.value = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get(`/users/${userId || 'me'}/course-history`, { params })
      
      // 模擬數據
      const data: CourseHistoryItem[] = [
        {
          id: 1,
          date: '2025-05-01',
          courseId: 101,
          courseTitle: '初級瑜伽課程',
          merchantId: 1,
          merchantName: '和平瑜伽中心',
          location: '和平瑜伽中心 - 信義店',
          instructor: {
            id: 5,
            name: '李老師',
            avatar: 'https://via.placeholder.com/50'
          },
          duration: 60,
          status: 'completed',
          points: 1,
          rating: 5,
          feedback: '非常棒的課程，老師很有耐心'
        },
        {
          id: 2,
          date: '2025-04-25',
          courseId: 102,
          courseTitle: '冥想與放鬆',
          merchantId: 1,
          merchantName: '和平瑜伽中心',
          location: '和平瑜伽中心 - 中山店',
          instructor: {
            id: 6,
            name: '張老師',
            avatar: 'https://via.placeholder.com/50'
          },
          duration: 90,
          status: 'completed',
          points: 2,
          rating: 4
        },
        {
          id: 3,
          date: '2025-04-18',
          courseId: 103,
          courseTitle: '高級瑜伽課程',
          merchantId: 2,
          merchantName: '平衡身心工作室',
          location: '平衡身心工作室 - 主店',
          instructor: {
            id: 10,
            name: '王老師',
            avatar: 'https://via.placeholder.com/50'
          },
          duration: 120,
          status: 'noshow',
          points: 3
        },
        {
          id: 4,
          date: '2025-04-10',
          courseId: 104,
          courseTitle: '瑜伽基礎課程',
          merchantId: 1,
          merchantName: '和平瑜伽中心',
          location: '和平瑜伽中心 - 中山店',
          instructor: {
            id: 7,
            name: '趙老師',
            avatar: 'https://via.placeholder.com/50'
          },
          duration: 60,
          status: 'leave',
          points: 1
        }
      ]
      
      courseHistory.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取課程歷史記錄失敗:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 添加課程評價
   * @param courseId 課程參與記錄ID
   * @param rating 評分 (1-5)
   * @param feedback 評語
   * @param images 照片 URL 列表
   */
  async function addFeedback(courseId: number, rating: number, feedback?: string, images?: string[]) {
    try {
      // 實際環境使用 API
      // await api.post(`/course-history/${courseId}/feedback`, { rating, feedback, images })
      
      // 更新本地數據
      const courseIndex = courseHistory.value.findIndex(c => c.id === courseId)
      if (courseIndex >= 0) {
        courseHistory.value[courseIndex] = {
          ...courseHistory.value[courseIndex],
          rating,
          feedback,
          images: images || courseHistory.value[courseIndex].images
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('添加課程評價失敗:', error)
      return { success: false, error }
    }
  }

  return {
    // state
    courseHistory,
    loading,
    
    // getters
    stats,
    monthlyStats,
    merchantStats,
    
    // actions
    fetchCourseHistory,
    addFeedback
  }
}) 