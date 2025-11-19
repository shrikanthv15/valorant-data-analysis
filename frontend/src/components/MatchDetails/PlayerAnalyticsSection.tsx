import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import { getPlayerTimeseries } from '../../lib/api';
import { PlayerStat } from './types';
import { data } from 'framer-motion/client';

interface PlayerAnalyticsSectionProps {
  allPlayers: PlayerStat[];
  match: any;
}

const PlayerAnalyticsSection: React.FC<PlayerAnalyticsSectionProps> = ({ allPlayers, match }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<any>(null);
  const [loadingTimeseries, setLoadingTimeseries] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [availableMaps, setAvailableMaps] = useState<string[]>([]);

  const loadPlayerTimeseries = async (playerName: string) => {
    if (selectedPlayer === playerName && timeseriesData) return;
    
    setSelectedPlayer(playerName);
    setLoadingTimeseries(true);
    
    try {
      const data = await getPlayerTimeseries(playerName);
      setTimeseriesData(data);
      
      // ✅ Extract available maps
      if (data.timeseries?.map_performance) {
        const maps = [...new Set(data.timeseries.map_performance.map((m: any) => m.map))];
        setAvailableMaps(maps);
        setSelectedMap(maps[0] || null); // Select first map by default
      }
      
      setTimeout(() => {
        if (data.timeseries) {
          createPerformanceChart(data.timeseries);
          createMapHeatmap(data.timeseries);
          createRoundsChart(data.timeseries);
        }
      }, 100);
      
      setLoadingTimeseries(false);
    } catch (error) {
      console.error('Error loading timeseries:', error);
      setLoadingTimeseries(false);
    }
  };

  // ✅ Update charts when map selection changes
  useEffect(() => {
    if (timeseriesData?.timeseries && selectedMap) {
      createMapSpecificCharts(timeseriesData.timeseries, selectedMap);
    }
  }, [selectedMap]);
  console.log(timeseriesData);
  const createPerformanceChart = (timeseries: any) => {
    const matchProgression = timeseries.match_progression;
    if (!matchProgression || matchProgression.length === 0) return;

    const trace1 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.kills),
      mode: 'lines+markers',
      name: 'Kills',
      line: { color: '#4ade80', width: 3 },
      marker: { size: 8 }
    };
    
    const trace2 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.deaths),
      mode: 'lines+markers',
      name: 'Deaths',
      line: { color: '#ff4655', width: 3 },
      marker: { size: 8 }
    };
    
    const trace3 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.kd_ratio),
      mode: 'lines+markers',
      name: 'K/D Ratio',
      yaxis: 'y2',
      line: { color: '#ffd700', width: 3 },
      marker: { size: 8 }
    };

    const layout = {
      title: {
        text: `${selectedPlayer} - Tournament Performance`,
        font: { color: '#ffffff', size: 16 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff' },
      xaxis: {
        title: 'Match Number',
        gridcolor: 'rgba(255,255,255,0.1)',
        tickmode: 'array',
        tickvals: matchProgression.map((_: any, i: number) => i + 1),
        ticktext: matchProgression.map((m: any) => m.match_type)
      },
      yaxis: {
        title: 'Kills/Deaths',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      yaxis2: {
        title: 'K/D Ratio',
        overlaying: 'y',
        side: 'right',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      hovermode: 'x unified',
      showlegend: true,
      legend: {
        font: { color: '#ffffff' }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot('performance-chart', [trace1, trace2, trace3], layout, config);
  };

  const createMapHeatmap = (timeseries: any) => {
    const mapPerformance = timeseries.map_performance;
    if (!mapPerformance || mapPerformance.length === 0) return;
    
    const mapStats: any = {};
    mapPerformance.forEach((map: any) => {
      if (!mapStats[map.map]) {
        mapStats[map.map] = { kills: [], deaths: [], kd: [] };
      }
      mapStats[map.map].kills.push(map.kills);
      mapStats[map.map].deaths.push(map.deaths);
      mapStats[map.map].kd.push(map.kd_ratio);
    });
    
    const maps = Object.keys(mapStats);
    const metrics = ['Avg Kills', 'Avg Deaths', 'Avg K/D'];
    
    const z = maps.map(map => [
      mapStats[map].kills.reduce((a: number, b: number) => a + b, 0) / mapStats[map].kills.length,
      mapStats[map].deaths.reduce((a: number, b: number) => a + b, 0) / mapStats[map].deaths.length,
      mapStats[map].kd.reduce((a: number, b: number) => a + b, 0) / mapStats[map].kd.length
    ]);

    const trace = {
      z: z,
      x: metrics,
      y: maps,
      type: 'heatmap',
      colorscale: 'Viridis',
      hoverongaps: false,
      hovertemplate: '<b>%{y}</b><br>%{x}: %{z:.2f}<extra></extra>'
    };

    const layout = {
      title: {
        text: 'Map Performance Heatmap',
        font: { color: '#ffffff', size: 16 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff' },
      xaxis: { 
        title: 'Metrics',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      yaxis: { 
        title: 'Maps',
        gridcolor: 'rgba(255,255,255,0.1)'
      }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot('map-heatmap', [trace], layout, config);
  };

  // ✅ NEW: Create map-specific charts
  const createMapSpecificCharts = (timeseries: any, mapName: string) => {
    const roundData = timeseries.round_by_round.filter((r: any) => r.map === mapName);
    
    if (!roundData || roundData.length === 0) return;
    
    const trace = {
      x: roundData.map((r: any) => r.round_number),
      y: roundData.map((r: any) => r.kills),
      mode: 'markers',
      marker: {
        size: roundData.map((r: any) => r.multi_kill ? 15 : 8),
        color: roundData.map((r: any) => 
          r.clutch_situation ? '#ffd700' : 
          r.multi_kill ? '#ff4655' : 
          '#4ade80'
        ),
        line: { width: 2, color: '#ffffff' }
      },
      text: roundData.map((r: any) => 
        `Round ${r.round_number}<br>Match: ${r.match_name}<br>Kills: ${r.kills}<br>Deaths: ${r.deaths}${r.multi_kill ? '<br>🔥 Multi-kill!' : ''}${r.clutch_situation ? '<br>👑 Clutch!' : ''}`
      ),
      hovertemplate: '%{text}<extra></extra>',
      name: 'Round Performance'
    };

    const layout = {
      title: {
        text: `Round-by-Round Impact on ${mapName}`,
        font: { color: '#ffffff', size: 16 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff' },
      xaxis: {
        title: 'Round Number',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      yaxis: {
        title: 'Kills per Round',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      showlegend: false
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot('rounds-chart', [trace], layout, config);
  };

  const createRoundsChart = (timeseries: any) => {
    if (selectedMap) {
      createMapSpecificCharts(timeseries, selectedMap);
    } else {
      // Show all rounds if no map selected
      const roundData = timeseries.round_by_round;
      if (!roundData || roundData.length === 0) return;
      
      const trace = {
        x: roundData.map((_: any, i: number) => i + 1),
        y: roundData.map((r: any) => r.kills),
        mode: 'markers',
        marker: {
          size: roundData.map((r: any) => r.multi_kill ? 12 : 6),
          color: roundData.map((r: any) => 
            r.clutch_situation ? '#ffd700' : 
            r.multi_kill ? '#ff4655' : 
            '#4ade80'
          ),
          line: { width: 1, color: '#ffffff' }
        },
        text: roundData.map((r: any) => 
          `Round ${r.round_number}<br>Map: ${r.map}<br>Kills: ${r.kills}<br>Deaths: ${r.deaths}${r.multi_kill ? '<br>🔥 Multi-kill!' : ''}${r.clutch_situation ? '<br>👑 Clutch!' : ''}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Round Performance'
      };

      const layout = {
        title: {
          text: 'Round-by-Round Impact (All Maps)',
          font: { color: '#ffffff', size: 16 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: {
          title: 'Round Sequence',
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: {
          title: 'Kills per Round',
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        showlegend: false
      };

      const config = {
        responsive: true,
        displayModeBar: false
      };

      Plotly.newPlot('rounds-chart', [trace], layout, config);
    }
  };

  return (
    <section className="content-section timeseries-section">
      <h2 className="section-title">📈 Player Performance Analytics</h2>
      
      <div className="timeseries-container">
        <div className="player-selector">
          <h3 className="selector-title">Select Player for Analysis</h3>
          <div className="players-grid">
            {allPlayers.map((player, idx) => (
              <button
                key={idx}
                className={`player-select-btn ${selectedPlayer === player.Player ? 'active' : ''}`}
                onClick={() => loadPlayerTimeseries(player.Player)}
                disabled={loadingTimeseries}
              >
                <div className="player-avatar">👤</div>
                <div className="player-select-info">
                  <div className="player-select-name">{player.Player}</div>
                  <div className={`player-select-team ${player["Player Team"] === match["Team A"] ? 'team-a' : 'team-b'}`}>
                    {player["Player Team"]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {loadingTimeseries && (
          <div className="loading-indicator">Loading player analytics...</div>
        )}

        {/* ✅ NEW: Map selector */}
        {timeseriesData && availableMaps.length > 0 && (
          <div className="map-selector">
            <h3 className="selector-title">Filter by Map</h3>
            <div className="maps-buttons">
              <button
                className={`map-btn ${selectedMap === null ? 'active' : ''}`}
                onClick={() => setSelectedMap(null)}
              >
                All Maps
              </button>
              {availableMaps.map((map, idx) => (
                <button
                  key={idx}
                  className={`map-btn ${selectedMap === map ? 'active' : ''}`}
                  onClick={() => setSelectedMap(map)}
                >
                  {map}
                </button>
              ))}
            </div>
          </div>
        )}

        {timeseriesData && !loadingTimeseries && (
          <div className="timeseries-charts">
            <div className="chart-container">
              <h4 className="chart-title">🎯 Performance Progression</h4>
              <div id="performance-chart" className="plotly-chart"></div>
            </div>

            <div className="chart-container">
              <h4 className="chart-title">🗺️ Map Performance Matrix</h4>
              <div id="map-heatmap" className="plotly-chart"></div>
            </div>

            <div className="chart-container">
              <h4 className="chart-title">⚔️ Round-by-Round Impact</h4>
              <div id="rounds-chart" className="plotly-chart"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerAnalyticsSection;
