import { useState } from 'react';
import { API_BASE_URL } from '../config';

const SECTORS = [
    { id: 'Industry', label: 'Industry', icon: '🏭', color: 'red' },
    { id: 'Transport', label: 'Transport', icon: '🚗', color: 'yellow' },
    { id: 'Power', label: 'Power', icon: '⚡', color: 'purple' },
    { id: 'Residential', label: 'Residential', icon: '🏠', color: 'green' },
    { id: 'Aviation', label: 'Aviation', icon: '✈️', color: 'orange' },
    { id: 'Commercial', label: 'Commercial', icon: '🏢', color: 'blue' },
];

export function SectorMaps() {
    const [selectedSector, setSelectedSector] = useState<string>('Industry');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const getSectorColor = () => {
        const sector = SECTORS.find(s => s.id === selectedSector);
        return sector?.color || 'gray';
    };

    const handleSectorChange = (sector: string) => {
        setSelectedSector(sector);
        setIsLoading(true);

        // Refresh both images
        const heatmapImg = document.getElementById('sector-heatmap-img') as HTMLImageElement;
        const hotspotsImg = document.getElementById('sector-hotspots-img') as HTMLImageElement;

        if (heatmapImg) {
            heatmapImg.src = `${API_BASE_URL}/api/emission-map/sector/heatmap.png?sector=${sector}&refresh=true&t=${Date.now()}`;
        }
        if (hotspotsImg) {
            const yearParam = selectedYear ? `&year=${selectedYear}` : '';
            hotspotsImg.src = `${API_BASE_URL}/api/emission-map/sector/hotspots.png?sector=${sector}${yearParam}&refresh=true&t=${Date.now()}`;
        }
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setIsLoading(true);

        const hotspotsImg = document.getElementById('sector-hotspots-img') as HTMLImageElement;
        if (hotspotsImg) {
            const yearParam = year ? `&year=${year}` : '';
            hotspotsImg.src = `${API_BASE_URL}/api/emission-map/sector/hotspots.png?sector=${selectedSector}${yearParam}&refresh=true&t=${Date.now()}`;
        }
    };

    const sectorInfo = SECTORS.find(s => s.id === selectedSector);

    return (
        <div className="flex flex-col gap-4">
            {/* Sector Selector Bar */}
            <div className="glass-panel p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span role="img" aria-label="sectors">📊</span> Sector-Specific Emissions
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {SECTORS.map((sector) => (
                            <button
                                key={sector.id}
                                onClick={() => handleSectorChange(sector.id)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-all border flex items-center gap-1.5 ${selectedSector === sector.id
                                        ? `bg-${sector.color}-500/30 text-${sector.color}-300 border-${sector.color}-500/50`
                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                    }`}
                                style={{
                                    backgroundColor: selectedSector === sector.id ? `var(--sector-${sector.color}-bg, rgba(255,255,255,0.1))` : undefined,
                                    borderColor: selectedSector === sector.id ? `var(--sector-${sector.color}-border, rgba(255,255,255,0.2))` : undefined,
                                }}
                            >
                                <span>{sector.icon}</span>
                                {sector.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Maps Row */}
            <div className='flex gap-4'>
                {/* 1. Sector Heatmap */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>{sectorInfo?.icon || '📍'}</span> {selectedSector} Heatmap
                        </h3>
                        <button
                            onClick={() => handleSectorChange(selectedSector)}
                            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group">
                        <img
                            id="sector-heatmap-img"
                            src={`${API_BASE_URL}/api/emission-map/sector/heatmap.png?sector=${selectedSector}`}
                            alt={`${selectedSector} Emission Heatmap`}
                            className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-50' : ''}`}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('animate-pulse');
                            }}
                            onLoad={(e) => {
                                e.currentTarget.parentElement?.classList.remove('animate-pulse');
                                e.currentTarget.style.display = 'block';
                                setIsLoading(false);
                            }}
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/30 -z-10">
                            {isLoading ? `Generating ${selectedSector} heatmap...` : 'Loading...'}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-white/40">
                            {selectedSector} emission concentration across Delhi zones.
                        </p>
                        <a
                            href={`${API_BASE_URL}/api/emission-map/sector/heatmap?sector=${selectedSector}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                        >
                            Interactive View &rarr;
                        </a>
                    </div>
                </div>

                {/* 2. Sector Hotspots */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>{sectorInfo?.icon || '📍'}</span> {selectedSector} Hotspots
                            {selectedYear && (
                                <span className="text-xs font-normal bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/50">
                                    {selectedYear} Forecast
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
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
                            id="sector-hotspots-img"
                            src={`${API_BASE_URL}/api/emission-map/sector/hotspots.png?sector=${selectedSector}`}
                            alt={`${selectedSector} Emission Sources`}
                            className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-50' : ''}`}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('animate-pulse');
                            }}
                            onLoad={(e) => {
                                e.currentTarget.parentElement?.classList.remove('animate-pulse');
                                e.currentTarget.style.display = 'block';
                                setIsLoading(false);
                            }}
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/30 -z-10">
                            {isLoading ? `Loading ${selectedSector} sources...` : 'Loading...'}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-white/40">
                            {selectedYear
                                ? `${selectedSector} emission sources for ${selectedYear}.`
                                : `${selectedSector} emission source locations.`
                            }
                        </p>
                        <a
                            href={selectedYear
                                ? `${API_BASE_URL}/api/emission-map/sector/hotspots?sector=${selectedSector}&year=${selectedYear}`
                                : `${API_BASE_URL}/api/emission-map/sector/hotspots?sector=${selectedSector}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-secondary hover:text-white transition-colors hover:underline flex items-center gap-1"
                        >
                            Interactive View &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
