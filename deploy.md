# 🚀 GitHub Pages Deployment Guide

This guide will walk you through deploying your ROK City Viewer to GitHub Pages for free hosting.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- All project files ready

## 🔧 Step-by-Step Setup

### 1. Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (green button)
3. **Repository name**: `rok-city-viewer`
4. **Description**: `Interactive Rise of Kingdoms city viewer`
5. **Visibility**: Choose Public (required for free Pages)
6. **Initialize**: Don't add README (we already have one)
7. **Click "Create repository"**

### 2. Upload Your Files

#### Option A: Drag & Drop (Easiest)
1. **Drag your entire project folder** to the GitHub upload area
2. **Commit message**: `Initial commit - ROK City Viewer`
3. **Click "Commit changes"**

#### Option B: Git Commands (Recommended)
```bash
# Navigate to your project folder
cd path/to/rok-city-viewer

# Initialize git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - ROK City Viewer"

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/rok-city-viewer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. **Go to repository Settings** (tab)
2. **Click "Pages"** in left sidebar
3. **Source**: Select "Deploy from a branch"
4. **Branch**: Choose `main` (or `master`)
5. **Folder**: Leave as `/ (root)`
6. **Click "Save"**

### 4. Wait for Deployment

- **Status**: You'll see "Your site is being built"
- **Time**: Usually 2-5 minutes
- **URL**: Will be shown once complete

## 🌐 Your Live Site

Once deployed, your site will be available at:
```
https://YOUR_USERNAME.github.io/rok-city-viewer
```

## 📁 Required Files

Make sure these files are in your repository:

```
rok-city-viewer/
├── index.html          ✅ Required
├── styles.css          ✅ Required  
├── script.js           ✅ Required
├── map1_upscaled.png  ✅ Required
├── indexed_cities.csv  ✅ Required
├── city-images/        ✅ Required
│   └── [all PNG files] ✅ Required
├── README.md           ✅ Recommended
├── .gitignore          ✅ Recommended
└── DEPLOY.md           ✅ This file
```

## 🔄 Updating Your Site

### For Future Changes:
```bash
# Make your changes locally
# Then push to GitHub:

git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your updated site.

## 🐛 Troubleshooting

### Common Issues:

1. **Site not loading**:
   - Check repository is public
   - Verify Pages is enabled
   - Wait 5-10 minutes for first deployment

2. **Images not showing**:
   - Verify `city-images/` folder is uploaded
   - Check file paths in CSV are correct

3. **404 errors**:
   - Ensure `index.html` is in root directory
   - Check file names match exactly

### Check Deployment Status:
- Go to repository → Actions tab
- Look for Pages build status
- Check for any error messages

## 🎯 Next Steps

1. **Test your live site** thoroughly
2. **Share the URL** with others
3. **Consider custom domain** (optional, costs money)
4. **Set up automatic deployments** for future updates

## 📞 Need Help?

- **GitHub Pages docs**: [pages.github.com](https://pages.github.com)
- **GitHub Support**: [support.github.com](https://support.github.com)
- **Create an issue** in your repository

---

**Your ROK City Viewer will be live on the internet in minutes! 🎉**
