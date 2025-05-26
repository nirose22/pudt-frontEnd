import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MerchantBookingService } from '@/services/MerchantBookingService';
import type { MerchantBookingDetail } from '@/types/booking';
import { BookingStatus } from '@/enums/BookingStatus';
import { showSuccess, showError } from '@/utils/toastHelper';
import { useMerchantStore } from './merchantStore';
import type { BookingQuery } from '@/services/MerchantBookingService';
import { errorHandler } from '@/utils/errorHandler';
import { ERROR_MESSAGES } from '@/utils/apiConfig';

export const useMerchantBookingStore = defineStore('merchantBooking', () => {
    const bookings = ref<MerchantBookingDetail[]>([]);
    const selectedBooking = ref<MerchantBookingDetail | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const merchantStore = useMerchantStore();
    const merchantId = computed(() => merchantStore.profile?.id);

    // 檢查商家 ID 是否存在
    function checkMerchantId(): number {
        if (!merchantId.value) {
            throw new Error('商家資料未載入');
        }
        return merchantId.value;
    }

    const filters = ref({
        search: '',
        dateRange: null as { start: Date; end: Date } | null,
        status: null as BookingStatus | null
    });

    // 計算屬性：過濾後的預約列表
    const filteredBookings = computed(() => {
        return bookings.value.filter(booking => {
            // 搜索條件
            if (filters.value.search) {
                const searchLower = filters.value.search.toLowerCase();
                if (!booking.customerName.toLowerCase().includes(searchLower) &&
                    !booking.customerPhone.includes(searchLower)) {
                    return false;
                }
            }

            // 日期範圍
            if (filters.value.dateRange) {
                const bookingDate = new Date(booking.date);
                if (bookingDate < filters.value.dateRange.start ||
                    bookingDate > filters.value.dateRange.end) {
                    return false;
                }
            }

            // 狀態
            if (filters.value.status && booking.status !== filters.value.status) {
                return false;
            }

            return true;
        });
    });

    // 加載預約列表
    async function loadBookings(): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const query: BookingQuery = {
                status: filters.value.status ?? undefined,
                date: filters.value.dateRange?.start?.toISOString()
            }
            const response = await MerchantBookingService.getMerchantBookings(checkMerchantId(), query);
            if (!response.success) {
                throw new Error(response.message || ERROR_MESSAGES.BOOKING_ERROR);
            }
            bookings.value = response.data || [];
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR;
            showError(error.value);
            console.error('加載預約列表失敗:', err);
        } finally {
            loading.value = false;
        }
    }

    // 加載預約詳情
    async function loadBookingDetail(id: number): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const response = await MerchantBookingService.getBookingDetail(checkMerchantId(), id);
            if (!response.success) {
                throw new Error(response.message || ERROR_MESSAGES.BOOKING_ERROR);
            }
            selectedBooking.value = response.data || null;
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR;
            showError(error.value);
            console.error('加載預約詳情失敗:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // 更新預約狀態
    async function updateBookingStatus(
        bookingId: number,
        status: BookingStatus
    ): Promise<void> {
        error.value = null;
        try {
            const response = await MerchantBookingService.updateBookingStatus(checkMerchantId(), bookingId, status);
            if (!response.success) {
                throw new Error(response.message || ERROR_MESSAGES.BOOKING_ERROR);
            }
            await loadBookingDetail(bookingId);
            showSuccess('預約狀態已更新');
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR;
            showError(error.value);
            throw err;
        }
    }

    // 更新預約備註
    async function updateBookingNotes(
        bookingId: number,
        notes: string
    ): Promise<void> {
        error.value = null;
        try {
            const response = await MerchantBookingService.updateBookingNotes(checkMerchantId(), bookingId, notes);
            if (!response.success) {
                throw new Error(response.message || ERROR_MESSAGES.BOOKING_ERROR);
            }
            if (selectedBooking.value) {
                selectedBooking.value.notes = notes;
            }
            showSuccess('預約備註已更新');
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR;
            showError(error.value);
            console.error('更新預約備註失敗:', err);
            throw err;
        }
    }

    // 發送訊息
    async function sendMessage(
        bookingId: number,
        content: string,
        options: { email: boolean; sms: boolean }
    ): Promise<void> {
        error.value = null;
        try {
            const response = await MerchantBookingService.sendMessage(checkMerchantId(), bookingId, content, options);
            if (!response.success) {
                throw new Error(response.message || ERROR_MESSAGES.BOOKING_ERROR);
            }
            showSuccess('訊息已發送');
        } catch (err) {
            error.value = err instanceof Error ? err.message : ERROR_MESSAGES.BOOKING_ERROR;
            showError(error.value);
            console.error('發送訊息失敗:', err);
            throw err;
        }
    }

    // 設置過濾條件
    function setFilters(newFilters: Partial<typeof filters.value>): void {
        filters.value = { ...filters.value, ...newFilters };
    }

    // 重置過濾條件
    function resetFilters(): void {
        filters.value = {
            search: '',
            dateRange: null,
            status: null
        };
    }

    return {
        bookings,
        selectedBooking,
        loading,
        error,
        filters,
        filteredBookings,
        loadBookings,
        loadBookingDetail,
        updateBookingStatus,
        updateBookingNotes,
        sendMessage,
        setFilters,
        resetFilters
    };
}); 