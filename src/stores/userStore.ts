import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Course, Result } from '@/types'
import { UserGender, UserRole } from '@/enums/User';
import { RegionCode } from '@/enums/RegionCode';
import { MainCategory } from '@/enums/CourseCategory';
// import * as userApi from '@/services/userApi'

// 带有商家信息的扩展课程接口，用于模拟数据
interface CourseWithMerchant extends Course {
    merchant?: {
        id: number;
        name: string;
        rating?: number;
        reviewCount?: number;
    }
}

export const useUserStore = defineStore('user', () => {
    /* ---------- state (auto‑persist) ---------- */
    const profile = ref<User | null>(null)
    const points = ref<number>(0)
    const favs = ref<Course[]>([])
    const interests = ref<string[]>([]) // 用户兴趣标签 (主分类)

    /* ---------- getters ---------- */
    const isLoggedIn = computed(() => !!profile.value)
    const displayName = computed(() => profile.value?.name ?? UserRole.Guest)
    // 获取用户ID
    const userId = computed(() => profile.value?.id)

    // 收藏课程列表 - 通过计算属性使其响应式
    const favoriteCourses = computed(() => favs.value)

    // 判断课程是否被收藏
    const isFavorite = (id: number) => favs.value.some(c => c.id === id)
    const userInterests = computed(() => interests.value)

    /* ---------- actions ---------- */
    async function fetchProfile(id?: number) {
        //TODO: 從 API 取得用戶資料
        // const { success, data } = await userApi.fetchProfile(id)
        const data: User = {
            id: 1,
            name: 'John',
            points: 100,
            email: 'john@example.com',
            phone: '1234567890',
            avatarUrl: 'https://example.com/avatar.jpg',
            createdAt: new Date(),
            lastLogin: new Date(),
            address: '台北市信義區',
            gender: UserGender.Male,
            birthday: new Date('1990-01-01'),
        }

        if (data) {
            profile.value = data
            points.value = data.points ?? 0
        }

        //TODO: 從 API 取得收藏
        // const { success, data } = await userApi.fetchFavorites(id)
        const favsData: Course[] = [
            {
                id: 1,
                merchantId: 1,
                title: '課程1',
                points: 100,
                coverUrl: 'https://example.com/cover.jpg',
                region: RegionCode.TPE,
                createdAt: new Date(),
            }
        ]
        favs.value = favsData

        // 从localStorage获取用户兴趣标签
        const savedInterests = localStorage.getItem('userInterests');
        if (savedInterests) {
            try {
                const parsedInterests = JSON.parse(savedInterests);
                if (Array.isArray(parsedInterests)) {
                    interests.value = parsedInterests;
                }
            } catch (e) {
                console.error('解析用户兴趣数据失败:', e);
            }
        }

        return data
    }

    // 获取用户收藏的课程
    async function fetchFavoriteCourses(): Promise<Result<Course[]>> {
        if (!isLoggedIn.value) {
            return { success: false, message: '用户未登录' };
        }

        try {
            // TODO: 实际环境调用 API
            // const result = await userApi.fetchFavorites(userId.value);

            // 模拟数据 - 这里应该是从 API 获取的数据
            const mockCourses: CourseWithMerchant[] = [
                {
                    id: 1,
                    merchantId: 1,
                    title: '瑜伽初階課程',
                    description: '適合初學者的瑜伽課程，幫助您放鬆身心、增強柔韌性。',
                    points: 80,
                    coverUrl: '/assets/courses/yoga1.jpg',
                    region: RegionCode.TPE,
                    createdAt: new Date('2023-01-15'),
                    merchant: {
                        id: 1,
                        name: '和平瑜伽中心',
                        rating: 4.8,
                        reviewCount: 120
                    }
                },
                {
                    id: 2,
                    merchantId: 2,
                    title: '現代舞蹈工作坊',
                    description: '探索現代舞蹈的基本技巧和表現力，適合各程度的舞者。',
                    points: 120,
                    coverUrl: '/assets/courses/dance1.jpg',
                    region: RegionCode.TPE,
                    createdAt: new Date('2023-02-10'),
                    merchant: {
                        id: 2,
                        name: '舞動空間工作室',
                        rating: 4.5,
                        reviewCount: 85
                    }
                },
                {
                    id: 3,
                    merchantId: 3,
                    title: '攝影基礎班',
                    description: '學習數碼攝影的基本技巧，包括構圖、光線控制和後期處理。',
                    points: 150,
                    coverUrl: '/assets/courses/photo1.jpg',
                    region: RegionCode.KHH,
                    createdAt: new Date('2023-03-05'),
                    merchant: {
                        id: 3,
                        name: '光影攝影學院',
                        rating: 4.9,
                        reviewCount: 64
                    }
                }
            ];

            // 转换为Course类型并更新状态
            const courses: Course[] = mockCourses.map(course => ({
                id: course.id,
                merchantId: course.merchantId,
                title: course.title,
                description: course.description,
                points: course.points,
                coverUrl: course.coverUrl,
                region: course.region,
                createdAt: course.createdAt
            }));

            favs.value = courses;

            return { success: true, data: courses };
        } catch (error) {
            console.error('获取收藏课程失败:', error);
            return { success: false, message: '获取收藏课程失败' };
        }
    }

    /**
     * 添加课程到收藏
     * @param course 要收藏的课程
     * @returns 操作结果
     */
    async function addFavorite(course: Course): Promise<Result<boolean>> {
        if (!isLoggedIn.value) {
            return { success: false, message: '请先登录再收藏课程' };
        }

        try {
            // 检查课程是否已收藏
            if (isFavorite(course.id)) {
                return { success: true, message: '该课程已在收藏中' };
            }

            // TODO: 实际环境调用 API
            // const result = await userApi.addFavorite(userId.value, course.id);

            // 模拟 API 调用成功
            const result = { success: true };

            if (result.success) {
                // 确保课程对象完整
                const courseToAdd = { ...course };
                // 添加到收藏列表
                favs.value.push(courseToAdd);
                return { success: true, message: '已加入收藏' };
            } else {
                return { success: false, message: '添加收藏失败' };
            }
        } catch (error) {
            console.error('添加收藏失败:', error);
            return { success: false, message: '添加收藏时发生错误' };
        }
    }

    /**
     * 取消收藏课程
     * @param id 要取消收藏的课程 ID
     * @returns 操作结果
     */
    async function removeFavorite(id: number): Promise<Result<boolean>> {
        if (!isLoggedIn.value) {
            return { success: false, message: '请先登录' };
        }

        try {
            // TODO: 实际环境调用 API
            // const result = await userApi.removeFavorite(userId.value, id);

            // 模拟 API 调用成功
            const result = { success: true };

            if (result.success) {
                // 从收藏列表中移除
                favs.value = favs.value.filter(c => c.id !== id);
                return { success: true, message: '已從收藏中移除' };
            } else {
                return { success: false, message: '取消收藏失败' };
            }
        } catch (error) {
            console.error('取消收藏失败:', error);
            return { success: false, message: '取消收藏时发生错误' };
        }
    }


    /**
     * 调整用户点数
     * @param amount 要调整的点数
     */
    function adjustPoints(amount: number) {
        points.value += amount
        //TODO: api
        //userApi.adjustPoints
    }

    /**
     * 更新用户资料
     * @param data 要更新的资料
     */
    function updateProfile(data: Partial<User>) {
        if (!profile.value) return { success: false, message: '用户未登录' }
        profile.value = { ...profile.value, ...data }
        //TODO: api
        //userApi.updateProfile

        return { success: true, message: '用户资料已更新' }
    }

    /**
     * 更新用户兴趣标签
     * @param newInterests 新的兴趣标签
     * @returns 操作结果
     */
    function updateUserInterests(newInterests: string[]) {
        if (!profile.value) return { success: false, message: '用户未登录' };

        try {
            // 保存到state
            interests.value = newInterests;
            // 保存到localStorage
            localStorage.setItem('userInterests', JSON.stringify(newInterests));

            return { success: true, message: '用户兴趣已更新' };
        } catch (error) {
            console.error('保存用户兴趣失败:', error);
            return { success: false, message: '保存用户兴趣失败' };
        }
    }

    return {
        // state
        profile,
        points,
        favs,
        interests,
        // getters
        isLoggedIn,
        displayName,
        userId,
        isFavorite,
        userInterests,
        favoriteCourses,
        // actions
        fetchProfile,
        fetchFavoriteCourses,
        adjustPoints,
        updateProfile,
        updateUserInterests,
        addFavorite,
        removeFavorite,
    }
},
    {
        // ---------- persist plugin options ----------
        persist: {
            key: 'user',                // localStorage key
            storage: localStorage,      // 可改 sessionStorage
            pick: ['profile', 'points', 'favs', 'interests']
        }
    })
