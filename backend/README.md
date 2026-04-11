# EasyDraw Backend

## 启动后端服务

### 方法一：使用内置Maven

1. 确保 `apache-maven-3.9.9` 目录存在于项目根目录
2. 运行项目根目录下的 `start-backend.sh` 脚本

```bash
# 在项目根目录执行
./start-backend.sh
```

### 方法二：使用系统Maven

如果系统已安装Maven，可以直接在后端目录执行：

```bash
# 在backend目录执行
mvn spring-boot:run
```

## 项目结构

- `src/main/java/com/easydraw/` - 主要代码目录
  - `config/` - 配置类
  - `controller/` - 控制器
  - `dto/` - 数据传输对象
  - `entity/` - 实体类
  - `filter/` - 过滤器
  - `repository/` - 数据访问层
  - `service/` - 业务逻辑层
  - `EasyDrawApplication.java` - 应用入口

- `src/main/resources/` - 资源文件
  - `application.yml` - 应用配置
  - `schema.sql` - 数据库初始化脚本

- `src/test/` - 测试代码

## 技术栈

- Java 21
- Spring Boot 3.2.0
- Spring Security
- JWT
- PostgreSQL
- WebSocket

## API接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 画板相关
- `GET /api/boards` - 获取画板列表
- `POST /api/boards` - 创建新画板
- `GET /api/boards/{id}` - 获取画板详情
- `PUT /api/boards/{id}` - 更新画板信息
- `DELETE /api/boards/{id}` - 删除画板

### 元素相关
- `POST /api/elements` - 创建元素
- `PUT /api/elements` - 更新元素
- `DELETE /api/elements` - 删除元素

### 历史记录相关
- `POST /api/history` - 记录操作历史
- `POST /api/history/undo` - 撤销操作
- `POST /api/history/redo` - 重做操作

## 数据库配置

默认配置：
- 数据库：PostgreSQL
- 端口：5432
- 用户名：postgres
- 密码：psql24678
- 数据库名：easydraw

可以在 `application.yml` 文件中修改配置。
