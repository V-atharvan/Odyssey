@echo off
echo Pushing production frontend config...
git add frontend/.env
git add .
git commit -m "fix: update frontend env for production"
git push origin main
echo Done! Go to Vercel and hit Redeploy.
pause
