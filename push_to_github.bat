@echo off
echo Resetting Git and Pushing to new repo...
rmdir /s /q .git
git init
git remote add origin https://github.com/V-atharvan/Odyssey.git
git add .
git commit -m "initial commit: production ready"
git branch -M main
echo Pushing to GitHub...
git push -u origin main --force
echo Done!
pause
