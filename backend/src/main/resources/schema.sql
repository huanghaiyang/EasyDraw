-- 创建数据库
CREATE DATABASE easydraw;

-- 连接到easydraw数据库
\c -h localhost -p 5455 -U postgres easydraw;

-- 创建boards表
CREATE TABLE boards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建elements表
CREATE TABLE elements (
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
CREATE TABLE element_history (
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
CREATE TABLE board_sessions (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES boards(id),
    user_id UUID NOT NULL,
    connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 创建索引
CREATE INDEX idx_elements_board_id ON elements(board_id);
CREATE INDEX idx_element_history_board_id ON element_history(board_id);
CREATE INDEX idx_element_history_element_id ON element_history(element_id);
CREATE INDEX idx_element_history_operation_at ON element_history(operation_at);
CREATE INDEX idx_board_sessions_board_id ON board_sessions(board_id);
CREATE INDEX idx_board_sessions_user_id ON board_sessions(user_id);
