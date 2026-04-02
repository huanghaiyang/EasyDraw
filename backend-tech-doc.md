# 后端技术方案

## 1. 技术栈

- **语言**: Java 17 (目前开发人员最常用的版本)
- **框架**: Spring Boot 3.2
- **数据库**: PostgreSQL 15
- **WebSocket**: Spring WebSocket
- **缓存**: Redis (用于会话管理和临时数据存储)
- **认证**: JWT

## 2. 数据库设计

### 2.1 表结构

#### `boards` 表
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | 画板ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | 画板名称 |
| `creator_id` | `UUID` | `NOT NULL` | 创建者ID |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 更新时间 |
| `is_deleted` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | 是否删除 |

#### `elements` 表
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | 组件ID |
| `board_id` | `UUID` | `NOT NULL REFERENCES boards(id)` | 所属画板ID |
| `type` | `VARCHAR(50)` | `NOT NULL` | 组件类型 (rectangle, text, image, line, etc.) |
| `name` | `VARCHAR(255)` | `NOT NULL` | 组件名称 |
| `data` | `JSONB` | `NOT NULL` | 组件数据 (位置、大小、样式等) |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 更新时间 |
| `is_deleted` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | 是否删除 |

#### `element_history` 表
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | 历史记录ID |
| `board_id` | `UUID` | `NOT NULL REFERENCES boards(id)` | 所属画板ID |
| `element_id` | `UUID` | `REFERENCES elements(id)` | 组件ID |
| `operation_type` | `VARCHAR(20)` | `NOT NULL` | 操作类型 (create, update, delete) |
| `before_data` | `JSONB` | | 操作前数据 |
| `after_data` | `JSONB` | | 操作后数据 |
| `operation_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 操作时间 |
| `session_id` | `UUID` | `NOT NULL` | 操作会话ID |

#### `board_sessions` 表
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | 会话ID |
| `board_id` | `UUID` | `NOT NULL REFERENCES boards(id)` | 画板ID |
| `user_id` | `UUID` | `NOT NULL` | 用户ID |
| `connected_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 连接时间 |
| `last_activity_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 最后活动时间 |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | 是否活跃 |

## 3. 后端API设计

### 3.1 画板相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards` | `POST` | 创建画板 | `{"name": "画板名称"}` | `{"id": "画板ID", "name": "画板名称", "createdAt": "创建时间"}` |
| `/api/boards` | `GET` | 获取画板列表 | N/A | `[{"id": "画板ID", "name": "画板名称", "createdAt": "创建时间"}]` |
| `/api/boards/{id}` | `GET` | 获取画板详情 | N/A | `{"id": "画板ID", "name": "画板名称", "elements": [{"id": "组件ID", "type": "组件类型", "name": "组件名称", "data": {...}}]}` |
| `/api/boards/{id}` | `PUT` | 更新画板信息 | `{"name": "新画板名称"}` | `{"id": "画板ID", "name": "新画板名称", "updatedAt": "更新时间"}` |
| `/api/boards/{id}` | `DELETE` | 删除画板 | N/A | `{"status": "success"}` |

### 3.2 组件相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards/{boardId}/elements` | `POST` | 添加组件 | `{"type": "组件类型", "name": "组件名称", "data": {...}}` | `{"id": "组件ID", "type": "组件类型", "name": "组件名称", "data": {...}}` |
| `/api/boards/{boardId}/elements/{elementId}` | `PUT` | 更新组件 | `{"name": "新组件名称", "data": {...}}` | `{"id": "组件ID", "name": "新组件名称", "data": {...}}` |
| `/api/boards/{boardId}/elements/{elementId}` | `DELETE` | 删除组件 | N/A | `{"status": "success"}` |

### 3.3 历史记录相关

| API路径 | 方法 | 功能 | 请求体 (JSON) | 响应体 (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/boards/{boardId}/history` | `GET` | 获取历史记录 | N/A | `[{"id": "历史记录ID", "operationType": "操作类型", "operationAt": "操作时间"}]` |
| `/api/boards/{boardId}/history/undo` | `POST` | 撤销操作 | N/A | `{"status": "success", "elements": [{"id": "组件ID", "data": {...}}]}` |
| `/api/boards/{boardId}/history/redo` | `POST` | 重做操作 | N/A | `{"status": "success", "elements": [{"id": "组件ID", "data": {...}}]}` |

### 3.4 WebSocket端点

| 端点 | 功能 | 消息格式 |
| :--- | :--- | :--- |
| `/ws/boards/{boardId}` | 画板实时通信 | `{"type": "操作类型", "data": {...}}` |

## 4. 核心功能实现

### 4.1 实时同步

1. **前端**：当用户在画板上进行操作时，前端捕获操作事件，将操作数据通过WebSocket发送到后端。
2. **后端**：后端接收WebSocket消息，解析操作类型和数据，更新数据库，并将操作广播给画板的其他在线用户。
3. **前端**：其他用户接收到WebSocket消息，更新本地画板状态。

### 4.2 撤销回退

1. **操作记录**：每次组件操作（创建、更新、删除）都在`element_history`表中记录操作前后的数据。
2. **撤销操作**：当用户点击撤销按钮时，后端从`element_history`表中获取最近的操作记录，根据操作类型执行相应的撤销操作（如删除的组件恢复，更新的组件恢复到之前的状态）。
3. **重做操作**：当用户点击重做按钮时，后端从`element_history`表中获取最近的撤销操作记录，执行相应的重做操作。

### 4.3 画板恢复

1. **自动保存**：每次组件操作后，后端自动保存画板状态到数据库。
2. **画板加载**：当用户打开画板时，后端从数据库中获取画板的最新状态，包括所有组件的当前数据。
3. **历史恢复**：用户可以通过历史记录恢复到之前的任意状态。

### 4.4 会话管理

1. **WebSocket连接**：用户打开画板时，建立WebSocket连接，创建会话记录。
2. **心跳检测**：定期发送心跳消息，检测连接状态。
3. **会话清理**：当WebSocket连接断开时，标记会话为非活跃状态，定期清理过期会话。

## 5. 项目结构

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

## 6. 关键代码实现

### 6.1 WebSocket消息处理

```java
@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ElementService elementService;
    private final HistoryService historyService;

    @Autowired
    public WebSocketController(SimpMessagingTemplate messagingTemplate, ElementService elementService, HistoryService historyService) {
        this.messagingTemplate = messagingTemplate;
        this.elementService = elementService;
        this.historyService = historyService;
    }

    @MessageMapping("/boards/{boardId}")
    public void handleMessage(@DestinationVariable String boardId, WebSocketMessage message) {
        // 处理消息，更新数据库
        String operationType = message.getType();
        switch (operationType) {
            case "create":
                elementService.createElement(boardId, message.getData());
                break;
            case "update":
                elementService.updateElement(boardId, message.getData());
                break;
            case "delete":
                elementService.deleteElement(boardId, message.getData());
                break;
        }

        // 记录操作历史
        historyService.recordHistory(boardId, operationType, message.getData());

        // 广播消息给其他用户
        messagingTemplate.convertAndSend("/topic/boards/" + boardId, message);
    }
}
```

### 6.2 撤销回退功能

```java
@Service
public class HistoryService {

    private final ElementHistoryRepository historyRepository;
    private final ElementService elementService;

    @Autowired
    public HistoryService(ElementHistoryRepository historyRepository, ElementService elementService) {
        this.historyRepository = historyRepository;
        this.elementService = elementService;
    }

    public void recordHistory(String boardId, String operationType, Map<String, Object> data) {
        ElementHistory history = new ElementHistory();
        history.setBoardId(UUID.fromString(boardId));
        history.setElementId(UUID.fromString((String) data.get("id")));
        history.setOperationType(operationType);
        history.setBeforeData(data.get("beforeData"));
        history.setAfterData(data.get("afterData"));
        history.setSessionId(UUID.randomUUID());
        historyRepository.save(history);
    }

    public List<ElementDto> undo(String boardId) {
        // 获取最近的操作记录
        ElementHistory history = historyRepository.findTopByBoardIdOrderByOperationAtDesc(UUID.fromString(boardId));
        if (history == null) {
            return Collections.emptyList();
        }

        // 根据操作类型执行撤销
        List<ElementDto> updatedElements = new ArrayList<>();
        switch (history.getOperationType()) {
            case "create":
                // 删除创建的组件
                elementService.deleteElement(boardId, history.getElementId().toString());
                break;
            case "update":
                // 恢复到之前的状态
                ElementDto element = elementService.updateElement(boardId, history.getBeforeData());
                updatedElements.add(element);
                break;
            case "delete":
                // 恢复删除的组件
                ElementDto restoredElement = elementService.createElement(boardId, history.getBeforeData());
                updatedElements.add(restoredElement);
                break;
        }

        return updatedElements;
    }

    public List<ElementDto> redo(String boardId) {
        // 获取最近的撤销操作记录
        // 执行重做操作
        // 省略实现...
        return Collections.emptyList();
    }
}
```

### 6.3 画板恢复功能

```java
@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ElementRepository elementRepository;

    @Autowired
    public BoardService(BoardRepository boardRepository, ElementRepository elementRepository) {
        this.boardRepository = boardRepository;
        this.elementRepository = elementRepository;
    }

    public BoardDto getBoard(String boardId) {
        Board board = boardRepository.findById(UUID.fromString(boardId))
                .orElseThrow(() -> new RuntimeException("Board not found"));

        List<Element> elements = elementRepository.findByBoardIdAndIsDeletedFalse(UUID.fromString(boardId));
        List<ElementDto> elementDtos = elements.stream()
                .map(element -> new ElementDto(
                        element.getId().toString(),
                        element.getType(),
                        element.getName(),
                        element.getData()
                ))
                .collect(Collectors.toList());

        return new BoardDto(
                board.getId().toString(),
                board.getName(),
                board.getCreatedAt(),
                board.getUpdatedAt(),
                elementDtos
        );
    }
}
```

## 7. 部署方案

### 7.1 环境要求

- JDK 17+
- PostgreSQL 15+
- Redis 7+
- Maven 3.8+

### 7.2 部署步骤

1. **数据库初始化**：执行`schema.sql`创建数据库表结构。
2. **编译打包**：使用Maven编译项目，生成jar包。
3. **部署服务**：将jar包部署到服务器，启动Spring Boot应用。
4. **配置Nginx**：配置Nginx反向代理，将WebSocket和HTTP请求转发到后端服务。

### 7.3 性能优化

- **数据库索引**：为`boards`、`elements`和`element_history`表添加适当的索引，提高查询性能。
- **缓存**：使用Redis缓存热点数据，如画板信息和组件数据。
- **连接池**：配置数据库连接池，提高数据库访问性能。
- **异步处理**：使用异步线程处理WebSocket消息，提高并发处理能力。

## 8. 安全性考虑

- **认证授权**：使用JWT进行用户认证，确保只有授权用户能够访问画板。
- **输入验证**：对所有API输入进行验证，防止恶意输入。
- **SQL注入防护**：使用Spring Data JPA的参数化查询，防止SQL注入。
- **XSS防护**：对用户输入的HTML内容进行过滤，防止XSS攻击。
- **CSRF防护**：实现CSRF token验证，防止CSRF攻击。
- **数据加密**：对敏感数据进行加密存储。

## 9. 测试计划

### 9.1 单元测试

- 测试各个服务的核心功能，如画板CRUD、组件操作、历史记录管理等。

### 9.2 集成测试

- 测试API与数据库的交互，确保数据一致性。
- 测试WebSocket通信，确保实时同步功能正常。

### 9.3 性能测试

- 测试系统在高并发下的性能表现，如同时有多个用户操作同一个画板。
- 测试大数据量下的性能表现，如画板上有大量组件时的操作响应时间。

## 10. 结论

本技术方案设计了一个完整的后端系统，支持前端画板的实时同步、撤销回退和恢复功能。使用Java 17和Spring Boot 3.2作为技术栈，PostgreSQL作为数据库，实现了高性能、可靠的后端服务。系统采用分层架构，代码结构清晰，易于维护和扩展。