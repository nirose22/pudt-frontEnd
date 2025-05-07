import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import api from '@/utils/api'  // 實際環境使用 API 呼叫

/**
 * 缺席/請假記錄項目
 */
export interface AbsenceRecord {
  id: number
  date: string | Date
  courseId: number
  courseTitle: string
  merchantId: number
  merchantName: string
  location: string
  time: string
  type: 'noshow' | 'leave'    // noshow: 缺席, leave: 請假
  reason?: string             // 請假原因
  penaltyPoints?: number      // 扣除點數（如果有懲罰）
  status: 'pending' | 'approved' | 'rejected' | 'completed'  // 請假審核狀態
  submitTime?: string | Date   // 提交請假時間
  approveTime?: string | Date  // 審核時間
  approvedBy?: string          // 審核人
}

/**
 * 缺席/請假記錄 Store - 管理會員缺席和請假記錄
 */
export const useAttendanceStore = defineStore('attendance', () => {
  /* ---------- state ---------- */
  /** 缺席/請假記錄 */
  const absences = ref<AbsenceRecord[]>([])
  
  /** 載入狀態 */
  const loading = ref(false)

  /* ---------- getters ---------- */
  /** 缺席統計 */
  const absenceStats = computed(() => {
    const total = absences.value.length
    const noshowCount = absences.value.filter(a => a.type === 'noshow').length
    const leaveCount = absences.value.filter(a => a.type === 'leave').length
    const approvedLeaves = absences.value.filter(a => a.type === 'leave' && a.status === 'approved').length
    const pendingLeaves = absences.value.filter(a => a.type === 'leave' && a.status === 'pending').length
    const rejectedLeaves = absences.value.filter(a => a.type === 'leave' && a.status === 'rejected').length
    
    // 缺席率 = 缺席次數 / 總數
    const noshowRate = total > 0 ? (noshowCount / total) * 100 : 0
    
    // 請假率 = 請假次數 / 總數
    const leaveRate = total > 0 ? (leaveCount / total) * 100 : 0
    
    // 懲罰點數總計
    const totalPenaltyPoints = absences.value.reduce((sum, a) => sum + (a.penaltyPoints || 0), 0)
    
    return {
      total,
      noshowCount,
      leaveCount,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
      noshowRate,
      leaveRate,
      totalPenaltyPoints
    }
  })
  
  /** 按月缺席統計 */
  const monthlyAbsences = computed(() => {
    const months: Record<string, { noshow: number, leave: number }> = {}
    
    absences.value.forEach(absence => {
      const date = new Date(absence.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = { noshow: 0, leave: 0 }
      }
      
      if (absence.type === 'noshow') {
        months[monthKey].noshow++
      } else if (absence.type === 'leave') {
        months[monthKey].leave++
      }
    })
    
    return Object.entries(months)
      .map(([month, counts]) => ({ 
        month, 
        noshow: counts.noshow, 
        leave: counts.leave,
        total: counts.noshow + counts.leave
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  })

  /* ---------- actions ---------- */
  /**
   * 獲取缺席/請假記錄
   * @param userId 用戶ID，未提供時默認獲取當前用戶
   * @param params 查詢參數 (分頁、過濾等)
   */
  async function fetchAbsences(userId?: number, params?: { type?: 'noshow' | 'leave', status?: string, from?: string, to?: string }) {
    loading.value = true
    try {
      // 實際環境使用 API
      // const { data } = await api.get(`/users/${userId || 'me'}/absences`, { params })
      
      // 模擬數據
      const data: AbsenceRecord[] = [
        {
          id: 1,
          date: '2025-04-18',
          courseId: 103,
          courseTitle: '高級瑜伽課程',
          merchantId: 2,
          merchantName: '平衡身心工作室',
          location: '平衡身心工作室 - 主店',
          time: '18:00-20:00',
          type: 'noshow',
          penaltyPoints: 1,
          status: 'completed'
        },
        {
          id: 2,
          date: '2025-04-10',
          courseId: 104,
          courseTitle: '瑜伽基礎課程',
          merchantId: 1,
          merchantName: '和平瑜伽中心',
          location: '和平瑜伽中心 - 中山店',
          time: '10:00-12:00',
          type: 'leave',
          reason: '身體不適',
          status: 'approved',
          submitTime: '2025-04-09T15:30:00',
          approveTime: '2025-04-09T16:45:00',
          approvedBy: '商家管理員'
        },
        {
          id: 3,
          date: '2025-03-25',
          courseId: 105,
          courseTitle: '瑜伽進階班',
          merchantId: 1,
          merchantName: '和平瑜伽中心',
          location: '和平瑜伽中心 - 信義店',
          time: '14:00-16:00',
          type: 'leave',
          reason: '臨時有事',
          status: 'rejected',
          submitTime: '2025-03-25T08:30:00',
          approveTime: '2025-03-25T09:15:00',
          approvedBy: '系統',
          penaltyPoints: 1
        }
      ]
      
      absences.value = data
      return { success: true, data }
    } catch (error) {
      console.error('獲取缺席/請假記錄失敗:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 提交請假申請
   * @param bookingId 預約ID
   * @param reason 請假原因
   */
  async function submitLeaveRequest(bookingId: number, reason: string) {
    try {
      // 實際環境使用 API
      // const { data } = await api.post(`/bookings/${bookingId}/leave`, { reason })
      
      // 模擬數據 - 假設這是 API 返回的新請假記錄
      const newLeave: AbsenceRecord = {
        id: absences.value.length + 1,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // 明天
        courseId: 106,
        courseTitle: '瑜伽拉伸課',
        merchantId: 1,
        merchantName: '和平瑜伽中心',
        location: '和平瑜伽中心 - 中山店',
        time: '16:00-18:00',
        type: 'leave',
        reason: reason,
        status: 'pending',
        submitTime: new Date().toISOString()
      }
      
      // 添加到列表中
      absences.value.unshift(newLeave)
      
      return { success: true, data: newLeave }
    } catch (error) {
      console.error('提交請假申請失敗:', error)
      return { success: false, error }
    }
  }
  
  /**
   * 取消請假申請（僅限 pending 狀態）
   * @param leaveId 請假記錄 ID
   */
  async function cancelLeaveRequest(leaveId: number) {
    try {
      // 實際環境使用 API
      // await api.delete(`/absences/leave/${leaveId}`)
      
      // 更新本地數據 - 從列表中移除
      const index = absences.value.findIndex(a => a.id === leaveId && a.status === 'pending')
      if (index >= 0) {
        absences.value.splice(index, 1)
      }
      
      return { success: true }
    } catch (error) {
      console.error('取消請假申請失敗:', error)
      return { success: false, error }
    }
  }

  return {
    // state
    absences,
    loading,
    
    // getters
    absenceStats,
    monthlyAbsences,
    
    // actions
    fetchAbsences,
    submitLeaveRequest,
    cancelLeaveRequest
  }
}) 