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
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const sheet = getOrCreateSheet();
    const action = e.parameter.action || e.postData?.contents ? JSON.parse(e.postData.contents).action : '';
    
    let response;
    
    switch (action) {
      case 'getPlayers':
        response = getPlayers(sheet);
        break;
      case 'addPlayer':
        const playerData = JSON.parse(e.postData.contents);
        response = addPlayer(sheet, playerData.name);
        break;
      case 'updateScore':
        const scoreData = JSON.parse(e.postData.contents);
        response = updateScore(sheet, scoreData.id, scoreData.score);
        break;
      case 'removePlayer':
        const removeData = JSON.parse(e.postData.contents);
        response = removePlayer(sheet, removeData.id);
        break;
      case 'resetScores':
        response = resetScores(sheet);
        break;
      default:
        response = { error: 'Invalid action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
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
