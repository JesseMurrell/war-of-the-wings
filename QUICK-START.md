# Quick Start Guide (5 Minutes)

## **Step 1: Create Google Sheet**

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "Blank spreadsheet"
3. Name it "Wing Challenge"
4. Copy the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/[THIS_PART]/edit`

## **Step 2: Create Google Apps Script**

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete default code, paste everything from `google-apps-script.js`
4. Click Save (💾), name it "Wing API"

## **Step 3: Deploy the Script**

1. Click "Deploy" → "New deployment"
2. Type: "Web app"
3. Execute as: "Me"
4. Access: "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

## **Step 4: Configure Your App**

1. Open `config.js`
2. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your Sheet ID
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your Web App URL

## **Step 5: Test**

1. Open `index.html` in browser
2. Add a player
3. Check your Google Sheet - data should appear!

## **Step 6: Deploy to GitHub Pages**

1. Push to GitHub repository
2. Settings → Pages → Enable
3. Share the GitHub Pages URL with your team

## **That's It!**

No API keys, no billing, no complex authentication. Just works! 🎉

## **Troubleshooting**

- If you get "Error adding player": Check that your URLs in `config.js` are correct
- If data doesn't appear in sheet: Make sure the Google Apps Script is deployed with "Anyone" access
- If GitHub Pages shows errors: Ensure `config.js` has real URLs, not placeholder text
