# deploy-prod.ps1 安全清理版本
param([int]$port=80)

$ErrorActionPreference = "Stop"

# 检查并清理旧容器
$containerExists = docker ps -a --filter "name=verbise-prod" -q
if ($null -ne $containerExists) {
    docker rm -f verbise-prod
}

# 检查并清理旧镜像
$imageExists = docker images -q verbise-prod
if ($null -ne $imageExists) {
    docker rmi verbise-prod
}

# 构建并运行新容器
docker build -t verbise-prod .
docker run -d `
    -p ${port}:80 `
    --name verbise-prod `
    --restart unless-stopped `
    verbise-prod

Write-Host "`n[安全部署完成] 访问地址: http://localhost:$port`n"