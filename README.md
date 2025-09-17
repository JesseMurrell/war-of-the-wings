# War of the Wings 🍗

A sophisticated wing eating challenge scoreboard inspired by Salt Music's clean design language. Perfect for office competitions and social events.

## Features

### Core Functionality

- **Add/Remove Players**: Manage participants dynamically
- **Score Tracking**: Increase/decrease wing counts with +/- buttons
- **Leader Detection**: Automatically identifies current leader(s)
- **Tie Handling**: Clearly displays when multiple players are tied

### Enhanced Features

- **Timer**: Track challenge duration with start/pause/reset controls
- **Undo System**: Reverse the last 10 actions
- **Export Results**: Download results as CSV file
- **Local Storage**: Persist data between browser sessions
- **Confetti Celebrations**: Visual celebrations for new leaders
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Stats**: Total players, wings consumed, and averages

### Design Language

- Clean, minimal aesthetic inspired by Salt Music
- Bold typography with Inter font family
- High contrast black and white color scheme
- Sophisticated grid layouts
- Smooth animations and transitions

## Usage

### Getting Started

1. Open `index.html` in your web browser
2. Add players using the input field
3. Use +/- buttons to track wing consumption
4. Monitor the leaderboard in real-time

### Controls

- **Add Player**: Enter name and click "Add Player" or press Enter
- **Score Control**: Click + to increase, - to decrease wing count
- **Remove Player**: Click × on any player card
- **Timer**: Use Start/Pause/Reset buttons in the top-right corner
- **Undo**: Reverse the last action (up to 10 actions)
- **Reset Scores**: Clear all scores while keeping players
- **Export**: Download results as CSV file

### GitHub Pages Deployment

This app is designed to work seamlessly with GitHub Pages:

1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main` or `gh-pages`)
4. Your app will be available at `https://yourusername.github.io/repository-name`

## Technical Details

### Files Structure

- `index.html` - Main application structure
- `styles.css` - Salt Music-inspired styling
- `script.js` - Full application logic and functionality
- `README.md` - This documentation

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No external dependencies except Google Fonts

### Local Storage

The app automatically saves:

- Player list and scores
- Action history for undo functionality
- Timer state

### Export Format

CSV exports include:

- Challenge date and duration
- Player rankings with scores
- Total and average statistics

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --primary-black: #000000;
  --primary-white: #ffffff;
  --secondary-gray: #f5f5f5;
  /* ... */
}
```

### Typography

The app uses Inter font family. To change:

```css
body {
  font-family: "Your-Font", sans-serif;
}
```

## License

Open source - feel free to modify and use for your own wing eating challenges!

---

_May the best wing eater win!_ 🏆
