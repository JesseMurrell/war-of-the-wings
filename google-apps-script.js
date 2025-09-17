// Google Apps Script Code
// Copy this code to Google Apps Script (script.google.com)
// This acts as your backend API for the GitHub Pages app

// Configuration
const SHEET_NAME = 'Players';

// Main function to handle HTTP requests
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  // If no action specified, return a simple test response
  if (!e.parameter.action && (!e.postData || !e.postData.contents)) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Google Apps Script is working!',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const sheet = getOrCreateSheet();
    
    // Handle both GET and POST requests
    let action, data;
    
    if (e.postData && e.postData.contents) {
      // POST request
      const postData = JSON.parse(e.postData.contents);
      action = postData.action;
      data = postData;
    } else {
      // GET request
      action = e.parameter.action;
      data = e.parameter;
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
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
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
