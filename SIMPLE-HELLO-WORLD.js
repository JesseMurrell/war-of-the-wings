// Simple Hello World Google Apps Script
// Copy this ENTIRE code to Google Apps Script and replace everything

function doGet(e) {
  // Check if there's a callback parameter (for JSONP)
  const callback = e && e.parameter && e.parameter.callback;
  
  const response = {
    success: true,
    message: "Hello World from Google Apps Script!",
    timestamp: new Date().toISOString()
  };
  
  const responseText = JSON.stringify(response);
  
  if (callback) {
    // JSONP response
    return ContentService
      .createTextOutput(callback + '(' + responseText + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Regular JSON response
    return ContentService
      .createTextOutput(responseText)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}
