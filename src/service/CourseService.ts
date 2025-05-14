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
                        itemImageSrc: `https://picsum.photos/id/${courseDto.courseId}/300/200`,
                        thumbnailImageSrc: `https://picsum.photos/id/${courseDto.courseId}/175/100`,
                        alt: courseDto.image.alt
                    },
                    {
                        itemImageSrc: `https://picsum.photos/id/${courseDto.courseId + 1}/300/200`,
                        thumbnailImageSrc: `https://picsum.photos/id/${courseDto.courseId + 1}/175/100`,
                        alt: '課程圖片2'
                    },
                    {
                        itemImageSrc: `https://picsum.photos/id/${courseDto.courseId + 2}/300/200`,
                        thumbnailImageSrc: `https://picsum.photos/id/${courseDto.courseId + 2}/175/100`,
                        alt: '課程圖片3'
                    }
                ],
                merchant: merchantInfo
            };
    
            // 獲取課程時間槽
            const timeSlots = this.getTimeSlots(courseDto.courseId);
            
            return { course, timeSlots };
        } catch (error) {
            console.error("獲取課程詳情失敗:", error);
            throw error;
        }
    },
    
    getTimeSlots(courseId: number): CourseTime[] {
        // TODO: API 調用
        // API: /api/courses/{courseId}/time-slots

        // 生成時間槽
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
                    imageSrc: `https://picsum.photos/id/237/300/200`,
                    alt: '瑜珈課程圖片'
                },
                merchantName: '瑜珈教室',
                description: '適合初學者的基礎瑜珈課程，教你正確的體位法和呼吸技巧。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 2,
                courseId: 2,
                title: '進階攝影技巧',
                pointsRequired: 15,
                image: {
                    imageSrc: `https://picsum.photos/id/2/300/200`,
                    alt: '攝影課程圖片'
                },
                merchantName: '攝影工作室',
                description: '學習構圖、光線運用及後期處理的進階技巧，提升你的攝影作品質量。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 3,
                courseId: 3,
                title: '義式料理烹飪課',
                pointsRequired: 20,
                image: {
                    imageSrc: `https://picsum.photos/id/3/300/200`,
                    alt: '烹飪課程圖片'
                },
                merchantName: '廚藝教室',
                description: '學習正宗義大利麵、披薩和提拉米蘇等經典義式料理的製作方法。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 4,
                courseId: 4,
                title: '滑板初級班',
                pointsRequired: 8,
                image: {
                    imageSrc: `https://picsum.photos/id/4/300/200`,
                    alt: '滑板課程圖片'
                },
                merchantName: '極限運動中心',
                description: '從零開始學習滑板基本技巧，包括站姿、平衡和簡單動作。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 5,
                courseId: 5,
                title: '水彩畫入門',
                pointsRequired: 12,
                image: {
                    imageSrc: `https://picsum.photos/id/5/300/200`,
                    alt: '水彩畫課程圖片'
                },
                merchantName: '藝術工作室',
                description: '學習水彩畫的基本技法，色彩調配和簡單風景畫創作。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 6,
                courseId: 6,
                title: '爵士鼓基礎課程',
                pointsRequired: 18,
                image: {
                    imageSrc: `https://picsum.photos/id/6/300/200`,
                    alt: '爵士鼓課程圖片'
                },
                merchantName: '音樂教室',
                description: '學習爵士鼓的基本節奏型態、技巧和簡單歌曲的演奏。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 7,
                courseId: 7,
                title: '現代舞蹈班',
                pointsRequired: 15,
                image: {
                    imageSrc: `https://picsum.photos/id/7/300/200`,
                    alt: '舞蹈課程圖片'
                },
                merchantName: '舞蹈教室',
                description: '學習現代舞的基本動作和表現技巧，適合零基礎學員。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 8,
                courseId: 8,
                title: '皮革手作工坊',
                pointsRequired: 25,
                image: {
                    imageSrc: `https://picsum.photos/id/8/300/200`,
                    alt: '皮革手作課程圖片'
                },
                merchantName: '手作坊',
                description: '製作個性化皮革小物，學習基本裁剪、縫製和打磨技巧。',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 9,
                courseId: 9,
                title: '手作皮革工藝',
                pointsRequired: 7,
                image: {
                    imageSrc: `https://picsum.photos/id/9/300/200`,
                    alt: '皮革工藝課程圖片'
                },
                merchantName: '創意手作坊',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 10,
                courseId: 10,
                title: '居家健身訓練',
                pointsRequired: 4,
                image: {
                    imageSrc: `https://picsum.photos/id/10/300/200`,
                    alt: '健身課程圖片'
                },
                merchantName: '活力健身中心',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 11,
                courseId: 11,
                title: '中階瑜珈課程',
                pointsRequired: 15,
                image: {
                    imageSrc: `https://picsum.photos/id/11/300/200`,
                    alt: '瑜珈課程圖片'
                },
                merchantName: '瑜珈教室',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
            {
                merchantId: 12,
                courseId: 12,
                title: '專業攝影工作坊',
                pointsRequired: 18,
                image: {
                    imageSrc: `https://picsum.photos/id/12/300/200`,
                    alt: '攝影課程圖片'
                },
                merchantName: '攝影教室',
                createdAt: new Date(),
                joinCount: Math.floor(Math.random() * 50) + 5
            },
        ];
    }
}