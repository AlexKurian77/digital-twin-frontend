import { useState } from 'react';
import { API_BASE_URL } from '../config';

export function EmissionMaps() {
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const getHotspotsUrl = () => {
        const baseUrl = `${API_BASE_URL}/api/emission-map/hotspots.png`;
        if (selectedYear) {
            return `${baseUrl}?year=${selectedYear}&t=${new Date().getTime()}`;
        }
        return `${baseUrl}?t=${new Date().getTime()}`;
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setIsLoading(true);
        const img = document.getElementById('emission-hotspots-img') as HTMLImageElement;
        if (img) {
            const baseUrl = `${API_BASE_URL}/api/emission-map/hotspots.png`;
            if (year) {
                img.src = `${baseUrl}?year=${year}&refresh=true&t=${new Date().getTime()}`;
            } else {
                img.src = `${baseUrl}?refresh=true&t=${new Date().getTime()}`;
            }
        }
    };

    return (
        <div className='flex gap-4'>
            {/* 1. Heatmap Section */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="map">🌡️</span> CO₂ Emission Heatmap
                    </h3>
                    <button
                        onClick={() => {
                            const img = document.getElementById('emission-heatmap-img') as HTMLImageElement;
                            if (img) {
                                img.src = `${API_BASE_URL}/api/emission-map/heatmap.png?refresh=true&t=${new Date().getTime()}`;
                            }
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                    >
                        Refresh Heatmap
                    </button>
                </div>
                <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                    <img
                        id="emission-heatmap-img"
                        src={`${API_BASE_URL}/api/emission-map/heatmap.png`}
                        alt="CO2 Emission Heatmap"
                        className="w-full h-full object-cover transition-all duration-700"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('animate-pulse');
                        }}
                        onLoad={(e) => {
                            e.currentTarget.parentElement?.classList.remove('animate-pulse');
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/30 -z-10">
                        Loading Heatmap...
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-white/40">
                        Grid-based CO₂ concentration analysis across Delhi.
                    </p>
                    <a
                        href={`${API_BASE_URL}/api/emission-map/heatmap`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                    >
                        Interactive View &rarr;
                    </a>
                </div>
            </div>

            {/* 2. Hotspots Section with Year Dropdown */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="factory">🏭</span> Emission Sources
                        {selectedYear && (
                            <span className="text-xs font-normal bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/50">
                                {selectedYear} Forecast
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Year Dropdown */}
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10 cursor-pointer appearance-none pr-6"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.2em 1.2em'
                            }}
                        >
                            <option value="" className="bg-gray-900">Baseline</option>
                            <option value="2026" className="bg-gray-900">2026</option>
                            <option value="2027" className="bg-gray-900">2027</option>
                            <option value="2028" className="bg-gray-900">2028</option>
                        </select>
                        <button
                            onClick={() => handleYearChange(selectedYear)}
                            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                    <img
                        id="emission-hotspots-img"
                        src={`${API_BASE_URL}/api/emission-map/hotspots.png`}
                        alt="CO2 Emission Sources"
                        className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-50' : ''}`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('animate-pulse');
                            setIsLoading(false);
                        }}
                        onLoad={(e) => {
                            e.currentTarget.parentElement?.classList.remove('animate-pulse');
                            e.currentTarget.style.display = 'block';
                            setIsLoading(false);
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/30 -z-10">
                        {isLoading ? 'Generating forecast...' : 'Loading Emission Sources...'}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-white/40">
                        {selectedYear
                            ? `Projected CO₂ sources based on ${selectedYear} emission forecasts.`
                            : 'Sector-wise emission sources: Industry, Transport, Power, Residential.'
                        }
                    </p>
                    <a
                        href={selectedYear
                            ? `${API_BASE_URL}/api/emission-map/hotspots?year=${selectedYear}`
                            : `${API_BASE_URL}/api/emission-map/hotspots`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                    >
                        Interactive View &rarr;
                    </a>
                </div>
            </div>

            {/* Legend */}
            <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-xs z-50 hidden lg:block">
                <div className="font-bold text-white mb-2">Emission Sources</div>
                <div className="space-y-1 text-white/70">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span> Industry
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span> Aviation
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Transport
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span> Power
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Residential
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Commercial
                    </div>
                </div>
            </div>
        </div>
    );
}
