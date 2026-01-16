import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Calendar, Wind } from 'lucide-react';

interface AQIData {
    date: string;
    aqi_hist?: number | null;
    aqi_forecast?: number | null;
}

export function AQITrends() {
    const [data, setData] = useState<AQIData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [histRes, fcRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/aqi/history`),
                fetch(`${API_BASE_URL}/api/aqi/forecast`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ days: 180 }) // 6 months forecast
                })
            ]);

            const histData = await histRes.json();
            const fcData = await fcRes.json();

            if (histData.status === 'success') {
                const fullHistory = histData.data.map((d: any) => ({
                    date: d.date,
                    aqi_hist: d.aqi,
                    aqi_forecast: null
                }));

                // Show only last 2 months (approx 60 days) of history as requested
                const history = fullHistory.slice(-60);

                let combined = [...history];

                if (fcData.status === 'success' && fcData.data.forecast) {
                    const forecast = fcData.data.forecast.map((d: any) => ({
                        date: d.date,
                        aqi_hist: null,
                        aqi_forecast: d.aqi
                    }));

                    // Connect the lines: use last historical point as first forecast point if possible
                    if (history.length > 0) {
                        const last = history[history.length - 1];
                        // Add a connection point to forecast array
                        forecast.unshift({
                            date: last.date,
                            aqi_hist: null,
                            aqi_forecast: last.aqi_hist
                        });
                    }

                    combined = [...history, ...forecast];
                }

                setData(combined);
            }
        } catch (e) {
            console.error("AQI Data error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 mt-6">
            <div className="glass-panel p-6 relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-white font-medium animate-pulse tracking-wide">Computing AI Forecast...</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wind className="w-5 h-5 text-secondary" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                            AQI Trends & AI Forecast
                        </span>
                    </h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.4)"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                                }}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.4)"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 5, 24, 0.9)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                itemStyle={{ color: '#fff' }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                type="monotone"
                                dataKey="aqi_hist"
                                stroke="#3b82f6" // Keep specific color or use var
                                strokeWidth={3}
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                name="Historical AQI"
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="aqi_forecast"
                                stroke="#d90282" // Neon Pink
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, fill: '#d90282', stroke: '#fff', strokeWidth: 2 }}
                                name="Predicted AQI"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-white/40 text-center mt-4 font-mono">
                    Analysis based on historical sensor data + predictive AI modeling.
                </p>
            </div>

            {/* AQI Hotspot Map Section */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="map">🗺️</span> Delhi AQI Hotspots
                    </h3>
                    <button
                        onClick={() => {
                            const img = document.getElementById('aqi-map-img') as HTMLImageElement;
                            if (img) {
                                img.src = `${API_BASE_URL}/api/aqi-map.png?t=${new Date().getTime()}`;
                            }
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                    >
                        Refresh Map
                    </button>
                </div>
                <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                    <img
                        id="aqi-map-img"
                        src={`${API_BASE_URL}/api/aqi-map.png`}
                        alt="AQI Hotspot Map"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('animate-pulse');
                        }}
                        onLoad={(e) => {
                            e.currentTarget.parentElement?.classList.remove('animate-pulse');
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/30 -z-10">
                        Generating Heatmap...
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-white/40">
                        Spatial analysis generated via Folium & Selenium.
                    </p>
                    <a
                        href={`${API_BASE_URL}/api/aqi-map`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors hover:underline"
                    >
                        Interactive View &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
}

