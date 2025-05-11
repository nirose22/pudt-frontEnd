import type { Course, CourseDTO, CourseTime } from "@/types/course";
import { MerchantService } from "./MerchantService";

export const CourseService = {
    /**
     * 獲取課程列表
     * @returns 課程列表 Promise
     */
    getCourse() {
        // TODO: 從後端獲取課程列表
        // API: /api/courses
        return Promise.resolve(this.getCourseData());
    },

    /**
     * 整合獲取課程詳情、時間和商家信息
     * @param courseId 課程ID
     * @returns 包含課程詳情、時間和商家信息的Promise
     */
    async fetchCourseDetail(courseId: number): Promise<{
        course: Course;
        timeSlots: CourseTime[];
    }> {
        try {
            // TODO: 實際環境可以改為單一API調用，例如:
            // GET /api/courses/{courseId}/detail
            
            // 獲取課程詳情
            const courseDto = this.getCourseData().find(c => c.courseId === courseId);
            
            if (!courseDto) {
                throw new Error(`找不到ID為 ${courseId} 的課程`);
            }
            
            // 獲取商家信息
            const merchantInfo = await MerchantService.getMerchantInfo(courseDto.merchantId);
            
            // 構建完整課程信息
            const course: Course = {
                merchantId: courseDto.merchantId,
                courseId: courseDto.courseId,
                title: courseDto.title,
                description: courseDto.description || '暫無描述',
                price: courseDto.pointsRequired * 100,
                pointsRequired: courseDto.pointsRequired,
                joinCount: Math.floor(Math.random() * 20) + 5,
                images: [
                    {
                        itemImageSrc: courseDto.image.imageSrc,
                        thumbnailImageSrc: courseDto.image.imageSrc,
                        alt: courseDto.image.alt
                    },
                    {
                        itemImageSrc: 'https://via.placeholder.com/400x300?text=Course',
                        thumbnailImageSrc: 'https://via.placeholder.com/100x75?text=Course',
                        alt: '課程圖片2'
                    },
                    {
                        itemImageSrc: 'https://via.placeholder.com/400x300?text=Detail',
                        thumbnailImageSrc: 'https://via.placeholder.com/100x75?text=Detail',
                        alt: '課程圖片3'
                    }
                ],
                merchant: merchantInfo
            };
            
            // 獲取課程時間槽
            const timeSlots = this.generateTimeSlots();
            
            return { course, timeSlots };
        } catch (error) {
            console.error("獲取課程詳情失敗:", error);
            throw error;
        }
    },
    
    // 私有方法：生成模擬時間槽
    generateTimeSlots(): CourseTime[] {
        const timeSlots: CourseTime[] = [];
        const currentDate = new Date();
        
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(currentDate.getDate() + i);
            
            timeSlots.push({
                id: timeSlots.length + 1,
                date: new Date(date),
                time: '10:00-12:00',
                availableSeats: Math.floor(Math.random() * 15),
                totalSeats: 15
            });
            
            timeSlots.push({
                id: timeSlots.length + 1,
                date: new Date(date),
                time: '14:00-16:00',
                availableSeats: Math.floor(Math.random() * 15),
                totalSeats: 15
            });
        }
        
        return timeSlots;
    },
    
    // 課程數據（僅用於模擬）
    getCourseData(): CourseDTO[] {
        // TODO: 從後端獲取課程資料: 
        // API: /api/courses
        return [
            {
                merchantId: 1,
                courseId: 1,
                title: '初學者瑜珈課程',
                pointsRequired: 10,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Yoga',
                    alt: '瑜珈課程圖片'
                },
                merchantName: '瑜珈教室',
                description: '適合初學者的基礎瑜珈課程，教你正確的體位法和呼吸技巧。'
            },
            {
                merchantId: 2,
                courseId: 2,
                title: '進階攝影技巧',
                pointsRequired: 15,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Photography',
                    alt: '攝影課程圖片'
                },
                merchantName: '攝影工作室',
                description: '學習構圖、光線運用及後期處理的進階技巧，提升你的攝影作品質量。'
            },
            {
                merchantId: 3,
                courseId: 3,
                title: '義式料理烹飪課',
                pointsRequired: 20,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Cooking',
                    alt: '烹飪課程圖片'
                },
                merchantName: '廚藝教室',
                description: '學習正宗義大利麵、披薩和提拉米蘇等經典義式料理的製作方法。'
            },
            {
                merchantId: 4,
                courseId: 4,
                title: '滑板初級班',
                pointsRequired: 8,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Skateboard',
                    alt: '滑板課程圖片'
                },
                merchantName: '極限運動中心',
                description: '從零開始學習滑板基本技巧，包括站姿、平衡和簡單動作。'
            },
            {
                merchantId: 5,
                courseId: 5,
                title: '水彩畫入門',
                pointsRequired: 12,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Watercolor',
                    alt: '水彩畫課程圖片'
                },
                merchantName: '藝術工作室',
                description: '學習水彩畫的基本技法，色彩調配和簡單風景畫創作。'
            },
            {
                merchantId: 6,
                courseId: 6,
                title: '爵士鼓基礎課程',
                pointsRequired: 18,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Drums',
                    alt: '爵士鼓課程圖片'
                },
                merchantName: '音樂教室',
                description: '學習爵士鼓的基本節奏型態、技巧和簡單歌曲的演奏。'
            },
            {
                merchantId: 7,
                courseId: 7,
                title: '現代舞蹈班',
                pointsRequired: 15,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Dance',
                    alt: '舞蹈課程圖片'
                },
                merchantName: '舞蹈教室',
                description: '學習現代舞的基本動作和表現技巧，適合零基礎學員。'
            },
            {
                merchantId: 8,
                courseId: 8,
                title: '皮革手作工坊',
                pointsRequired: 25,
                image: {
                    imageSrc: 'https://via.placeholder.com/300x200?text=Leather',
                    alt: '皮革手作課程圖片'
                },
                merchantName: '手作坊',
                description: '製作個性化皮革小物，學習基本裁剪、縫製和打磨技巧。'
            },
            {
                merchantId: 9,
                courseId: 9,
                title: '手作皮革工藝',
                pointsRequired: 7,
                image: {
                    imageSrc: 'https://via.placeholder.com/150',
                    alt: '皮革工藝課程圖片'
                },
                merchantName: '創意手作坊'
            },
            {
                merchantId: 10,
                courseId: 10,
                title: '居家健身訓練',
                pointsRequired: 4,
                image: {
                    imageSrc: 'https://via.placeholder.com/150',
                    alt: '健身課程圖片'
                },
                merchantName: '活力健身中心'
            },
            {
                merchantId: 11,
                courseId: 11,
                title: '中階瑜珈課程',
                pointsRequired: 15,
                image: {
                    imageSrc: 'https://via.placeholder.com/150',
                    alt: '瑜珈課程圖片'
                },
                merchantName: '瑜珈教室'
            },
            {
                merchantId: 12,
                courseId: 12,
                title: '專業攝影工作坊',
                pointsRequired: 18,
                image: {
                    imageSrc: 'https://via.placeholder.com/150',
                    alt: '攝影課程圖片'
                },
                merchantName: '攝影教室'
            },
        ];
    }
}