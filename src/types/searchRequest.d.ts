export interface SearchRequest {
    keyword?: string;
    regions?: string[];
    categories?: string[];
    minPoints?: number;
    maxPoints?: number;
    hasOpenSlots?: boolean;
    newCourses?: boolean;
    favourites?: boolean;
    sortBy?: string;
    sortOrder?: string;
    pageNum?: number;
    pageSize?: number;
}