
// 分頁響應類型
export interface PageDTO<T> {
    total: number;
    pages: number;
    pageNum: number;
    pageSize: number;
    list: T[];
}