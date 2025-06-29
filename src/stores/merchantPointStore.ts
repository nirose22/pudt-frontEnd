import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PointTransaction, PointStats } from '@/types/point';
import { MerchantPointService } from '@/services/MerchantPointService';
import { showSuccess, showError } from '@/utils/toastHelper';

export const useMerchantPointStore = defineStore('merchantPoint', () => {
    // 狀態
    const pointsStats = ref<PointStats | null>(null);
    const transactions = ref<PointTransaction[]>([]);
    const loading = ref(false);
    const filters = ref({
        dateRange: {
            start: null as Date | null,
            end: null as Date | null
        },
        type: ''
    });

    // 計算屬性
    const filteredTransactions = computed(() => {
        let result = [...transactions.value];
        
        if (filters.value.dateRange.start && filters.value.dateRange.end) {
            result = result.filter(transaction => {
                const transactionDate = transaction.date.getTime();
                const startDate = filters.value.dateRange.start!.getTime();
                const endDate = filters.value.dateRange.end!.getTime();
                return transactionDate >= startDate && transactionDate <= endDate;
            });
        }
        
        if (filters.value.type) {
            result = result.filter(transaction => transaction.type === filters.value.type);
        }
        
        return result;
    });

    // 方法
    async function loadPointsStats(merchantId: number): Promise<void> {
        loading.value = true;
        try {
            const result = await MerchantPointService.getPointsStats(merchantId);
            if (result.success && result.data) {
                pointsStats.value = result.data;
            }
        } catch (error) {
            console.error('加載點數統計失敗:', error);
            showError('無法加載點數統計，請稍後再試', '加載失敗');
        } finally {
            loading.value = false;
        }
    }

    async function loadTransactions(merchantId: number): Promise<void> {
        loading.value = true;
        try {
            const result = await MerchantPointService.getTransactions(merchantId);
            if (result.success && result.data) {
                transactions.value = result.data;
            }
        } catch (error) {
            console.error('加載交易記錄失敗:', error);
            showError('無法加載交易記錄，請稍後再試', '加載失敗');
        } finally {
            loading.value = false;
        }
    }

    async function submitSettlement(merchantId: number, amount: number, bankInfo: {
        code: string;
        account: string;
        name: string;
    }): Promise<void> {
        loading.value = true;
        try {
            const result = await MerchantPointService.submitSettlement(merchantId, amount, bankInfo);
            if (result.success) {
                await loadPointsStats(merchantId);
                await loadTransactions(merchantId);
                showSuccess('您的結算申請已送出，將於 3-5 個工作天內處理', '申請成功');
            }
        } catch (error) {
            console.error('提交結算申請失敗:', error);
            showError('請稍後再試', '申請失敗');
        } finally {
            loading.value = false;
        }
    }

    function setFilters(newFilters: typeof filters.value): void {
        filters.value = newFilters;
    }

    function resetFilters(): void {
        filters.value = {
            dateRange: {
                start: null,
                end: null
            },
            type: ''
        };
    }

    return {
        // 狀態
        pointsStats,
        transactions,
        loading,
        filters,
        // 計算屬性
        filteredTransactions,
        // 方法
        loadPointsStats,
        loadTransactions,
        submitSettlement,
        setFilters,
        resetFilters
    };
}); 