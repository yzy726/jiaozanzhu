@echo off
cd /d "C:\mini-program"  :: 切换到项目目录
pm2 start app.js --name "mini-program"  :: 启动应用
pm2 save  :: 保存当前进程列表