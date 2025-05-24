import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MerchantBookingService } from '@/services/MerchantBookingService';
import type { MerchantBookingDetail } from '@/types/booking';
import { BookingStatus } from '@/enums/BookingStatus';
import { showSuccess, showError } from '@/utils/toastHelper';
import { useMerchantStore } from './merchantStore';
import type { BookingQuery } from '@/services/MerchantBookingService';

export const useMerchantBookingStore = defineStore('merchantBooking', () => {
    const bookings = ref<MerchantBookingDetail[]>([]);
    const selectedBooking = ref<MerchantBookingDetail | null>(null);
    const loading = ref(false);
    const merchantStore = useMerchantStore();
    const merchantId = merchantStore.profile!.id;


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
        try {
            const query: BookingQuery = {
                status: filters.value.status ?? undefined,
                date: filters.value.dateRange?.start?.toISOString()
            }
            const response = await MerchantBookingService.getMerchantBookings(merchantId, query);
            bookings.value = response.data || [];
        } catch (error) {
            showError('加載預約列表失敗');
            console.error('加載預約列表失敗:', error);
        } finally {
            loading.value = false;
        }
    }

    // 加載預約詳情
    async function loadBookingDetail(id: number): Promise<void> {
        loading.value = true;
        try {
            const response = await MerchantBookingService.getBookingDetail(merchantId, id);
            selectedBooking.value = response.data || null;
        } catch (error) {
            showError('加載預約詳情失敗');
            console.error('加載預約詳情失敗:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    // 更新預約狀態
    async function updateBookingStatus(
        bookingId: number,
        status: BookingStatus
    ): Promise<void> {
        try {
            await MerchantBookingService.updateBookingStatus(merchantId, bookingId, status);
            await loadBookingDetail(bookingId);
            showSuccess('預約狀態已更新');
        } catch (error) {
            showError('更新預約狀態失敗');
            throw error;
        }
    }

    // 更新預約備註
    async function updateBookingNotes(
        bookingId: number,
        notes: string
    ): Promise<void> {
        try {
            await MerchantBookingService.updateBookingNotes(merchantId, bookingId, notes);
            if (selectedBooking.value) {
                selectedBooking.value.merchantNotes = notes;
            }
            showSuccess('預約備註已更新');
        } catch (error) {
            showError('更新預約備註失敗');
            console.error('更新預約備註失敗:', error);
            throw error;
        }
    }

    // 發送訊息
    async function sendMessage(
        bookingId: number,
        content: string,
        options: { email: boolean; sms: boolean }
    ): Promise<void> {
        try {
            await MerchantBookingService.sendMessage(merchantId, bookingId, content, options);
            showSuccess('訊息已發送');
        } catch (error) {
            showError('發送訊息失敗');
            console.error('發送訊息失敗:', error);
            throw error;
        }
    }

    // 設置過濾條件
    function setFilters(newFilters: typeof filters.value): void {
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