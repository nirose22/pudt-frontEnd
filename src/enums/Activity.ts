//活動紀錄類型
export enum ActivityKind {
    Login = 'user_login',         // 使用者登入
    Register = 'user_register',         // 使用者註冊
    Logout = 'user_logout',         // 使用者登出
    ProfileUpdate = 'user_profile_update',         // 更新個人資料
    InterestUpdated = 'interest_updated',         // 更新興趣偏好
    CourseView = 'course_view',         // 課程瀏覽
    CourseClick = 'course_click',         // 課程點擊
    CourseSearch = 'course_search',         // 課程搜尋
    CourseFavorite = 'course_favorite',         // 課程收藏
    CourseUnfavorite = 'course_unfavorite',         // 取消收藏
    CourseBooking = 'course_booking',         // 課程預約
    BookingComplete = 'booking_complete',         // 完成預約
    BookingCancel = 'booking_cancel',         // 取消預約
    Participation = 'participation',         // 參與課程
    RatingSubmitted = 'rating_submitted',         // 提交評分
    ReviewSubmitted = 'review_submitted',         // 提交評論
    PaymentSuccess = 'payment_success',         // 支付成功
    PaymentFailed = 'payment_failed',         // 支付失敗
    Purchase = 'purchase',         // 購買點數
}

export const ActivityKindLabel: Record<ActivityKind, string> = {
    [ActivityKind.Login]: '登入',
    [ActivityKind.Register]: '註冊',
    [ActivityKind.Logout]: '登出',
    [ActivityKind.ProfileUpdate]: '更新個人資料',
    [ActivityKind.InterestUpdated]: '更新興趣偏好',
    [ActivityKind.CourseView]: '課程瀏覽',
    [ActivityKind.CourseClick]: '課程點擊',
    [ActivityKind.CourseSearch]: '課程搜尋',
    [ActivityKind.CourseFavorite]: '課程收藏',
    [ActivityKind.CourseUnfavorite]: '取消收藏',
    [ActivityKind.CourseBooking]: '課程預約',
    [ActivityKind.BookingComplete]: '完成預約',
    [ActivityKind.BookingCancel]: '取消預約',
    [ActivityKind.Participation]: '參與課程',
    [ActivityKind.RatingSubmitted]: '提交評分',
    [ActivityKind.ReviewSubmitted]: '提交評論',
    [ActivityKind.PaymentSuccess]: '支付成功',
    [ActivityKind.PaymentFailed]: '支付失敗',
    [ActivityKind.Purchase]: '購買點數',
}