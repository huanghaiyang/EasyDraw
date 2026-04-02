# EasyDraw Backend

## 项目简介

EasyDraw Backend 是 EasyDraw 前端应用的后端服务，提供画板管理、组件操作、实时同步、撤销回退和画板恢复等功能。

## 技术栈

- **语言**: Java 17
- **框架**: Spring Boot 3.2
- **数据库**: PostgreSQL 15
- **WebSocket**: Spring WebSocket
- **缓存**: Redis
- **认证**: JWT

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── easydraw/
│   │   │           ├── controller/
│   │   │           │   ├── BoardController.java
│   │   │           │   ├── ElementController.java
│   │   │           │   ├── HistoryController.java
│   │   │           │   └── WebSocketController.java
│   │   │           ├── dto/
│   │   │           │   ├── BoardDto.java
│   │   │           │   ├── ElementDto.java
│   │   │           │   ├── HistoryDto.java
│   │   │           │   └── WebSocketMessage.java
│   │   │           ├── entity/
│   │   │           │   ├── Board.java
│   │   │           │   ├── Element.java
│   │   │           │   ├── ElementHistory.java
│   │   │           │   └── BoardSession.java
│   │   │           ├── repository/
│   │   │           │   ├── BoardRepository.java
│   │   │           │   ├── ElementRepository.java
│   │   │           │   ├── ElementHistoryRepository.java
│   │   │           │   └── BoardSessionRepository.java
│   │   │           ├── service/
│   │   │           │   ├── BoardService.java
│   │   │           │   ├── ElementService.java
│   │   │           │   ├── HistoryService.java
│   │   │           │   └── WebSocketService.java
│   │   │           ├── config/
│   │   │           │   ├── WebSocketConfig.java
│   │   │           │   └── SecurityConfig.java
│   │   │           └── EasyDrawApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── schema.sql
│   └── test/
│       └── java/
│           └── com/
│               └── easydraw/
│                   └── service/
│                       ├── BoardServiceTest.java
│                       ├── ElementServiceTest.java
│                       └── HistoryServiceTest.java
├── pom.xml
└── README.md
```

## 核心功能

1. **画板管理**：创建、获取、更新、删除画板
2. **组件操作**：添加、更新、删除组件
3. **实时同步**：通过WebSocket实现画板操作的实时同步
4. **撤销回退**：记录操作历史，支持撤销和重做操作
5. **画板恢复**：自动保存画板状态，支持恢复到之前的任意状态

## API接口

### 画板相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards` | `POST` | 创建画板 | `{"name": "画板名称"}` | `{"id": "画板ID", "name": "画板名称", "createdAt": "创建时间"}` |
| `/api/boards` | `GET` | 获取画板列表 | N/A | `[{"id": "画板ID", "name": "画板名称", "createdAt": "创建时间"}]` |
| `/api/boards/{id}` | `GET` | 获取画板详情 | N/A | `{"id": "画板ID", "name": "画板名称", "elements": [{"id": "组件ID", "type": "组件类型", "name": "组件名称", "data": {...}}]}` |
| `/api/boards/{id}` | `PUT` | 更新画板信息 | `{"name": "新画板名称"}` | `{"id": "画板ID", "name": "新画板名称", "updatedAt": "更新时间"}` |
| `/api/boards/{id}` | `DELETE` | 删除画板 | N/A | `{"status": "success"}` |

### 组件相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards/{boardId}/elements` | `POST` | 添加组件 | `{"type": "组件类型", "name": "组件名称", "data": {...}}` | `{"id": "组件ID", "type": "组件类型", "name": "组件名称", "data": {...}}` |
| `/api/boards/{boardId}/elements/{elementId}` | `PUT` | 更新组件 | `{"name": "新组件名称", "data": {...}}` | `{"id": "组件ID", "name": "新组件名称", "data": {...}}` |
| `/api/boards/{boardId}/elements/{elementId}` | `DELETE` | 删除组件 | N/A | `{"status": "success"}` |

### 历史记录相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards/{boardId}/history/undo` | `POST` | 撤销操作 | N/A | `{"status": "success", "elements": [{"id": "组件ID", "data": {...}}]}` |
| `/api/boards/{boardId}/history/redo` | `POST` | 重做操作 | N/A | `{"status": "success", "elements": [{"id": "组件ID", "data": {...}}]}` |

### WebSocket端点

| 端点 | 功能 | 消息格式 |
| :--- | :--- | :--- |
| `/ws/boards/{boardId}` | 画板实时通信 | `{"type": "操作类型", "data": {...}}` |

## 数据库设计

### 表结构

- **boards**：画板表，存储画板基本信息
- **elements**：组件表，存储画板上的组件信息
- **element_history**：操作历史表，记录组件操作的历史记录
- **board_sessions**：会话表，记录用户与画板的连接会话

## 环境要求

- JDK 17+
- PostgreSQL 15+
- Redis 7+
- Maven 3.8+

## 部署步骤

1. **数据库初始化**：执行`schema.sql`创建数据库表结构
2. **配置修改**：修改`application.yml`中的数据库连接信息
3. **编译打包**：使用Maven编译项目，生成jar包
4. **启动服务**：运行`java -jar backend-1.0.0.jar`启动服务

## 开发指南

1. **克隆项目**：`git clone <项目地址>`
2. **安装依赖**：`mvn install`
3. **运行项目**：`mvn spring-boot:run`
4. **测试**：`mvn test`

## 注意事项

1. 本项目使用PostgreSQL数据库，请确保数据库服务已启动
2. 本项目使用Redis缓存，请确保Redis服务已启动
3. 本项目使用WebSocket进行实时通信，请确保WebSocket连接正常
4. 本项目简化了用户认证，实际生产环境中应使用完整的认证机制

## 许可证

MIT
