import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import { getPlayerTimeseries } from '../../lib/api';
import { PlayerStat } from './types';
import '../../css/PlayerAnalytics.css';

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

      if (data.timeseries?.map_performance) {
        const maps = [...new Set(data.timeseries.map_performance.map((m: any) => m.map))] as string[];
        setAvailableMaps(maps);
        setSelectedMap(maps[0] || null);
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

  useEffect(() => {
    if (timeseriesData?.timeseries && selectedMap) {
      createMapSpecificCharts(timeseriesData.timeseries, selectedMap);
    }
  }, [selectedMap]);

  const commonLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Rajdhani, sans-serif', color: '#b0b0b0' },
    xaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
    },
    margin: { t: 30, r: 20, l: 40, b: 40 },
  } as Partial<Plotly.Layout>;

  const createPerformanceChart = (timeseries: any) => {
    const matchProgression = timeseries.match_progression;
    if (!matchProgression || matchProgression.length === 0) return;

    const trace1 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.kills),
      mode: 'lines+markers',
      name: 'Kills',
      line: { color: '#4ade80', width: 3, shape: 'spline' },
      marker: { size: 8, color: '#4ade80', line: { color: '#fff', width: 1 } }
    };

    const trace2 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.deaths),
      mode: 'lines+markers',
      name: 'Deaths',
      line: { color: '#ff4655', width: 3, shape: 'spline' },
      marker: { size: 8, color: '#ff4655', line: { color: '#fff', width: 1 } }
    };

    const trace3 = {
      x: matchProgression.map((_: any, i: number) => i + 1),
      y: matchProgression.map((m: any) => m.kd_ratio),
      mode: 'lines+markers',
      name: 'K/D Ratio',
      yaxis: 'y2',
      line: { color: '#ffd700', width: 3, dash: 'dot' },
      marker: { size: 6, color: '#ffd700' }
    };

    const layout = {
      ...commonLayout,
      title: false,
      xaxis: {
        ...commonLayout.xaxis,
        title: 'Match Sequence',
        tickmode: 'array',
        tickvals: matchProgression.map((_: any, i: number) => i + 1),
        ticktext: matchProgression.map((m: any) => m.match_type)
      },
      yaxis: { ...commonLayout.yaxis, title: 'Count' },
      yaxis2: {
        title: 'K/D',
        overlaying: 'y',
        side: 'right',
        gridcolor: 'transparent',
        zeroline: false
      },
      hovermode: 'x unified',
      showlegend: true,
      legend: { orientation: 'h', y: 1.1 }
    };

    Plotly.newPlot('performance-chart', [trace1, trace2, trace3], layout, { responsive: true, displayModeBar: false });
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
      colorscale: [
        [0, '#0a0a0a'],
        [0.5, '#1a2a4a'],
        [1, '#00d4ff']
      ],
      xgap: 2,
      ygap: 2,
      hovertemplate: '<b>%{y}</b><br>%{x}: %{z:.2f}<extra></extra>'
    };

    const layout = {
      ...commonLayout,
      title: false,
      xaxis: { ...commonLayout.xaxis, side: 'top' },
      yaxis: { ...commonLayout.yaxis }
    };

    Plotly.newPlot('map-heatmap', [trace], layout, { responsive: true, displayModeBar: false });
  };

  const createMapSpecificCharts = (timeseries: any, mapName: string) => {
    const roundData = timeseries.round_by_round.filter((r: any) => r.map === mapName);
    if (!roundData || roundData.length === 0) return;

    const trace = {
      x: roundData.map((r: any) => r.round_number),
      y: roundData.map((r: any) => r.kills),
      mode: 'markers',
      marker: {
        size: roundData.map((r: any) => r.multi_kill ? 14 : 8),
        color: roundData.map((r: any) =>
          r.clutch_situation ? '#ffd700' :
            r.multi_kill ? '#ff4655' :
              '#4ade80'
        ),
        line: { width: 1, color: '#fff' },
        opacity: 0.8
      },
      text: roundData.map((r: any) =>
        `Round ${r.round_number}<br>Kills: ${r.kills}<br>Deaths: ${r.deaths}${r.multi_kill ? '<br>🔥 Multi-kill' : ''}${r.clutch_situation ? '<br>👑 Clutch' : ''}`
      ),
      hovertemplate: '%{text}<extra></extra>',
      name: 'Rounds'
    };

    const layout = {
      ...commonLayout,
      title: {
        text: `Impact on ${mapName}`,
        font: { size: 14, color: '#b0b0b0' }
      },
      xaxis: { ...commonLayout.xaxis, title: 'Round' },
      yaxis: { ...commonLayout.yaxis, title: 'Kills' },
      showlegend: false
    };

    Plotly.newPlot('rounds-chart', [trace], layout, { responsive: true, displayModeBar: false });
  };

  const createRoundsChart = (timeseries: any) => {
    if (selectedMap) {
      createMapSpecificCharts(timeseries, selectedMap);
    } else {
      const roundData = timeseries.round_by_round;
      if (!roundData || roundData.length === 0) return;

      const trace = {
        x: roundData.map((_: any, i: number) => i + 1),
        y: roundData.map((r: any) => r.kills),
        mode: 'markers',
        marker: {
          size: roundData.map((r: any) => r.multi_kill ? 10 : 5),
          color: roundData.map((r: any) =>
            r.clutch_situation ? '#ffd700' :
              r.multi_kill ? '#ff4655' :
                '#4ade80'
          ),
          opacity: 0.6
        },
        text: roundData.map((r: any) => `Map: ${r.map}<br>Kills: ${r.kills}`),
        hovertemplate: '%{text}<extra></extra>'
      };

      const layout = {
        ...commonLayout,
        title: { text: 'All Rounds Overview', font: { size: 14, color: '#b0b0b0' } },
        xaxis: { ...commonLayout.xaxis, title: 'Round Sequence' },
        yaxis: { ...commonLayout.yaxis, title: 'Kills' },
        showlegend: false
      };

      Plotly.newPlot('rounds-chart', [trace], layout, { responsive: true, displayModeBar: false });
    }
  };

  return (
    <section className="timeseries-section">
      <h2 className="section-title">📈 Player Analytics</h2>

      <div className="timeseries-container">
        <div className="player-selector">
          <h3 className="selector-title">Select Player</h3>
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
          <div className="loading-indicator">Loading analytics data...</div>
        )}

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
              <h4 className="chart-title">🎯 Performance Trend</h4>
              <div id="performance-chart" className="plotly-chart"></div>
            </div>

            <div className="chart-container">
              <h4 className="chart-title">🗺️ Map Matrix</h4>
              <div id="map-heatmap" className="plotly-chart"></div>
            </div>

            <div className="chart-container">
              <h4 className="chart-title">⚔️ Round Impact</h4>
              <div id="rounds-chart" className="plotly-chart"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerAnalyticsSection;
