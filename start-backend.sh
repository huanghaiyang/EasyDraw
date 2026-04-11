#!/bin/bash

# 项目根目录
PROJECT_ROOT=$(pwd)

# Maven目录
MAVEN_DIR="$PROJECT_ROOT/apache-maven-3.9.9"
MAVEN_BIN="$MAVEN_DIR/bin/mvn"

# 后端目录
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查Maven是否存在
if [ -f "$MAVEN_BIN" ]; then
    echo "使用内置Maven: $MAVEN_BIN"
    # 切换到后端目录并启动服务
    cd "$BACKEND_DIR" && "$MAVEN_BIN" spring-boot:run
else
    echo "错误: 内置Maven不存在于 $MAVEN_DIR"
    echo "请确保Maven已下载并解压到项目根目录"
    exit 1
fi
