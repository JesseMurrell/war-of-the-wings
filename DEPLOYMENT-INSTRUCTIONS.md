# Google Apps Script Deployment Instructions

## The Problem
Your wing counter app is getting CORS errors because Google Apps Script wasn't properly configured to handle cross-origin requests from GitHub Pages.

## The Solution
I've updated your `google-apps-script.js` file with proper CORS headers. You need to deploy this updated code to Google Apps Script.

## Steps to Fix:

### 1. Copy the Updated Code
- Open the `google-apps-script.js` file in this project
- Copy ALL the code (Ctrl+A, then Ctrl+C)

### 2. Update Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Open your existing "War of the Wings" project
3. Select all the existing code and delete it
4. Paste the new code from `google-apps-script.js`
5. Click **Save** (Ctrl+S)

### 3. Deploy the Updated Version
1. Click **Deploy** → **New deployment**
2. Choose **Web app** as the type
3. Set **Execute as**: Me
4. Set **Who has access**: Anyone
5. Click **Deploy**
6. Copy the new Web App URL (it might be the same as before)

### 4. Update Your Config (if needed)
- If you got a new Web App URL, update it in `config.js`
- The current URL in your config is: `https://script.google.com/macros/s/AKfycbzw_QdGe6QVFFPfLwkATptGvvPKvqjczyvegSWSHfJYzvFwKckRnWZjX5JaaZZM_pEs/exec`

### 5. Test Your App
1. Open your GitHub Pages site
2. Try adding a player
3. The CORS errors should be gone!

## What Was Fixed
- Added proper CORS headers to all response functions
- Fixed the `doOptions()` function to handle preflight requests
- Added headers for `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`

## If You Still Get Errors
1. Make sure you deployed the updated code
2. Try hard-refreshing your GitHub Pages site (Ctrl+Shift+R)
3. Check that your Google Sheet has the correct permissions
4. Verify the Web App URL in `config.js` matches your deployment

The app should now work perfectly with Google Sheets as your database!
