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
    Area,
    ComposedChart
} from 'recharts';
import { Scale, TrendingDown, Check, Calendar, Download } from 'lucide-react';

interface Policy {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    sector_impacts: {
        Aviation: number;
        Ground_Transport: number;
        Industry: number;
        Power: number;
        Residential: number;
    };
    details: {
        implementation_cost: string;
        public_acceptance: string;
        duration: string;
        last_implemented: string;
    };
}

interface ForecastPoint {
    date: string;
    emission: number;
    sectors: {
        Aviation: number;
        Ground_Transport: number;
        Industry: number;
        Power: number;
        Residential: number;
    };
}

interface ModelCalculation {
    delta_e: number;
    delta_e_pct: number;
    formula: string;
    sector_weights: Record<string, number>;
    combined_reductions: Record<string, number>;
    sector_contributions: Record<string, number>;
    total_contribution: number;
    calibration_d: number;
    model_name: string;
    interpretation: string;
}

interface SimulationResult {
    year?: number;
    baseline: ForecastPoint[];
    with_policy: ForecastPoint[];
    combined_impacts: Record<string, number>;
    model_calculation?: ModelCalculation;
    summary: {
        baseline_avg: number;
        adjusted_avg: number;
        change_pct: number;
        delta_e_pct?: number;
        total_reduction: number;
        yearly_baseline_total?: number;
        yearly_adjusted_total?: number;
        yearly_savings?: number;
    };
    applied_policies: { id: string; name: string; icon: string }[];
    data_points?: number;
}

export function PolicySimulator() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    const years = [2026, 2027, 2028];

    useEffect(() => {
        fetchPolicies();
    }, []);

    useEffect(() => {
        if (selectedPolicies.length > 0) {
            runSimulation();
        } else {
            setSimulation(null);
        }
    }, [selectedPolicies, selectedYear]);

    const fetchPolicies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/policies`);
            const result = await response.json();
            if (result.status === 'success') {
                setPolicies(result.policies);
            }
        } catch (e) {
            console.error("Error fetching policies:", e);
        } finally {
            setLoadingPolicies(false);
        }
    };

    const runSimulation = async () => {
        if (selectedPolicies.length === 0) return;

        setLoading(true);
        try {
            // Use the year-based endpoint with actual forecast data
            const response = await fetch(`${API_BASE_URL}/api/policies/simulate-year`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policy_ids: selectedPolicies,
                    year: selectedYear
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                setSimulation(result);
            }
        } catch (e) {
            console.error("Error running simulation:", e);
        } finally {
            setLoading(false);
        }
    };

    const togglePolicy = (policyId: string) => {
        setSelectedPolicies(prev =>
            prev.includes(policyId)
                ? prev.filter(id => id !== policyId)
                : [...prev, policyId]
        );
    };

    const getChartData = () => {
        if (!simulation) return [];

        // Sample data for smoother chart (every 7th day for yearly data)
        const data = simulation.baseline.map((baseline, index) => ({
            date: baseline.date,
            baseline: baseline.emission,
            withPolicy: simulation.with_policy[index]?.emission || baseline.emission
        }));

        // Sample every 7 days if we have a lot of data points
        if (data.length > 60) {
            return data.filter((_, idx) => idx % 7 === 0);
        }
        return data;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const getSectorIcon = (sector: string) => {
        switch (sector) {
            case 'Ground_Transport': return '🚗';
            case 'Industry': return '🏭';
            case 'Power': return '⚡';
            case 'Residential': return '🏠';
            case 'Aviation': return '✈️';
            default: return '📊';
        }
    };

    const generateReport = (): string => {
        if (!simulation) return '';

        const now = new Date();
        const policyNames = simulation.applied_policies.map(p => `${p.icon} ${p.name}`).join(', ');

        let report = `
======================================================================
            POLICY IMPACT SIMULATION REPORT - ${selectedYear}
======================================================================

Generated: ${now.toLocaleString()}
Forecast Year: ${selectedYear}
Policies Applied: ${policyNames}
Data Points: ${simulation.data_points || simulation.baseline.length} days

----------------------------------------------------------------------
                        SUMMARY STATISTICS
----------------------------------------------------------------------

  Baseline Daily Average:     ${simulation.summary.baseline_avg.toFixed(2)} kt CO₂
  With Policy Average:        ${simulation.summary.adjusted_avg.toFixed(2)} kt CO₂
  Daily Reduction:            ${simulation.summary.total_reduction.toFixed(2)} kt CO₂
  Percentage Change:          ${simulation.summary.change_pct.toFixed(2)}%
`;

        if (simulation.summary.yearly_baseline_total && simulation.summary.yearly_savings) {
            report += `
  Yearly Baseline Total:      ${(simulation.summary.yearly_baseline_total / 1000).toFixed(2)} Mt CO₂
  Yearly With Policy:         ${((simulation.summary.yearly_adjusted_total || 0) / 1000).toFixed(2)} Mt CO₂
  Yearly Savings:             ${(simulation.summary.yearly_savings / 1000).toFixed(2)} Mt CO₂
`;
        }

        report += `
----------------------------------------------------------------------
                     SECTOR IMPACT BREAKDOWN
----------------------------------------------------------------------

  Sector                      Impact         Change
  ------------------------------------------------------------------
`;

        Object.entries(simulation.combined_impacts).forEach(([sector, impact]) => {
            const impactPct = (impact * 100).toFixed(1);
            const direction = impact < 0 ? 'Reduction' : impact > 0 ? 'Increase' : 'No Change';
            const sectorLabel = sector.replace('_', ' ').padEnd(25);
            report += `  ${sectorLabel} ${impactPct.padStart(8)}%     ${direction}\n`;
        });

        if (simulation.model_calculation) {
            const mc = simulation.model_calculation;
            report += `
----------------------------------------------------------------------
               REDUCED-FORM MODEL CALCULATION
----------------------------------------------------------------------

  Model: ${mc.model_name}
  Formula: ΔE = D × Σ Bᵢ × (αᵢ/100)
  Calibration Constant (D): ${mc.calibration_d}
  
  SECTOR CONTRIBUTIONS:
  ------------------------------------------------------------------
  Sector                  Weight(Bᵢ)  Reduction(αᵢ)  Contribution
  ------------------------------------------------------------------
`;

            Object.entries(mc.sector_weights).forEach(([sector, weight]) => {
                const reduction = mc.combined_reductions[sector] || 0;
                const contribution = mc.sector_contributions[sector] || 0;
                const sectorLabel = sector.replace('_', ' ').padEnd(22);
                report += `  ${sectorLabel} ${(weight as number).toFixed(4).padStart(8)}   ${reduction.toFixed(1).padStart(10)}%   ${contribution.toFixed(6).padStart(12)}\n`;
            });

            report += `  ------------------------------------------------------------------
  TOTAL CONTRIBUTION (Σ):                          ${mc.total_contribution.toFixed(6)}
  
  CALCULATION:
  ${mc.formula}
  
  PROPORTIONAL CHANGE (ΔE): ${mc.delta_e_pct.toFixed(2)}% relative to BAU baseline
`;
        }

        report += `
----------------------------------------------------------------------
                         INTERPRETATION
----------------------------------------------------------------------

  This result represents a policy response proxy, not a causal prediction.
  Under the specified linear response model, the combined sector-weighted
  policy interventions yield an aggregate proportional change of
  ${simulation.model_calculation?.delta_e_pct.toFixed(2) || simulation.summary.change_pct.toFixed(2)}% relative to the business-as-usual (BAU) baseline.
  
  The result should be interpreted as a scenario comparison tool rather
  than an empirical forecast of actual emission changes.

----------------------------------------------------------------------
                      APPLIED POLICIES DETAIL
----------------------------------------------------------------------

`;

        simulation.applied_policies.forEach((p, idx) => {
            report += `  ${idx + 1}. ${p.icon} ${p.name}\n`;
        });

        report += `
======================================================================
                         END OF REPORT
======================================================================
`;

        return report;
    };

    const downloadReport = async () => {
        if (!simulation || selectedPolicies.length === 0) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/policies/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policy_ids: selectedPolicies,
                    year: selectedYear
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            // Get the blob from response
            const blob = await response.blob();
            const filename = `policy_simulation_${selectedYear}_report.txt`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    return (
        <div className="glass-panel p-6 mt-6">
            {/* Header with Year Selector */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        Policy Impact Simulator
                    </span>
                    {simulation && (
                        <span className="text-xs font-normal bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 ml-2">
                            {selectedYear} Forecast
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Year Selector */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10">
                            {years.map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${selectedYear === year
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>
                    {simulation && (
                        <button
                            onClick={downloadReport}
                            className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full transition-all border border-emerald-500/30"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Report
                        </button>
                    )}
                    {selectedPolicies.length > 0 && (
                        <button
                            onClick={() => setSelectedPolicies([])}
                            className="text-xs bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-full transition-all border border-white/10"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Policy Selection */}
            <div className="mb-6">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Select Policies to Simulate</div>
                {loadingPolicies ? (
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-32 bg-white/5 rounded-full animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {policies.map(policy => {
                            const isSelected = selectedPolicies.includes(policy.id);
                            return (
                                <button
                                    key={policy.id}
                                    onClick={() => togglePolicy(policy.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span>{policy.icon}</span>
                                    <span>{policy.name}</span>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Simulation Results */}
            {loading && (
                <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-white/60 animate-pulse">Running {selectedYear} simulation...</div>
                    </div>
                </div>
            )}

            {!loading && simulation && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Baseline Daily Avg</div>
                            <div className="text-xl font-bold text-white/60">{simulation.summary.baseline_avg.toFixed(1)} kt</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">With Policy</div>
                            <div className="text-xl font-bold text-emerald-400">{simulation.summary.adjusted_avg.toFixed(1)} kt</div>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                            <div className="text-[10px] text-emerald-400/60 uppercase tracking-wider mb-1">Reduction</div>
                            <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                                <TrendingDown className="w-5 h-5" />
                                {Math.abs(simulation.summary.change_pct).toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Daily Savings</div>
                            <div className="text-xl font-bold text-white">{simulation.summary.total_reduction.toFixed(1)} kt</div>
                        </div>
                        {simulation.summary.yearly_savings && (
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                <div className="text-[10px] text-blue-400/60 uppercase tracking-wider mb-1">{selectedYear} Total Saved</div>
                                <div className="text-xl font-bold text-blue-400">{(simulation.summary.yearly_savings / 1000).toFixed(1)} Mt</div>
                            </div>
                        )}
                    </div>

                    {/* Chart with Year Label */}
                    <div className="mb-2">
                        <div className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                            <span>📈 Emission Forecast Comparison</span>
                            <span className="text-blue-400 font-bold">{selectedYear}</span>
                            <span className="text-white/20">|</span>
                            <span className="text-white/30">{simulation.data_points || getChartData().length * 7} days of data</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={getChartData()}>
                                <defs>
                                    <linearGradient id="policyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.4)"
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    tickFormatter={formatDate}
                                    interval={Math.floor(getChartData().length / 8)}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.4)"
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    domain={['auto', 'auto']}
                                    label={{ value: 'kt CO₂/day', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 5, 24, 0.95)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number | undefined, name: string | undefined) => {
                                        if (value === undefined) return ['-', name ?? ''];
                                        // Map dataKey to proper labels
                                        if (name === 'baseline' || name === 'Baseline (No Policy)') {
                                            return [`${value.toFixed(2)} kt CO₂`, 'Baseline (No Policy)'];
                                        } else if (name === 'withPolicy' || name === 'With Selected Policies') {
                                            return [`${value.toFixed(2)} kt CO₂`, 'With Policy'];
                                        }
                                        return [`${value.toFixed(2)} kt CO₂`, name ?? ''];
                                    }}
                                    labelFormatter={(dateStr) => {
                                        const date = new Date(dateStr);
                                        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="withPolicy"
                                    fill="url(#policyGradient)"
                                    stroke="transparent"
                                    legendType="none"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="baseline"
                                    stroke="#6b7280"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Baseline (No Policy)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="withPolicy"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                    name="With Selected Policies"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sector Impact Breakdown */}
                    <div className="border-t border-white/10 pt-6">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-4">Sector Impact Breakdown</div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(simulation.combined_impacts).map(([sector, impact]) => {
                                const impactPct = (impact * 100).toFixed(1);
                                const isReduction = impact < 0;
                                return (
                                    <div
                                        key={sector}
                                        className={`p-3 rounded-xl border ${isReduction
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : impact > 0
                                                ? 'bg-red-500/5 border-red-500/20'
                                                : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{getSectorIcon(sector)}</span>
                                            <span className="text-xs text-white/60">{sector.replace('_', ' ')}</span>
                                        </div>
                                        <div className={`text-lg font-bold ${isReduction
                                            ? 'text-emerald-400'
                                            : impact > 0
                                                ? 'text-red-400'
                                                : 'text-white/40'
                                            }`}>
                                            {impact > 0 ? '+' : ''}{impactPct}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Model Calculation Display */}
                    {simulation.model_calculation && (
                        <div className="border-t border-white/10 pt-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs text-white/40 uppercase tracking-wider">
                                    {simulation.model_calculation.model_name}
                                </div>
                                <div className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                                    ΔE = D × Σ Bᵢ × (αᵢ/100)
                                </div>
                            </div>

                            {/* Formula Result */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-xl border border-purple-500/20 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Proportional Change (ΔE)</div>
                                        <div className="text-2xl font-bold text-purple-400">
                                            {simulation.model_calculation.delta_e_pct.toFixed(2)}%
                                        </div>
                                        <div className="text-xs text-white/30 mt-1">relative to BAU baseline</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/40 font-mono bg-black/30 px-3 py-2 rounded-lg">
                                            {simulation.model_calculation.formula}
                                        </div>
                                        <div className="text-[10px] text-white/30 mt-2">
                                            D = {simulation.model_calculation.calibration_d} (calibration constant)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sector Contributions Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-white/40 border-b border-white/10">
                                            <th className="text-left py-2 px-2">Sector</th>
                                            <th className="text-right py-2 px-2">Weight (Bᵢ)</th>
                                            <th className="text-right py-2 px-2">Reduction (αᵢ)</th>
                                            <th className="text-right py-2 px-2">Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(simulation.model_calculation.sector_weights).map(([sector, weight]) => {
                                            const reduction = simulation.model_calculation!.combined_reductions[sector] || 0;
                                            const contribution = simulation.model_calculation!.sector_contributions[sector] || 0;
                                            return (
                                                <tr key={sector} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2 px-2 text-white/70">
                                                        <span className="mr-2">{getSectorIcon(sector)}</span>
                                                        {sector.replace('_', ' ')}
                                                    </td>
                                                    <td className="py-2 px-2 text-right text-white/50 font-mono">
                                                        {(weight as number).toFixed(4)}
                                                    </td>
                                                    <td className="py-2 px-2 text-right font-mono">
                                                        <span className={reduction > 0 ? 'text-emerald-400' : reduction < 0 ? 'text-red-400' : 'text-white/30'}>
                                                            {reduction > 0 ? '-' : ''}{Math.abs(reduction).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 text-right text-purple-400 font-mono">
                                                        {contribution.toFixed(6)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="border-t border-white/20">
                                            <td colSpan={3} className="py-2 px-2 text-right text-white/60 font-bold">Total Σ</td>
                                            <td className="py-2 px-2 text-right text-purple-400 font-mono font-bold">
                                                {simulation.model_calculation.total_contribution.toFixed(6)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Interpretation Note */}
                            <div className="mt-4 text-[10px] text-white/30 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                <span className="text-white/50 font-bold">Note:</span> {simulation.model_calculation.interpretation}
                            </div>
                        </div>
                    )}

                    {/* Applied Policies */}
                    <div className="mt-6 flex items-center gap-2 text-xs text-white/40 flex-wrap">
                        <span>Active:</span>
                        {simulation.applied_policies.map(p => (
                            <span key={p.id} className="bg-white/10 px-2 py-1 rounded-full">
                                {p.icon} {p.name}
                            </span>
                        ))}
                    </div>
                </>
            )}

            {/* Empty State */}
            {!loading && !simulation && (
                <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                    <div className="text-center">
                        <Scale className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">Select one or more policies above to see their impact on <span className="text-blue-400 font-bold">{selectedYear}</span></p>
                        <p className="text-white/20 text-xs mt-1">Policies can be combined for cumulative effect</p>
                    </div>
                </div>
            )}
        </div>
    );
}
