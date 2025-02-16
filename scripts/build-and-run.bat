@echo off
set IMAGE_NAME=verbise-app
set CONTAINER_NAME=verbise-container
set PORT=8080

docker rm -f %CONTAINER_NAME% 2>nul
docker rmi %IMAGE_NAME% 2>nul
docker build -t %IMAGE_NAME% .
docker run -d -p %PORT%:80 --name %CONTAINER_NAME% %IMAGE_NAME%
echo 部署完成! 访问地址: http://localhost:%PORT%