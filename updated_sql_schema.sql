-- 創建數據庫
CREATE DATABASE IF NOT EXISTS pudt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用數據庫
USE pudt;

-- 1. 用戶基本信息表
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用戶ID',
  `name` VARCHAR(100) NOT NULL COMMENT '用戶姓名',
  `email` VARCHAR(100) NOT NULL COMMENT '電子郵箱',
  `phone` VARCHAR(20) NOT NULL COMMENT '手機號碼',
  `points` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '點數餘額',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '頭像URL',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `gender` ENUM('M', 'F', 'O', 'ND') DEFAULT NULL COMMENT '性別: M-男, F-女, O-其他, ND-不透露',
  `password` VARCHAR(100) NOT NULL COMMENT '密碼',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  `last_login` DATETIME DEFAULT NULL COMMENT '最後登錄時間',
  `role` ENUM('A', 'M', 'U', 'G') NOT NULL DEFAULT 'U' COMMENT '用戶角色: A-管理員, M-商家, U-普通用戶, G-訪客',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用戶基本信息表';

-- 2. 用戶設置表
CREATE TABLE `user_settings` (
  `user_id` INT UNSIGNED NOT NULL COMMENT '關聯用戶ID',
  `lang` ENUM('zh-TW', 'en-US') NOT NULL DEFAULT 'zh-TW' COMMENT '語言偏好',
  `theme` ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system' COMMENT '主題偏好',
  `email_notify` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否接收郵件通知',
  `sms_notify` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否接收短信通知',
  `push_notify` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否接收推送通知',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用戶設置表';

-- 3. 商家信息表 (使用 CourseCategory 主分類)
CREATE TABLE `merchants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商家ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商家名稱',
  `email` VARCHAR(100) NOT NULL COMMENT '商家電子郵箱',
  `phone` VARCHAR(20) NOT NULL COMMENT '商家電話號碼',
  `address` VARCHAR(255) NOT NULL COMMENT '商家地址',
  `description` TEXT DEFAULT NULL COMMENT '商家描述',
  `biz_hours` VARCHAR(255) DEFAULT NULL COMMENT '營業時間',
  `category` ENUM('SPF', 'CUL', 'ART', 'PER', 'LIF', 'TEC', 'OUT') DEFAULT NULL COMMENT '業態類別: SPF-運動健身, CUL-烹飪美食, ART-藝術設計, PER-表演藝術, LIF-生活風格, TEC-科技數位, OUT-戶外冒險',
  `website` VARCHAR(255) DEFAULT NULL COMMENT '商家網站',
  `logo_url` VARCHAR(255) DEFAULT NULL COMMENT '商家logo URL',
  `cover_url` VARCHAR(255) DEFAULT NULL COMMENT '商家封面圖片URL',
  `rating` DECIMAL(2,1) DEFAULT NULL COMMENT '平均評分',
  `review_count` INT UNSIGNED DEFAULT 0 COMMENT '評論數量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家信息表';

-- 4. 講師信息表
CREATE TABLE `instructors` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '講師ID',
  `merchant_id` INT UNSIGNED NOT NULL COMMENT '關聯商家ID',
  `name` VARCHAR(100) NOT NULL COMMENT '講師姓名',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '講師頭像URL',
  `bio` TEXT DEFAULT NULL COMMENT '講師介紹',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_merchant_id` (`merchant_id`),
  CONSTRAINT `fk_instructors_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='講師信息表';

-- 5. 課程基本信息表
CREATE TABLE `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '課程ID',
  `merchant_id` INT UNSIGNED NOT NULL COMMENT '關聯商家ID',
  `title` VARCHAR(255) NOT NULL COMMENT '課程標題',
  `description` TEXT DEFAULT NULL COMMENT '課程描述',
  `status` ENUM('draft', 'active', 'inactive', 'scheduled') NOT NULL DEFAULT 'draft' COMMENT '課程狀態',
  `publish_date` DATETIME DEFAULT NULL COMMENT '上架時間',
  `points` INT UNSIGNED NOT NULL COMMENT '課程所需點數',
  `cover_url` VARCHAR(255) DEFAULT NULL COMMENT '課程封面圖片URL',
  `region` VARCHAR(50) DEFAULT NULL COMMENT '地區碼',
  `join_count` INT UNSIGNED DEFAULT 0 COMMENT '參與人數',
  `recommended` TINYINT(1) DEFAULT 0 COMMENT '是否推薦',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_region` (`region`),
  CONSTRAINT `fk_courses_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='課程基本信息表';

-- 6. 課程與分類關聯表 (使用 CourseCategory 的完整分類體系)
CREATE TABLE `course_categories` (
  `course_id` INT UNSIGNED NOT NULL COMMENT '課程ID',
  `category` VARCHAR(50) NOT NULL COMMENT '分類代碼 (支援主分類如SPF和子分類如SPF_YOG)',
  PRIMARY KEY (`course_id`, `category`),
  CONSTRAINT `fk_course_categories_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='課程與分類關聯表';

-- 7. 課程場次表
CREATE TABLE `course_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '場次ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '關聯課程ID',
  `date` DATE NOT NULL COMMENT '上課日期',
  `start` TIME NOT NULL COMMENT '開始時間',
  `end` TIME NOT NULL COMMENT '結束時間',
  `seats` INT UNSIGNED NOT NULL COMMENT '總席位數',
  `seats_left` INT UNSIGNED NOT NULL COMMENT '剩餘席位數',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_date` (`date`),
  CONSTRAINT `fk_course_sessions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='課程場次表';

-- 8. 預約信息表
CREATE TABLE `bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '預約ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用戶ID',
  `session_id` INT UNSIGNED DEFAULT NULL COMMENT '課程場次ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '課程ID',
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'noshow') NOT NULL DEFAULT 'pending' COMMENT '預約狀態',
  `points` INT UNSIGNED NOT NULL COMMENT '使用點數',
  `notes` TEXT DEFAULT NULL COMMENT '客戶備註',
  `merchant_notes` TEXT DEFAULT NULL COMMENT '商家備註',
  `rating` TINYINT UNSIGNED DEFAULT NULL COMMENT '評分',
  `comment` TEXT DEFAULT NULL COMMENT '評論',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_session` FOREIGN KEY (`session_id`) REFERENCES `course_sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='預約信息表';

-- 9. 預約歷史狀態記錄表
CREATE TABLE `booking_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `booking_id` INT UNSIGNED NOT NULL COMMENT '預約ID',
  `status` VARCHAR(50) NOT NULL COMMENT '狀態描述',
  `note` TEXT DEFAULT NULL COMMENT '備註',
  `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '記錄時間',
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  CONSTRAINT `fk_booking_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='預約歷史狀態記錄表';

-- 10. 訂單主表
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '訂單ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用戶ID',
  `sn` VARCHAR(50) NOT NULL COMMENT '訂單編號',
  `total` DECIMAL(10,2) NOT NULL COMMENT '訂單總金額',
  `status` ENUM('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING' COMMENT '訂單狀態',
  `pay_method` ENUM('CREDIT_CARD', 'LINE_PAY', 'APPLE_PAY', 'BANK_TRANSFER', 'GOOGLE_PAY', 'CASH', 'MOBILE_PAYMENT') NOT NULL COMMENT '支付方式',
  `txn_id` VARCHAR(100) DEFAULT NULL COMMENT '第三方支付交易ID',
  `invoice_no` VARCHAR(20) DEFAULT NULL COMMENT '發票號碼',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sn` (`sn`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='訂單主表';

-- 11. 訂單詳細項目表
CREATE TABLE `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '項目ID',
  `order_id` INT UNSIGNED NOT NULL COMMENT '訂單ID',
  `name` VARCHAR(255) NOT NULL COMMENT '項目名稱',
  `qty` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '數量',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT '單價',
  `course_id` INT UNSIGNED DEFAULT NULL COMMENT '關聯課程ID',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_course_id` (`course_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='訂單詳細項目表';

-- 12. 點數套餐表
CREATE TABLE `points_cards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '套餐ID',
  `type` VARCHAR(20) NOT NULL COMMENT '卡種類型',
  `points` INT UNSIGNED NOT NULL COMMENT '包含點數',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售價',
  `description` TEXT NOT NULL COMMENT '套餐說明',
  `discount` VARCHAR(50) DEFAULT NULL COMMENT '折扣信息',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='點數套餐表';

-- 13. 點數交易流水表
CREATE TABLE `point_transactions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '交易ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用戶ID',
  `kind` ENUM('deposit', 'consume', 'reward', 'expire') NOT NULL COMMENT '交易類型',
  `amount` INT NOT NULL COMMENT '交易點數(正負值)',
  `balance` INT UNSIGNED NOT NULL COMMENT '結餘點數',
  `ref_type` ENUM('order', 'booking', 'refund', 'activity') DEFAULT NULL COMMENT '關聯類型',
  `ref_id` INT UNSIGNED DEFAULT NULL COMMENT '關聯ID',
  `note` VARCHAR(255) DEFAULT NULL COMMENT '交易備註',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `expire_at` DATETIME DEFAULT NULL COMMENT '過期時間',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_kind` (`kind`),
  KEY `idx_ref_type_ref_id` (`ref_type`, `ref_id`),
  CONSTRAINT `fk_point_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='點數交易流水表';

-- 14. 商家統計數據表
CREATE TABLE `merchant_stats` (
  `merchant_id` INT UNSIGNED NOT NULL COMMENT '商家ID',
  `total_bookings` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '總預約數',
  `total_revenue` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '總營收',
  `total_customers` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '總顧客數',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  PRIMARY KEY (`merchant_id`),
  CONSTRAINT `fk_merchant_stats_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家統計數據表';

-- 15. 課程圖片表 (對應 PhotoItem 接口)
CREATE TABLE `course_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '圖片ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '課程ID',
  `image_src` VARCHAR(255) NOT NULL COMMENT '圖片URL',
  `thumbnail` VARCHAR(255) DEFAULT NULL COMMENT '縮略圖URL',
  `alt` VARCHAR(100) DEFAULT NULL COMMENT '替代文本',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  CONSTRAINT `fk_course_images_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='課程圖片表';

-- 16. 收藏表
CREATE TABLE `favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用戶ID',
  `course_id` INT UNSIGNED NOT NULL COMMENT '課程ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 課程分類說明
-- 主分類 (MainCategory):
-- SPF - 運動健身 (SportsFitness)
-- CUL - 烹飪美食 (CookingCuisine)  
-- ART - 藝術設計 (ArtDesign)
-- PER - 表演藝術 (PerformingArts)
-- LIF - 生活風格 (Lifestyle)
-- TEC - 科技數位 (TechDigital)
-- OUT - 戶外冒險 (OutdoorAdventure)

-- 子分類範例 (SubCategory):
-- SPF_YOG - 瑜伽
-- SPF_GYM - 健身房
-- SPF_RUN - 跑步
-- CUL_CHI - 中式料理
-- CUL_WES - 西式料理
-- ART_PAI - 繪畫
-- ART_PHO - 攝影
-- 等等... 