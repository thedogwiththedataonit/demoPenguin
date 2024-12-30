# demoPenguin

# Build the package
npm run build

# publish the changes using yalc
yalc publish

sudo rm -rf .yalc
sudo rm -rf dist 
sudo rm -rf node_modules
sudo rm -rf package-lock.json
sudo npm install

sudo yalc publish --force


## After making changes to the code
sudo npm run build
sudo yalc push --changed
