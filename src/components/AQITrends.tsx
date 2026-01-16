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
        <div className="flex flex-col mt-4 gap-6 h-full">

            <div className="glass-panel p-6 relative h-full min-h-[400px]">
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
                                stroke="#4ade80" // Green
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                                name="Predicted AQI"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-white/40 text-center mt-4 font-mono">
                    Analysis based on historical sensor data + predictive AI modeling.
                </p>
            </div>

            {/* 1. Heatmap Section */}

        </div>
    );
}

