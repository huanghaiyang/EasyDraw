-- EasyDraw 数据库初始化脚本
-- 生成时间: 2026-04-03 15:11:08

-- 创建boards表
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建categories表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

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

-- 插入初始分类数据
-- 只插入必要的列，让数据库使用默认值填充其他列
INSERT INTO categories (id, name, description, sort_order) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', '互联网', '互联网相关设计', 1),
    ('550e8400-e29b-41d4-a716-446655440011', '金融', '金融行业设计', 2),
    ('550e8400-e29b-41d4-a716-446655440012', '教育', '教育行业设计', 3),
    ('550e8400-e29b-41d4-a716-446655440013', '医疗', '医疗行业设计', 4),
    ('550e8400-e29b-41d4-a716-446655440014', '电商', '电子商务设计', 5),
    ('550e8400-e29b-41d4-a716-446655440015', '社交', '社交应用设计', 6),
    ('550e8400-e29b-41d4-a716-446655440016', '娱乐', '娱乐应用设计', 7),
    ('550e8400-e29b-41d4-a716-446655440017', '工具', '工具类应用设计', 8),
    ('550e8400-e29b-41d4-a716-446655440018', '其他', '其他行业设计', 9)
ON CONFLICT DO NOTHING;
