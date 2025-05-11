import { CourseService } from '@/service/CourseService'
import type { Course, CourseTime } from '@/types'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCourseStore = defineStore('course', () => {
    const currentCourse = ref<Course>();
    const courseTime = ref<CourseTime[]>([]);
    const selectedSlot = ref<CourseTime | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 加载课程详情和时间槽
    const loadCourseDetail = async (courseId: number): Promise<boolean> => {
        loading.value = true;
        error.value = null;

        try {
            const { course, timeSlots } = await CourseService.fetchCourseDetail(courseId);
            currentCourse.value = course;
            courseTime.value = timeSlots;
            return true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : '加載課程詳情失敗';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // 检查课程时段是否有可用座位
    const hasAvailableSeats = computed(() => {
        return selectedSlot.value && selectedSlot.value.availableSeats > 0;
    });

    // 更新課程時段的可用座位
    const updateAvailableSeats = (timeSlotId: number, change: number) => {
        const slot = courseTime.value.find(s => s.id === timeSlotId);
        if (slot) {
            slot.availableSeats += change
            // 確保座位數不會小於0或超過總座位數
            slot.availableSeats = Math.max(0, Math.min(slot.availableSeats, slot.totalSeats))
            return true
        }
        return false
    }

    // 根据ID获取课程时间槽
    const getTimeSlotById = (timeSlotId: number) => {
        return courseTime.value.find(slot => slot.id === timeSlotId) || null;
    };

    // 设置选择的时间槽
    const selectTimeSlot = (timeSlotId: number) => {
        const slot = getTimeSlotById(timeSlotId);
        if (slot) {
            selectedSlot.value = slot;
            return true;
        }
        return false;
    };

    return {
        currentCourse,
        courseTime,
        selectedSlot,
        loading,
        error,
        loadCourseDetail,
        hasAvailableSeats,
        updateAvailableSeats,
        getTimeSlotById,
        selectTimeSlot
    };
}); 