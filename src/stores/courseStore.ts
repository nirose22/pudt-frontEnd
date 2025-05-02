import type { Course, CourseTime } from '@/types/course'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const currentCourse = ref<Course>({
    courseId: 1,
    title: '初學者瑜珈課程',
    description: '本課程適合初學者，從基礎姿勢開始教學，幫助您建立正確的瑜珈概念。',
    price: 1200,
    pointsRequired: 12,
    joinCount: 10,
    images: [
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
      {
        itemImageSrc: 'https://dummyjson.com/image/200x100',
        thumbnailImageSrc: 'https://dummyjson.com/image/200x100',
        alt: '課程圖片',
      },
    ],
    merchant: {
      name: '和平瑜珈中心',
      address: '台北市信義區和平東路一段100號',
      rating: 4.8,
      reviewCount: 24,
      phone: '02-2345-6789',
      description: '我們是一家專業的瑜珈教室，擁有10年以上教學經驗，提供多種瑜珈課程，從入門到進階，適合不同程度的學員。我們的教練團隊都擁有國際認證，注重個人指導和安全練習。',
      businessHours: '週一至週五 9:00-21:00，週六至週日 10:00-18:00',
      type: '瑜珈',
      website: 'https://www.facebook.com/p/和平瑜珈中心-101',
      googleMapUrl: 'https://maps.google.com/?q=台北市信義區和平東路一段100號'
    }
  })

  const courseTime = ref<CourseTime[]>([
    { id: 1, date: new Date('2025-04-10'), time: '10:00-12:00', availableSeats: 5, totalSeats: 15 },
    { id: 2, date: new Date('2025-04-10'), time: '14:00-16:00', availableSeats: 8, totalSeats: 15 },
    { id: 3, date: new Date('2025-04-11'), time: '10:00-12:00', availableSeats: 12, totalSeats: 15 },
    { id: 4, date: new Date('2025-04-11'), time: '14:00-16:00', availableSeats: 3, totalSeats: 15 },
    { id: 5, date: new Date('2025-04-12'), time: '10:00-12:00', availableSeats: 0, totalSeats: 15 },
    { id: 6, date: new Date('2025-04-12'), time: '14:00-16:00', availableSeats: 10, totalSeats: 15 },
    { id: 7, date: new Date('2025-04-10'), time: '10:00-12:00', availableSeats: 0, totalSeats: 15 },
  ])

  const selectedSlot = ref<CourseTime | null>(null)

  // 根據課程ID獲取課程
  const getCourseById = (courseId: number) => {
    // 實際應用中，這裡應該查詢課程列表或從API獲取
    return courseId === currentCourse.value.courseId ? currentCourse.value : null
  }

  // 檢查課程時段是否有可用座位
  const hasAvailableSeats = computed(() => {
    return selectedSlot.value && selectedSlot.value.availableSeats > 0
  })

  // 更新課程時段的可用座位
  const updateAvailableSeats = (timeSlotId: number, change: number) => {
    const slot = courseTime.value.find(s => s.id === timeSlotId)
    if (slot) {
      slot.availableSeats += change
      // 確保座位數不會小於0或超過總座位數
      slot.availableSeats = Math.max(0, Math.min(slot.availableSeats, slot.totalSeats))
      return true
    }
    return false
  }

  // 獲取課程時間列表
  const getCourseTimeSlots = (courseId: number) => {
    // 實際應用中，這裡應該查詢特定課程的時間槽
    return courseTime.value
  }

  // 根據ID獲取課程時間槽
  const getTimeSlotById = (timeSlotId: number) => {
    return courseTime.value.find(slot => slot.id === timeSlotId) || null
  }

  // 設置選擇的時間槽
  const selectTimeSlot = (timeSlotId: number) => {
    const slot = getTimeSlotById(timeSlotId)
    if (slot) {
      selectedSlot.value = slot
      return true
    }
    return false
  }

  return {
    currentCourse,
    courseTime,
    selectedSlot,
    getCourseById,
    hasAvailableSeats,
    updateAvailableSeats,
    getCourseTimeSlots,
    getTimeSlotById,
    selectTimeSlot
  }
}) 