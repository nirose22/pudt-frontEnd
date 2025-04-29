import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CourseSlot {
  id: number
  date: string
  time: string
  availableSeats: number
  totalSeats: number
}

export const useCourseStore = defineStore('course', () => {
const currentCourse = ref({
    classuid: 1,
    title: '初學者瑜珈課程',
    description: '本課程適合初學者，從基礎姿勢開始教學，幫助您建立正確的瑜珈概念。',
    price: 1200,
    pointsRequired: 12,
    images: [
      'https://dummyjson.com/image/200x100',
      'https://dummyjson.com/image/200x100',
      'https://dummyjson.com/image/200x100',
    ],
    joinCount: 10,
    merchant: {
      id: 101,
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

  const courseSlots = ref<CourseSlot[]>([
    { id: 1, date: '2025-04-10', time: '10:00-12:00', availableSeats: 5, totalSeats: 15 },
    { id: 2, date: '2025-04-10', time: '14:00-16:00', availableSeats: 8, totalSeats: 15 },
    { id: 3, date: '2025-04-11', time: '10:00-12:00', availableSeats: 12, totalSeats: 15 },
    { id: 4, date: '2025-04-11', time: '14:00-16:00', availableSeats: 3, totalSeats: 15 },
    { id: 5, date: '2025-04-12', time: '10:00-12:00', availableSeats: 0, totalSeats: 15 },
    { id: 6, date: '2025-04-12', time: '14:00-16:00', availableSeats: 10, totalSeats: 15 },
  ])

  const selectedSlot = ref<CourseSlot | null>(null)
  const userPoints = ref(50)

  const canBook = computed(() => {
    return selectedSlot.value && 
           selectedSlot.value.availableSeats > 0 && 
           userPoints.value >= currentCourse.value.pointsRequired
  })

  const bookCourse = () => {
    if (!selectedSlot.value || !canBook.value) return false
    
    // 在實際應用中，這裡應該是一個API調用
    userPoints.value -= currentCourse.value.pointsRequired
    
    // 更新可用座位
    const slot = courseSlots.value.find(s => s.id === selectedSlot.value?.id)
    if (slot) {
      slot.availableSeats--
    }
    
    return true
  }

  return {
    currentCourse,
    courseSlots,
    selectedSlot,
    userPoints,
    canBook,
    bookCourse
  }
}) 