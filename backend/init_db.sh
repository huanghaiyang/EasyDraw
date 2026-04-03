#!/bin/bash
# EasyDraw 数据库初始化脚本
# 生成时间: 2026-04-03 15:11:08

# 数据库配置
DB_HOST="localhost"
DB_PORT="5455"
DB_NAME="easydraw"
DB_USER="postgres"
DB_PASSWORD="${DB_PASSWORD:-psql24678}"

# 检查PostgreSQL是否运行
if ! command -v psql &> /dev/null; then
    echo "错误: psql命令未找到，请先安装PostgreSQL客户端"
    exit 1
fi

# 检查数据库是否存在
echo "检查数据库是否存在..."
DB_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | grep -c $DB_NAME || true)

if [ "$DB_EXISTS" -eq "0" ]; then
    echo "创建数据库: $DB_NAME"
    PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
else
    echo "数据库已存在: $DB_NAME"
fi

# 执行初始化脚本
echo "执行数据库初始化脚本..."
PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
-- EasyDraw 数据库初始化脚本
-- 生成时间: 2026-04-03 15:11:08

-- 创建boards表
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建elements表
CREATE TABLE IF NOT EXISTS elements (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES boards(id),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建element_history表
CREATE TABLE IF NOT EXISTS element_history (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES boards(id),
    element_id UUID REFERENCES elements(id),
    operation_type VARCHAR(20) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    operation_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id UUID NOT NULL
);

-- 创建board_sessions表
CREATE TABLE IF NOT EXISTS board_sessions (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES boards(id),
    user_id UUID NOT NULL,
    connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_elements_board_id ON elements(board_id);
CREATE INDEX IF NOT EXISTS idx_element_history_board_id ON element_history(board_id);
CREATE INDEX IF NOT EXISTS idx_element_history_element_id ON element_history(element_id);
CREATE INDEX IF NOT EXISTS idx_element_history_operation_at ON element_history(operation_at);
CREATE INDEX IF NOT EXISTS idx_board_sessions_board_id ON board_sessions(board_id);
CREATE INDEX IF NOT EXISTS idx_board_sessions_user_id ON board_sessions(user_id);

-- 插入示例数据
INSERT INTO boards (id, name, creator_id) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', '示例画布1', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440002', '示例画布2', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

EOF

if [ $? -eq 0 ]; then
    echo "数据库初始化成功！"
else
    echo "数据库初始化失败！"
    exit 1
fi

echo "数据库初始化完成！"
