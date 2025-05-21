# 日期格式化函数迁移指南

## 概述

为了统一项目中的日期处理逻辑并提高代码可维护性，我们创建了一套统一的日期格式化工具函数。这些函数已集中定义在 `src/utils/date.ts` 文件中，请所有开发人员使用这些函数替代自定义的日期格式化逻辑。

## 可用函数

### 基础格式化

- `formatDate(date: Date | string): string`  
  格式化为 YYYY/MM/DD 格式

- `formatTime(date: Date | string): string`  
  格式化为 HH:MM 格式

- `formatDateTime(date: Date | string): string`  
  格式化为 YYYY/MM/DD HH:MM 格式

- `formatDateString(dateString: string): string`  
  使用本地化方式 (zh-TW) 格式化日期字符串

- `formatDateKey(date: Date): string`  
  格式化为 YYYY-MM-DD 格式（主要用于日期键值）

### 高级格式化

- `formatCustom(date: Date | string, format: string): string`  
  使用自定义格式化模板
  
  支持以下占位符：
  - YYYY: 年份（4位）
  - MM: 月份（2位，补0）
  - M: 月份（不补0）
  - DD: 日期（2位，补0）
  - D: 日期（不补0）
  - HH: 小时（24小时制，2位，补0）
  - H: 小时（24小时制，不补0）
  - mm: 分钟（2位，补0）
  - m: 分钟（不补0）
  - ss: 秒（2位，补0）
  - s: 秒（不补0）

- `formatRelativeTime(date: Date | string): string`  
  格式化为相对时间（例如：刚刚、10分钟前、1小时前等）

### 日期比较与处理

- `isSameDate(d1: Date, d2: Date): boolean`  
  判断两个日期是否为同一天

- `isWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean`  
  判断日期是否在指定时间范围内

- `inRange<T>(start: Date, end: Date, data: T[], getDate?: (item: T) => Date): T[]`  
  过滤出在指定日期范围内的数据项

- `byDate<T>(data: T[], getDate?: (item: T) => Date): Record<string, T[]>`  
  按日期对数据进行分组

## 迁移步骤

1. 查找组件中的自定义日期格式化函数
2. 导入需要的统一日期工具函数：
   ```typescript
   import { formatDate, formatTime, formatDateTime } from '@/utils/date';
   ```
3. 删除旧的日期格式化函数，使用导入的函数替代
4. 如果需要特殊格式化，请使用 `formatCustom` 函数

## 示例组件

可以参考 `src/components/examples/DateFormattingExample.vue` 组件，了解如何使用统一的日期处理函数。

## 注意事项

- 如果发现现有的日期工具函数不能满足您的需求，请与团队讨论后再进行扩展
- 所有新增的日期处理函数都应该添加到 `src/utils/date.ts` 文件中，并添加适当的文档注释
- 同样适用于新增功能或组件，请使用统一的日期处理函数，而不是创建新的自定义函数 