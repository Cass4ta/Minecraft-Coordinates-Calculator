
# Build the project
npm run build

# Navigate into the build output directory
cd dist

# Initialize a new git repo for deployment
git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'

# Deploy to https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/Cass4ta/Minecraft-Coordinates-Calculator.git gh-pages

cd -
