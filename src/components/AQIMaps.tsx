import { API_BASE_URL } from '../config';
export function AQIMaps() {
    return (
        <div className='flex gap-4'>

            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="map">🗺️</span> Delhi Coverage Heatmap
                    </h3>
                    <button
                        onClick={() => {
                            const img = document.getElementById('aqi-heatmap-img') as HTMLImageElement;
                            if (img) {
                                img.src = `${API_BASE_URL}/api/aqi-map/heatmap.png?refresh=true&t=${new Date().getTime()}`;
                            }
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                    >
                        Refresh Heatmap
                    </button>
                </div>
                <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                    <img
                        id="aqi-heatmap-img"
                        src={`${API_BASE_URL}/api/aqi-map/heatmap.png`}
                        alt="AQI Heatmap"
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
                        Clipped grid analysis via Folium & Geomapping.
                    </p>
                    <a
                        href={`${API_BASE_URL}/api/aqi-map/heatmap`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                    >
                        Interactive View &rarr;
                    </a>
                </div>
            </div>

            {/* 2. Hotspots Section (Previous One) */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="target">📍</span> Sensor Hotspots
                    </h3>
                    <button
                        onClick={() => {
                            const img = document.getElementById('aqi-hotspots-img') as HTMLImageElement;
                            if (img) {
                                img.src = `${API_BASE_URL}/api/aqi-map/hotspots.png?refresh=true&t=${new Date().getTime()}`;
                            }
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                    >
                        Refresh Hotspots
                    </button>
                </div>
                <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                    <img
                        id="aqi-hotspots-img"
                        src={`${API_BASE_URL}/api/aqi-map/hotspots.png`}
                        alt="AQI Hotspots"
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
                        Loading Hotspots...
                    </div>
                    {/* Removed overlay gradient */}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-white/40">
                        Live sensor readings from 40+ stations.
                    </p>
                    <a
                        href={`${API_BASE_URL}/api/aqi-map/hotspots`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                    >
                        Interactive View &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
}
