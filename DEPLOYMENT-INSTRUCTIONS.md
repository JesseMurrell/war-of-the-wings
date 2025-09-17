# Google Apps Script Deployment Instructions

## The Problem

Your wing counter app was getting CORS errors because Google Apps Script doesn't support the `setHeaders()` method that I initially tried to use.

## The Solution

I've updated your `google-apps-script.js` file to properly handle cross-origin requests using JSONP (JSON with Padding), which is the correct approach for Google Apps Script.

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

### 5. Test the Script in Google Apps Script (Optional)

1. In Google Apps Script, click on the function dropdown and select `simpleTest`
2. Click the **Run** button (▶️)
3. Check the execution log - it should show "doGet test successful"
4. If there are errors, check that you pasted the code correctly

### 6. Test Your App

1. Open your GitHub Pages site
2. Try adding a player
3. The CORS errors should be gone!

## What Was Fixed

- Removed the unsupported `setHeaders()` method calls
- Added JSONP support for cross-origin requests
- Updated all response functions to handle both regular JSON and JSONP callbacks
- Added proper null checks for request parameters to prevent "undefined" errors
- Added test functions to verify the script works correctly
- The script now works with the existing client-side JSONP fallback code

## If You Still Get Errors

1. Make sure you deployed the updated code
2. Try hard-refreshing your GitHub Pages site (Ctrl+Shift+R)
3. Check that your Google Sheet has the correct permissions
4. Verify the Web App URL in `config.js` matches your deployment

The app should now work perfectly with Google Sheets as your database!
