import { useToast } from 'primevue/usetoast';

const toast = useToast();

export function showSuccess(message: string): void {
    toast.add({
        severity: 'success',
        summary: '成功',
        detail: message,
        life: 3000
    });
}

export function showError(message: string): void {
    toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: message,
        life: 3000
    });
}

export function showInfo(message: string): void {
    toast.add({
        severity: 'info',
        summary: '提示',
        detail: message,
        life: 3000
    });
}

export function showWarning(message: string): void {
    toast.add({
        severity: 'warn',
        summary: '警告',
        detail: message,
        life: 3000
    });
} 