// War of the Wings - JavaScript Functionality
// Inspired by Salt Music's clean, efficient approach

class WingChallenge {
    constructor() {
        this.players = [];
        this.actionHistory = [];
        this.timer = {
            seconds: 0,
            interval: null,
            isRunning: false
        };
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    init() {
        this.setupOnlineDetection();
        this.loadFromStorage();
        this.bindEvents();
        this.updateDisplay();
        this.setupConfetti();
        this.startSync();
    }
    
    bindEvents() {
        // Player management
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        
        // Game controls
        document.getElementById('resetScoresBtn').addEventListener('click', () => this.resetScores());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoLastAction());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetTimer());
    }
    
    async addPlayer() {
        const nameInput = document.getElementById('playerNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a player name', 'error');
            return;
        }
        
        if (this.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('Player already exists', 'error');
            return;
        }
        
        // Show loading state
        const addBtn = document.getElementById('addPlayerBtn');
        const originalText = addBtn.textContent;
        addBtn.textContent = 'Adding...';
        addBtn.disabled = true;
        
        // Debug logging
        console.log('🔍 DEBUG: Adding player debug info:');
        console.log('- Player name:', name);
        console.log('- Is online:', this.isOnline);
        console.log('- CONFIG.WEB_APP_URL:', CONFIG.WEB_APP_URL);
        console.log('- URL check passed:', CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE');
        
        try {
            if (this.isOnline && CONFIG.WEB_APP_URL && CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.log('✅ Attempting to add player via Google Sheets API...');
                // Add to Google Sheets
                const result = await this.apiCall('addPlayer', { name });
                console.log('📡 API call result:', result);
                
                if (result.success) {
                    console.log('✅ Player added successfully via API');
                    this.players.push({
                        id: result.player.id,
                        name: result.player.name,
                        score: result.player.score,
                        isLeader: false
                    });
                    
                    this.recordAction('add_player', { player: result.player });
                    nameInput.value = '';
                    this.updateDisplay();
                    this.saveToStorage();
                    this.showNotification(`${name} added to the challenge!`, 'success');
                } else {
                    console.log('❌ API call failed:', result.error);
                    throw new Error(result.error || 'Failed to add player');
                }
            } else {
                console.log('⚠️ Using fallback mode because:');
                console.log('- Is online:', this.isOnline);
                console.log('- Has WEB_APP_URL:', !!CONFIG.WEB_APP_URL);
                console.log('- URL is configured:', CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE');
                // Fallback to local storage
                const player = {
                    id: Date.now(),
                    name: name,
                    score: 0,
                    isLeader: false
                };
                
                this.players.push(player);
                this.recordAction('add_player', { player: { ...player } });
                
                nameInput.value = '';
                this.updateDisplay();
                this.saveToStorage();
                
                this.showNotification(`${name} added locally!`, 'success');
            }
        } catch (error) {
            console.error('❌ Error adding player:', error);
            console.error('Error details:', error.message);
            this.showNotification('Error adding player. Try again.', 'error');
        } finally {
            addBtn.textContent = originalText;
            addBtn.disabled = false;
        }
    }
    
    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;
        
        const removedPlayer = this.players[playerIndex];
        this.players.splice(playerIndex, 1);
        
        this.recordAction('remove_player', { player: { ...removedPlayer }, index: playerIndex });
        
        this.updateDisplay();
        this.saveToStorage();
        
        this.showNotification(`${removedPlayer.name} removed from challenge`, 'success');
    }
    
    updateScore(playerId, change) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        const oldScore = player.score;
        player.score = Math.max(0, player.score + change);
        
        this.recordAction('score_change', { 
            playerId, 
            oldScore, 
            newScore: player.score, 
            change 
        });
        
        this.updateDisplay();
        this.saveToStorage();
        
        // Check for new records
        if (player.score > oldScore && this.isNewLeader(player)) {
            this.celebrateNewLeader(player);
        }
    }
    
    isNewLeader(player) {
        const maxScore = Math.max(...this.players.map(p => p.score));
        return player.score === maxScore && player.score > 0;
    }
    
    celebrateNewLeader(player) {
        this.showNotification(`🎉 ${player.name} takes the lead with ${player.score} wings!`, 'success');
        this.triggerConfetti();
    }
    
    resetScores() {
        if (!confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
            return;
        }
        
        const oldScores = this.players.map(p => ({ id: p.id, score: p.score }));
        this.players.forEach(p => p.score = 0);
        
        this.recordAction('reset_scores', { oldScores });
        
        this.updateDisplay();
        this.saveToStorage();
        
        this.showNotification('All scores reset!', 'success');
    }
    
    undoLastAction() {
        if (this.actionHistory.length === 0) {
            this.showNotification('Nothing to undo', 'error');
            return;
        }
        
        const lastAction = this.actionHistory.pop();
        
        switch (lastAction.type) {
            case 'add_player':
                this.players = this.players.filter(p => p.id !== lastAction.data.player.id);
                break;
                
            case 'remove_player':
                this.players.splice(lastAction.data.index, 0, lastAction.data.player);
                break;
                
            case 'score_change':
                const player = this.players.find(p => p.id === lastAction.data.playerId);
                if (player) {
                    player.score = lastAction.data.oldScore;
                }
                break;
                
            case 'reset_scores':
                lastAction.data.oldScores.forEach(oldScore => {
                    const player = this.players.find(p => p.id === oldScore.id);
                    if (player) {
                        player.score = oldScore.score;
                    }
                });
                break;
        }
        
        this.updateDisplay();
        this.saveToStorage();
        
        this.showNotification('Action undone', 'success');
    }
    
    recordAction(type, data) {
        this.actionHistory.push({
            type,
            data,
            timestamp: Date.now()
        });
        
        // Keep only last 10 actions
        if (this.actionHistory.length > 10) {
            this.actionHistory.shift();
        }
    }
    
    updateDisplay() {
        this.updateLeaderboard();
        this.updateScoreboard();
        this.updateStats();
    }
    
    updateLeaderboard() {
        const leaderDisplay = document.getElementById('leaderDisplay');
        
        if (this.players.length === 0) {
            leaderDisplay.innerHTML = '<div class="leader-text">Add players to start the challenge</div>';
            return;
        }
        
        const maxScore = Math.max(...this.players.map(p => p.score));
        const leaders = this.players.filter(p => p.score === maxScore && p.score > 0);
        
        // Update leader status
        this.players.forEach(p => {
            p.isLeader = leaders.includes(p) && maxScore > 0;
        });
        
        if (maxScore === 0) {
            leaderDisplay.innerHTML = '<div class="leader-text">No wings eaten yet. Let the challenge begin!</div>';
        } else if (leaders.length === 1) {
            const leader = leaders[0];
            leaderDisplay.innerHTML = `
                <div class="leader-name">${leader.name}</div>
                <div class="leader-score">${leader.score} wings</div>
            `;
        } else {
            leaderDisplay.innerHTML = `
                <div class="leader-name">TIE!</div>
                <div class="leader-score">${leaders.map(l => l.name).join(', ')} (${maxScore} wings)</div>
            `;
        }
    }
    
    updateScoreboard() {
        const scoreboardGrid = document.getElementById('scoreboardGrid');
        
        // Sort players by score (descending) then by name
        const sortedPlayers = [...this.players].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.name.localeCompare(b.name);
        });
        
        scoreboardGrid.innerHTML = sortedPlayers.map(player => `
            <div class="player-card ${player.isLeader ? 'leader' : ''}" data-player-id="${player.id}">
                <div class="player-header">
                    <div class="player-name">${player.name}</div>
                    <button class="remove-btn" onclick="wingChallenge.removePlayer(${player.id})" title="Remove player">×</button>
                </div>
                
                <div class="player-score">${player.score}</div>
                
                <div class="score-controls">
                    <button class="score-btn" onclick="wingChallenge.updateScore(${player.id}, -1)" title="Decrease score">−</button>
                    <button class="score-btn" onclick="wingChallenge.updateScore(${player.id}, 1)" title="Increase score">+</button>
                </div>
                
                ${this.getTieIndicator(player)}
            </div>
        `).join('');
    }
    
    getTieIndicator(player) {
        if (!player.isLeader) return '';
        
        const leaders = this.players.filter(p => p.isLeader);
        if (leaders.length > 1) {
            return '<div class="tie-indicator">Tied</div>';
        }
        
        return '<div class="tie-indicator">Leader</div>';
    }
    
    updateStats() {
        const totalPlayers = this.players.length;
        const totalWings = this.players.reduce((sum, p) => sum + p.score, 0);
        const averageWings = totalPlayers > 0 ? (totalWings / totalPlayers).toFixed(1) : '0.0';
        
        document.getElementById('totalPlayers').textContent = totalPlayers;
        document.getElementById('totalWings').textContent = totalWings;
        document.getElementById('averageWings').textContent = averageWings;
    }
    
    // Timer functionality
    startTimer() {
        if (this.timer.isRunning) return;
        
        this.timer.isRunning = true;
        this.timer.interval = setInterval(() => {
            this.timer.seconds++;
            this.updateTimerDisplay();
        }, 1000);
        
        document.getElementById('startTimer').style.opacity = '0.5';
    }
    
    pauseTimer() {
        if (!this.timer.isRunning) return;
        
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        
        document.getElementById('startTimer').style.opacity = '1';
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timer.seconds = 0;
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.seconds / 60);
        const seconds = this.timer.seconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }
    
    // Export functionality
    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            duration: this.formatTime(this.timer.seconds),
            players: this.players.map(p => ({
                name: p.name,
                score: p.score,
                isLeader: p.isLeader
            })).sort((a, b) => b.score - a.score),
            totalWings: this.players.reduce((sum, p) => sum + p.score, 0),
            averageWings: this.players.length > 0 ? (this.players.reduce((sum, p) => sum + p.score, 0) / this.players.length).toFixed(1) : '0.0'
        };
        
        const csvContent = this.generateCSV(results);
        this.downloadFile(csvContent, 'war-of-the-wings-results.csv', 'text/csv');
        
        this.showNotification('Results exported successfully!', 'success');
    }
    
    generateCSV(results) {
        let csv = 'War of the Wings - Results\n\n';
        csv += `Date: ${new Date(results.timestamp).toLocaleDateString()}\n`;
        csv += `Duration: ${results.duration}\n`;
        csv += `Total Wings: ${results.totalWings}\n`;
        csv += `Average Wings: ${results.averageWings}\n\n`;
        csv += 'Rank,Player,Wings,Status\n';
        
        results.players.forEach((player, index) => {
            csv += `${index + 1},${player.name},${player.score},${player.isLeader ? 'Leader' : ''}\n`;
        });
        
        return csv;
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Local storage
    saveToStorage() {
        const data = {
            players: this.players,
            actionHistory: this.actionHistory,
            timer: this.timer.seconds
        };
        localStorage.setItem('wingChallenge', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const stored = localStorage.getItem('wingChallenge');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.players = data.players || [];
                this.actionHistory = data.actionHistory || [];
                this.timer.seconds = data.timer || 0;
                this.updateTimerDisplay();
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
    }
    
    // Confetti setup
    setupConfetti() {
        this.canvas = document.getElementById('confettiCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.confettiParticles = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    triggerConfetti() {
        // Create confetti particles
        for (let i = 0; i < 100; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: Math.random() * 4 + 2,
                life: 1
            });
        }
        
        this.animateConfetti();
    }
    
    animateConfetti() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const particle = this.confettiParticles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= 0.01;
            
            if (particle.life <= 0 || particle.y > this.canvas.height) {
                this.confettiParticles.splice(i, 1);
                continue;
            }
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
        
        if (this.confettiParticles.length > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    // Notification system
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? 'var(--error-red)' : 'var(--success-green)'};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Google Sheets API Integration Methods
    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Back online! Syncing data...', 'success');
            this.syncWithServer();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Working offline. Changes will sync when back online.', 'info');
        });
    }
    
    startSync() {
        if (!CONFIG.ENABLE_SYNC) return;
        
        // Initial sync
        this.syncWithServer();
        
        // Set up periodic sync
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.syncWithServer();
            }
        }, CONFIG.SYNC_INTERVAL);
    }
    
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    async syncWithServer() {
        if (!this.isOnline || !CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            return;
        }
        
        try {
            const result = await this.apiCall('getPlayers');
            if (result.success) {
                this.mergeServerData(result.players);
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    mergeServerData(serverPlayers) {
        // Simple merge strategy: server data takes precedence
        // In a more complex app, you'd implement conflict resolution
        
        const hasChanges = JSON.stringify(this.players) !== JSON.stringify(serverPlayers.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            isLeader: false
        })));
        
        if (hasChanges) {
            this.players = serverPlayers.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score,
                isLeader: false
            }));
            
            this.updateDisplay();
            this.saveToStorage();
        }
    }
    
    async apiCall(action, data = {}) {
        console.log('🌐 API Call Debug:');
        console.log('- Action:', action);
        console.log('- Data:', data);
        console.log('- URL:', CONFIG.WEB_APP_URL);
        
        if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.error('❌ Google Apps Script URL not configured');
            throw new Error('Google Apps Script URL not configured');
        }
        
        const payload = { action, ...data };
        console.log('📤 Sending payload:', payload);
        
        // Check if we need JSONP (CORS will fail for Google Apps Script)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';
        
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // Use JSONP for localhost and GitHub Pages (Google Apps Script doesn't support CORS properly)
        if (isLocalhost || isGitHubPages) {
            console.log('🌐 Using JSONP fallback for cross-origin request');
            console.log('🔍 Debug - isLocalhost:', isLocalhost, 'isGitHubPages:', isGitHubPages);
            console.log('🔍 Debug - hostname:', window.location.hostname);
            return this.jsonpCall(action, data);
        }
        
        try {
            // Try GET request for HTTPS domains
            const url = new URL(CONFIG.WEB_APP_URL);
            url.searchParams.append('action', action);
            Object.keys(data).forEach(key => {
                url.searchParams.append(key, data[key]);
            });
            
            console.log('🔗 GET URL:', url.toString());
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                mode: 'cors'
            });
            
            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('📥 Response data:', result);
            return result;
        } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            throw fetchError;
        }
    }
    
    // JSONP fallback for localhost testing
    jsonpCall(action, data) {
        return new Promise((resolve, reject) => {
            console.log('📞 Using JSONP for localhost');
            
            // Create callback function name
            const callbackName = 'jsonp_callback_' + Date.now();
            
            // Create URL with callback parameter
            const url = new URL(CONFIG.WEB_APP_URL);
            url.searchParams.append('action', action);
            url.searchParams.append('callback', callbackName);
            Object.keys(data).forEach(key => {
                url.searchParams.append(key, data[key]);
            });
            
            console.log('📞 JSONP URL:', url.toString());
            
            // Set up global callback
            window[callbackName] = function(result) {
                console.log('📞 JSONP Response:', result);
                delete window[callbackName];
                document.head.removeChild(script);
                resolve(result);
            };
            
            // Create script tag
            const script = document.createElement('script');
            script.src = url.toString();
            script.onerror = function() {
                console.error('❌ JSONP Error');
                delete window[callbackName];
                document.head.removeChild(script);
                reject(new Error('JSONP request failed'));
            };
            
            // Add to page
            document.head.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    console.error('❌ JSONP Timeout');
                    delete window[callbackName];
                    document.head.removeChild(script);
                    reject(new Error('JSONP request timeout'));
                }
            }, 10000);
        });
    }
    
    // Update the existing methods to use API calls
    async updateScore(playerId, change) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        const oldScore = player.score;
        const newScore = Math.max(0, player.score + change);
        
        try {
            if (this.isOnline && CONFIG.WEB_APP_URL && CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                const result = await this.apiCall('updateScore', { id: playerId, score: newScore });
                
                if (result.success) {
                    player.score = newScore;
                    this.recordAction('score_change', { 
                        playerId, 
                        oldScore, 
                        newScore, 
                        change 
                    });
                    
                    this.updateDisplay();
                    this.saveToStorage();
                    
                    if (newScore > oldScore && this.isNewLeader(player)) {
                        this.celebrateNewLeader(player);
                    }
                } else {
                    throw new Error(result.error || 'Failed to update score');
                }
            } else {
                // Fallback to local update
                player.score = newScore;
                this.recordAction('score_change', { 
                    playerId, 
                    oldScore, 
                    newScore, 
                    change 
                });
                
                this.updateDisplay();
                this.saveToStorage();
                
                if (newScore > oldScore && this.isNewLeader(player)) {
                    this.celebrateNewLeader(player);
                }
            }
        } catch (error) {
            console.error('Error updating score:', error);
            this.showNotification('Error updating score. Try again.', 'error');
        }
    }
    
    async removePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;
        
        const removedPlayer = this.players[playerIndex];
        
        try {
            if (this.isOnline && CONFIG.WEB_APP_URL && CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                const result = await this.apiCall('removePlayer', { id: playerId });
                
                if (result.success) {
                    this.players.splice(playerIndex, 1);
                    this.recordAction('remove_player', { player: { ...removedPlayer }, index: playerIndex });
                    
                    this.updateDisplay();
                    this.saveToStorage();
                    
                    this.showNotification(`${removedPlayer.name} removed from challenge`, 'success');
                } else {
                    throw new Error(result.error || 'Failed to remove player');
                }
            } else {
                // Fallback to local removal
                this.players.splice(playerIndex, 1);
                this.recordAction('remove_player', { player: { ...removedPlayer }, index: playerIndex });
                
                this.updateDisplay();
                this.saveToStorage();
                
                this.showNotification(`${removedPlayer.name} removed locally`, 'success');
            }
        } catch (error) {
            console.error('Error removing player:', error);
            this.showNotification('Error removing player. Try again.', 'error');
        }
    }
    
    async resetScores() {
        if (!confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
            return;
        }
        
        try {
            if (this.isOnline && CONFIG.WEB_APP_URL && CONFIG.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                const result = await this.apiCall('resetScores');
                
                if (result.success) {
                    const oldScores = this.players.map(p => ({ id: p.id, score: p.score }));
                    this.players.forEach(p => p.score = 0);
                    
                    this.recordAction('reset_scores', { oldScores });
                    
                    this.updateDisplay();
                    this.saveToStorage();
                    
                    this.showNotification('All scores reset!', 'success');
                } else {
                    throw new Error(result.error || 'Failed to reset scores');
                }
            } else {
                // Fallback to local reset
                const oldScores = this.players.map(p => ({ id: p.id, score: p.score }));
                this.players.forEach(p => p.score = 0);
                
                this.recordAction('reset_scores', { oldScores });
                
                this.updateDisplay();
                this.saveToStorage();
                
                this.showNotification('Scores reset locally!', 'success');
            }
        } catch (error) {
            console.error('Error resetting scores:', error);
            this.showNotification('Error resetting scores. Try again.', 'error');
        }
    }
}

// Initialize the app
let wingChallenge;

document.addEventListener('DOMContentLoaded', () => {
    wingChallenge = new WingChallenge();
});

// Cleanup on page unload
window.addEventListener('beforeunload', (e) => {
    if (wingChallenge) {
        wingChallenge.stopSync();
        if (wingChallenge.players.length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    }
});
