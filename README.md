# PUDT 课程平台 后端API

PUDT课程平台是一个瑜伽课程预订系统的后端API，提供用户管理、课程管理、预订管理、点数管理等功能。

## 技术栈

- Java 17
- Spring Boot 3.2.3
- MyBatis 3.0.3
- MySQL 8.0
- JWT认证
- Swagger文档 (SpringDoc)

## 功能特性

- 用户管理: 登录、注册、个人资料管理
- 课程管理: 课程列表、课程详情、课程时间管理
- 预订管理: 课程预订、取消预订、预订历史
- 点数管理: 点数充值、点数消费、点数历史
- 商家管理: 商家资料、商家课程管理
- 收藏管理: 收藏课程、取消收藏

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.0+

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/your-username/pudt-api.git
cd pudt-api
```

2. 配置数据库

修改 `src/main/resources/application.yml` 文件中的数据库配置:

```yaml
spring:
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/pudt?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
      username: your-username
      password: your-password
```

3. 编译运行

```bash
mvn clean package
java -jar target/pudt-api.jar
```

4. 访问API文档

打开浏览器访问: http://localhost:8080/api/swagger-ui.html

## API文档

项目集成了Swagger文档，启动后访问 `/api/swagger-ui.html` 查看API详细文档。

## 项目结构

```
src/main/java/com/pudt/api/
├── config          - 配置类
├── controller      - 控制器
├── dto             - 数据传输对象
├── mapper          - MyBatis映射器
├── model           - 数据模型
│   └── constants   - 常量定义
├── service         - 服务接口
│   └── impl        - 服务实现
└── util            - 工具类

src/main/resources/
├── mapper          - MyBatis XML映射文件
├── application.yml - 应用配置
└── banner.txt      - 自定义启动Banner
```

## 许可证

MIT
