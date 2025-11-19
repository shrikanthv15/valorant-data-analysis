# 🟪 Valorant Analytics - Teams & Players

A comprehensive analytics platform for Valorant Champions 2025 data with dedicated team and player pages featuring beautiful UI and detailed performance analytics.

## 🚀 Features

### 🏆 Dedicated Team Pages
- **Team Profiles**: Comprehensive team information with player rosters
- **Performance Analytics**: Win rates, map performance, eco statistics
- **Visualizations**: Interactive charts for team performance metrics
- **Player Integration**: Direct links to individual player profiles
- **Match History**: Recent matches and results

### 👤 Dedicated Player Pages
- **Player Profiles**: Detailed player statistics and career highlights
- **Agent Performance**: Performance breakdown by agent
- **Map Performance**: Statistics across different maps
- **Tournament History**: Performance across different tournaments
- **Special Stats**: Clutch performance and multi-kill statistics

### 📊 Enhanced Analytics
- **Interactive Charts**: Plotly-powered visualizations
- **Radar Charts**: Performance profile comparisons
- **Real-time Data**: Live data from CSV files
- **Responsive Design**: Beautiful, modern UI with gradient styling

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install flask flask-cors pandas numpy

# Run the backend server
python app.py
```
The backend will run on `http://127.0.0.1:5000`

### Frontend Setup (React)
```bash
# In a new terminal at project root
cd frontend
npm install
npm run dev
# Open the URL printed by Vite (default http://localhost:5173)
```

## 📁 Project Structure

```
valorant-product/
├── backend/
│   ├── app.py                 # Enhanced Flask backend with new routes
│   └── data/                  # CSV data files
│       ├── players_stats.csv
│       ├── kills_stats.csv
│       ├── team_mapping.csv
│       ├── maps_scores.csv
│       ├── eco_stats.csv
│       └── ... (other CSV files)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       ├── lib/api.ts
│       ├── components/Navbar.tsx
│       └── pages/{Home,Teams,TeamDetail,Players,PlayerDetail}.tsx
└── README.md
```

## 🎯 Usage

### 1. Launch the Application
```bash
streamlit run launcher.py
```

### 2. Choose Your Experience
- **Original Analytics**: Comprehensive data exploration with all datasets
- **Teams & Players**: Beautiful dedicated pages for teams and players

### 3. Navigate the Team & Player Pages
- **Home**: Overview with top teams and players
- **Teams**: Browse all teams with search and filtering
- **Players**: Browse all players with search and filtering
- **Team Detail**: Comprehensive team profile with analytics
- **Player Detail**: Detailed player profile with performance metrics

## 🔗 API Endpoints

### Enhanced Backend Routes

#### Team Endpoints
- `GET /teams` - List all teams
- `GET /teams/detailed` - List teams with metadata
- `GET /team/<team_name>` - Comprehensive team profile

#### Player Endpoints
- `GET /players` - List all players
- `GET /players/detailed` - List players with metadata
- `GET /player/<player_name>` - Comprehensive player profile

#### Data Endpoints
- `GET /datasets` - List available datasets
- `GET /dataset?name=<dataset>` - Get dataset data
- `GET /aggregate` - Server-side aggregation
- `GET /correlations` - Correlation matrices

## 📊 Data Sources

The application uses comprehensive Valorant Champions 2025 data including:

- **Player Statistics**: Performance metrics, ratings, combat scores
- **Team Performance**: Win rates, map performance, eco statistics
- **Match Data**: Scores, results, tournament information
- **Agent Performance**: Player performance by agent
- **Economy Data**: Eco round statistics and win rates

## 🎨 UI Features

### Modern Design
- **Gradient Backgrounds**: Beautiful color schemes
- **Card-based Layout**: Clean, organized information display
- **Interactive Elements**: Hover effects and smooth transitions
- **Responsive Design**: Works on different screen sizes

### Visualizations
- **Bar Charts**: Performance comparisons
- **Pie Charts**: Distribution analysis
- **Radar Charts**: Multi-dimensional performance profiles
- **Interactive Plots**: Hover data and zoom capabilities

## 🔧 Customization

### Adding New Data
1. Place CSV files in `backend/data/`
2. The backend automatically loads and normalizes column names
3. Data becomes available through API endpoints

### Styling
- Modify CSS in the frontend files
- Update color schemes in the gradient definitions
- Customize chart colors and themes

### Adding New Visualizations
- Use Plotly Express for quick charts
- Use Plotly Graph Objects for custom visualizations
- Add new chart types in the performance analytics sections

## 🚀 Future Enhancements

- **Image Upload**: Support for team logos and player avatars
- **Match Predictions**: ML-powered match outcome predictions
- **Real-time Updates**: Live data integration
- **Advanced Filtering**: More sophisticated search and filter options
- **Export Features**: Data export capabilities
- **Mobile App**: React Native mobile application

## 📝 Notes

- The application uses placeholder images for teams and players
- All data is loaded from CSV files in the backend/data directory
- The backend automatically handles column name normalization
- Error handling is implemented for missing data scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and portfolio purposes. Data is sourced from Valorant Champions 2025.

---

**Built with ❤️ using Python, Flask, Streamlit, and Plotly**
