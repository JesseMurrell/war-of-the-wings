// Google Sheets API Configuration
// Instructions for setup are in README.md

const CONFIG = {
    // Replace with your Google Sheets ID (from the URL)
    SHEET_ID: '127yfrhvvy2nck6MFvhmv1MiD4mfVnWvt8hO6slhao4M',
    
    // Replace with your Google Apps Script Web App URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyKLMxobUPK0g6p8xRRbccZC5vRj5N62lNH4H-zr5S5MkVCoGADn1bS9RmUuEXQBC39/exec',
    
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
