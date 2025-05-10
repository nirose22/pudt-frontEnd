import type { Course, CourseDTO } from "@/types/course";

export const CourseService = {
    getCourseData(): CourseDTO[] {
        return [
            {
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
                courseId: 3,
                title: '義式料理烹飪課',
                pointsRequired: 20,
                images: [
                    {
                        imageSrc: 'https://via.placeholder.com/300x200?text=Cooking',
                        alt: '烹飪課程圖片'
                    }
                ],
                merchantName: '廚藝教室',
                description: '學習正宗義大利麵、披薩和提拉米蘇等經典義式料理的製作方法。'
            },
            {
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
            courseId: 6,
            title: '手作皮革工藝',
            pointsRequired: 7,
            image: {
                imageSrc: 'https://via.placeholder.com/150',
                alt: '皮革工藝課程圖片'
            },
            merchantName: '創意手作坊'
        },
        {
            courseId: 7,
            title: '居家健身訓練',
            pointsRequired: 4,
            image: {
                imageSrc: 'https://via.placeholder.com/150',
                alt: '健身課程圖片'
            },
            merchantName: '活力健身中心'
        },
        {
            courseId: 8,
            title: '中階瑜珈課程',
            pointsRequired: 15,
            image: {
                imageSrc: 'https://via.placeholder.com/150',
                alt: '瑜珈課程圖片'
            },
            merchantName: '瑜珈教室'
        },
        {
            courseId: 9,
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