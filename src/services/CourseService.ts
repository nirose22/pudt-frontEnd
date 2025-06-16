import type { Course, CourseDetailDTO, CourseSession } from '@/types/course'
import type { Photo, Result } from '@/types'
import api from '@/utils/api';
import { API_ROUTES } from '@/utils/apiConfig'
import { request, buildQueryString } from '@/utils/requestHelper'
import { useUserStore } from '@/stores/userStore'
import type { SearchRequest } from '@/types/searchRequest';
import type { PageDTO } from '@/types/PageDTO';


export class CourseService {


    /* ----------------- List & Detail ----------------- */
    static getCourse(keyword?: string, regions?: string[], categories?: string[]): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ 
            keyword, 
            regions: regions?.join(','), 
            categories: categories?.join(','),
            includeCategories: 'true'
        })
        const url = `${API_ROUTES.COURSE.SEARCH}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    // 新增POST搜索方法，與後端接口匹配 - 現在返回分頁結果
    static searchCourses(searchRequest: SearchRequest): Promise<Result<PageDTO<Course>>> {
        return request<PageDTO<Course>>(() => api.post(API_ROUTES.COURSE.SEARCH, searchRequest))
    }

    static fetchCourseDetail(courseId: number): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(
            () => api.get(API_ROUTES.COURSE.DETAIL(courseId)),
        )
    }
    /* ----------------- Popular & Recommendations & Latest ----------------- */
    /**
     * 獲取熱門課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getPopularCourses(limit: number = 6): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.POPULAR}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    /**
     * 獲取最新上架課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getLatestCourses(limit: number = 6): Promise<Result<Course[]>> {
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.LATEST}${queryString}`
        return request<Course[]>(() => api.get(url))
    }

    /**
     * 獲取個人化推薦課程
     * @param limit 限制返回課程數量，默認為 6
     * @returns Promise<Result<Course[]>>
     */
    static getRecommendedCourses(limit: number = 6): Promise<Result<Course[]>> {
        // 嘗試獲取當前用戶ID，如果未登錄則返回空數組
        const userStore = useUserStore?.(); // 可選鏈以防止錯誤
        const userId = userStore?.user?.id;
        
        if (!userId) {
            // 如果未登錄，返回空的推薦課程列表
            return Promise.resolve({
                success: true,
                data: [],
                message: '未登錄用戶暫無推薦課程'
            } as Result<Course[]>);
        }
        
        const queryString = buildQueryString({ limit: limit.toString() })
        const url = `${API_ROUTES.COURSE.RECOMMENDED(userId)}${queryString}`
        return request<Course[]>(() => api.get(url))
    }
    
    /* ----------------- Sessions ----------------- */
    static getSessionsForCourse(courseId: number): Promise<Result<CourseSession[]>> {
        return request<CourseSession[]>(() => api.get(API_ROUTES.COURSE.SESSIONS(courseId)))
    }

    /* ----------------- Favorites ----------------- */
    static getUserFavorites(userId: number): Promise<Result<Course[]>> {
        return request<Course[]>(() => api.get(API_ROUTES.COURSE.FAVORITES(userId)))
    }

    static toggleFavorite(courseId: number): Promise<Result<void>> {
        if (!courseId || typeof courseId !== 'number') {
            console.error('CourseService.toggleFavorite: 無效的 courseId', courseId, typeof courseId);
            throw new Error('無效的課程ID');
        }
        return request<void>(() => api.post(API_ROUTES.COURSE.FAVORITE(courseId)))
    }

    /* ----------------- Images ----------------- */
    static getCourseImages(courseId: number): Promise<Result<Photo[]>> {
        return request<Photo[]>(() => api.get(API_ROUTES.COURSE.IMAGES(courseId)))
    }

    /* ----------------- CRUD ----------------- */
    static createCourse(course: CourseDetailDTO): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(() => api.post(API_ROUTES.COURSE.LIST, course))
    }

    static updateCourse(courseId: number, course: CourseDetailDTO): Promise<Result<CourseDetailDTO>> {
        return request<CourseDetailDTO>(() => api.put(API_ROUTES.COURSE.DETAIL(courseId), course))
    }
}
