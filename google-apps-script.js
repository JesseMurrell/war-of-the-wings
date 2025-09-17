// Google Apps Script Code
// Copy this code to Google Apps Script (script.google.com)
// This acts as your backend API for the GitHub Pages app

// Configuration
const SHEET_NAME = 'Players';

// Main function to handle HTTP requests
function doPost(e) {
  // Ensure e exists
  if (!e) {
    e = { parameter: {}, postData: null };
  }
  return handleRequest(e);
}

function doGet(e) {
  // Ensure e and e.parameter exist
  if (!e) {
    e = { parameter: {} };
  }
  if (!e.parameter) {
    e.parameter = {};
  }
  
  // Handle JSONP callback if present
  const callback = e.parameter.callback;
  
  // If no action specified, return a simple test response
  if (!e.parameter.action && (!e.postData || !e.postData.contents)) {
    const response = JSON.stringify({ 
      success: true, 
      message: 'Google Apps Script is working!',
      timestamp: new Date().toISOString()
    });
    
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + response + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(response)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Ensure e exists and has proper structure
    if (!e) {
      e = { parameter: {}, postData: null };
    }
    if (!e.parameter) {
      e.parameter = {};
    }
    
    const sheet = getOrCreateSheet();
    
    // Handle both GET and POST requests
    let action, data, callback;
    
    if (e.postData && e.postData.contents) {
      // POST request
      const postData = JSON.parse(e.postData.contents);
      action = postData.action;
      data = postData;
      callback = null; // POST requests don't use JSONP
    } else {
      // GET request
      action = e.parameter.action;
      data = e.parameter;
      callback = e.parameter.callback;
    }
    
    let response;
    
    switch (action) {
      case 'getPlayers':
        response = getPlayers(sheet);
        break;
      case 'addPlayer':
        response = addPlayer(sheet, data.name);
        break;
      case 'updateScore':
        response = updateScore(sheet, data.id, data.score);
        break;
      case 'removePlayer':
        response = removePlayer(sheet, data.id);
        break;
      case 'resetScores':
        response = resetScores(sheet);
        break;
      default:
        response = { error: 'Invalid action: ' + action };
    }
    
    const responseText = JSON.stringify(response);
    
    // Handle JSONP callback if present
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + responseText + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(responseText)
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    const errorResponse = JSON.stringify({ error: error.toString() });
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
    
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + errorResponse + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(errorResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Get or create the players sheet
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers
    sheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Score', 'Created', 'LastUpdated']]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }
  
  return sheet;
}

// Get all players
function getPlayers(sheet) {
  const data = sheet.getDataRange().getValues();
  const players = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // If ID exists
      players.push({
        id: row[0],
        name: row[1],
        score: row[2] || 0,
        created: row[3],
        lastUpdated: row[4]
      });
    }
  }
  
  return { success: true, players };
}

// Add a new player
function addPlayer(sheet, name) {
  if (!name || name.trim() === '') {
    return { error: 'Player name is required' };
  }
  
  // Check if player already exists
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][1].toLowerCase() === name.toLowerCase()) {
      return { error: 'Player already exists' };
    }
  }
  
  const id = Date.now();
  const timestamp = new Date();
  
  sheet.appendRow([id, name, 0, timestamp, timestamp]);
  
  return { 
    success: true, 
    player: { 
      id, 
      name, 
      score: 0, 
      created: timestamp,
      lastUpdated: timestamp
    } 
  };
}

// Update player score
function updateScore(sheet, playerId, newScore) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == playerId) {
      sheet.getRange(i + 1, 3).setValue(Math.max(0, newScore)); // Score column
      sheet.getRange(i + 1, 5).setValue(new Date()); // LastUpdated column
      
      return { 
        success: true, 
        player: {
          id: data[i][0],
          name: data[i][1],
          score: Math.max(0, newScore),
          created: data[i][3],
          lastUpdated: new Date()
        }
      };
    }
  }
  
  return { error: 'Player not found' };
}

// Remove a player
function removePlayer(sheet, playerId) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == playerId) {
      const playerName = data[i][1];
      sheet.deleteRow(i + 1);
      return { success: true, message: `${playerName} removed` };
    }
  }
  
  return { error: 'Player not found' };
}

// Reset all scores to 0
function resetScores(sheet) {
  const data = sheet.getDataRange().getValues();
  const timestamp = new Date();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // If ID exists
      sheet.getRange(i + 1, 3).setValue(0); // Reset score
      sheet.getRange(i + 1, 5).setValue(timestamp); // Update timestamp
    }
  }
  
  return { success: true, message: 'All scores reset' };
}

// Test function - you can run this to test your setup
function testAPI() {
  const sheet = getOrCreateSheet();
  console.log('Sheet created/found:', sheet.getName());
  
  // Test adding a player
  const result = addPlayer(sheet, 'Test Player');
  console.log('Add player result:', result);
  
  // Test getting players
  const players = getPlayers(sheet);
  console.log('Get players result:', players);
}

// Simple test function to verify the script works
function simpleTest() {
  try {
    // Test doGet with minimal parameters
    const testEvent = {
      parameter: {
        action: 'getPlayers'
      }
    };
    
    const result = doGet(testEvent);
    console.log('doGet test successful');
    return 'Script is working correctly!';
  } catch (error) {
    console.error('Error in simpleTest:', error);
    return 'Error: ' + error.toString();
  }
}
