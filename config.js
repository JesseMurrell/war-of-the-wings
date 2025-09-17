// Google Sheets API Configuration
// Instructions for setup are in README.md

const CONFIG = {
    // Replace with your Google Sheets ID (from the URL)
    SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
    
    // Replace with your Google Apps Script Web App URL
    WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
    
    // Sheet name/tab (default is 'Sheet1')
    SHEET_NAME: 'Players',
    
    // Polling interval for real-time updates (milliseconds)
    SYNC_INTERVAL: 3000, // 3 seconds
    
    // Enable/disable real-time sync
    ENABLE_SYNC: true,
    
    // Fallback to localStorage if API fails
    USE_FALLBACK: true
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
