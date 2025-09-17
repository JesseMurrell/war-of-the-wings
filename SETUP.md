# Google Sheets Integration Setup Guide

This guide walks you through setting up centralized data storage using Google Sheets and Google Apps Script, so multiple people can access and update scores simultaneously from different devices.

## **Why This Works with GitHub Pages**

- **GitHub Pages**: Hosts your static web app (HTML, CSS, JS)
- **Google Apps Script**: Acts as a free backend API service
- **Google Sheets**: Serves as your real-time database
- **Result**: Multi-user, real-time wing challenge scoreboard!

## **Step-by-Step Setup**

### **Step 1: Create Google Sheet**

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "War of the Wings Scoreboard"
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```
5. Note down this Sheet ID - you'll need it later

### **Step 2: Set Up Google Apps Script**

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Delete the default code and paste the code from `google-apps-script.js`
4. Name your project "Wing Challenge API"
5. Click the save icon (💾)

### **Step 3: Connect Script to Your Sheet**

1. In Google Apps Script, click "Resources" → "Cloud Platform Project"
2. Click "Change Project" and create a new project if needed
3. Go back to your script
4. Click "File" → "Project Properties" → "Script Properties"
5. Add a new property:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: Your Sheet ID from Step 1

### **Step 4: Deploy the API**

1. In Google Apps Script, click "Deploy" → "New Deployment"
2. Choose type: "Web app"
3. Set these options:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click "Deploy"
5. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/[SCRIPT_ID]/exec
   ```
6. Click "Done"

### **Step 5: Configure Your Web App**

1. Open `config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const CONFIG = {
     // Replace with your Google Sheets ID
     SHEET_ID: "your_actual_sheet_id_here",

     // Replace with your Google Apps Script Web App URL
     WEB_APP_URL: "https://script.google.com/macros/s/your_script_id/exec",

     // Leave these as default
     SHEET_NAME: "Players",
     SYNC_INTERVAL: 3000,
     ENABLE_SYNC: true,
     USE_FALLBACK: true,
   };
   ```

### **Step 6: Test Your Setup**

1. Open `index.html` in your browser
2. Add a test player
3. Check your Google Sheet - you should see the data appear!
4. Open the app in another browser tab/device
5. Make changes in one tab and watch them sync to the other

### **Step 7: Deploy to GitHub Pages**

1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your app will be live at: `https://yourusername.github.io/repository-name`

## **How It Works**

### **Data Flow**

```
User Action → Web App → Google Apps Script → Google Sheets → Sync to Other Users
```

### **Real-time Sync**

- Every 3 seconds, the app checks for updates
- When online, all changes go to Google Sheets
- When offline, changes are stored locally
- When back online, data syncs automatically

### **Fallback System**

- If Google Sheets is unavailable, the app works offline
- Data is saved in browser localStorage
- Shows clear notifications about online/offline status

## **Features**

✅ **Multi-device Access**: Everyone can use their own device  
✅ **Real-time Updates**: See changes from others within 3 seconds  
✅ **Offline Support**: Works even without internet  
✅ **Conflict Resolution**: Server data takes precedence  
✅ **Error Handling**: Graceful fallbacks and user notifications  
✅ **Free**: No costs for Google Sheets or Apps Script

## **Troubleshooting**

### **"Error adding player" Messages**

- Check that your Google Apps Script URL is correct in `config.js`
- Verify the script is deployed as a web app with "Anyone" access
- Test the script directly in Google Apps Script using the `testAPI()` function

### **Data Not Syncing**

- Check browser console for error messages
- Verify your Sheet ID is correct
- Make sure the Google Sheet exists and is accessible

### **Permission Issues**

- Ensure your Google Apps Script is set to execute as "Me"
- Check that "Anyone" has access to the web app
- Try re-deploying the script with a new deployment

### **GitHub Pages Not Working**

- Make sure all files are in the repository root
- Check that `config.js` has the correct URLs (not placeholder text)
- Verify GitHub Pages is enabled in repository settings

## **Advanced Customization**

### **Change Sync Interval**

Edit `SYNC_INTERVAL` in `config.js` (in milliseconds):

```javascript
SYNC_INTERVAL: 1000, // 1 second (more frequent)
SYNC_INTERVAL: 10000, // 10 seconds (less frequent)
```

### **Disable Real-time Sync**

Set `ENABLE_SYNC: false` in `config.js` to use only manual updates.

### **Custom Sheet Structure**

Modify the Google Apps Script to match your preferred column layout.

## **Security Notes**

- The Google Apps Script URL is public but only accepts specific actions
- No sensitive data is stored (just names and scores)
- All data is stored in your own Google account
- Users can't access or modify the underlying Google Sheet directly

## **Cost**

- **Google Sheets**: Free (up to 15GB storage per Google account)
- **Google Apps Script**: Free (6 minutes execution time per trigger)
- **GitHub Pages**: Free for public repositories
- **Total Cost**: $0 💰

---

Your wing challenge is now ready for multi-user, real-time competition! 🍗🏆
