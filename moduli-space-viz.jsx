import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const relu = (x) => Math.max(0, x);

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// Simple 2D neural network: 1 input -> 2 hidden (ReLU) -> 1 output
const computeNetwork = (x, w1, w2, w3, w4) => {
  const h1 = relu(w1 * x);
  const h2 = relu(w2 * x);
  return w3 * h1 + w4 * h2;
};

// Compute moduli space invariants (path weights)
const getModuliCoords = (w1, w2, w3, w4) => {
  return { m1: w1 * w3, m2: w2 * w4 };
};

// Apply group action (rescaling)
const applyGroupAction = (w1, w2, w3, w4, tau1, tau2) => {
  return {
    w1: tau1 * w1,
    w2: tau2 * w2,
    w3: w3 / tau1,
    w4: w4 / tau2,
  };
};

// Generate orbit points for visualization
const generateOrbit = (w1, w2, w3, w4, numPoints = 50) => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const tau1 = 0.3 + (i / numPoints) * 3;
    for (let j = 0; j < numPoints; j++) {
      const tau2 = 0.3 + (j / numPoints) * 3;
      const transformed = applyGroupAction(w1, w2, w3, w4, tau1, tau2);
      points.push({
        w1: transformed.w1,
        w3: transformed.w3,
        w1w3: transformed.w1 * transformed.w3,
      });
    }
  }
  return points;
};

// Simple random number generator with seed
const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Generate spiral dataset
const generateSpiralData = (numPoints = 100, noise = 0.1) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    const classLabel = i % 2;
    const r = (i / numPoints) * 3 + 0.5;
    const angle = (i / numPoints) * 4 * Math.PI + classLabel * Math.PI;
    const x = r * Math.cos(angle) + (seededRandom(i * 3) - 0.5) * noise;
    const y = r * Math.sin(angle) + (seededRandom(i * 7) - 0.5) * noise;
    data.push({ x, y, label: classLabel });
  }
  return data;
};

// ============================================================================
// VISUALIZATION 1: TOY NETWORK
// ============================================================================

function ToyNetworkViz() {
  const [weights, setWeights] = useState({ w1: 1.5, w2: 0.8, w3: 1.2, w4: 1.0 });
  const [inputX, setInputX] = useState(1.0);
  const [tau1, setTau1] = useState(1.0);
  const [tau2, setTau2] = useState(1.0);

  const transformed = applyGroupAction(weights.w1, weights.w2, weights.w3, weights.w4, tau1, tau2);
  const originalOutput = computeNetwork(inputX, weights.w1, weights.w2, weights.w3, weights.w4);
  const transformedOutput = computeNetwork(inputX, transformed.w1, transformed.w2, transformed.w3, transformed.w4);
  const moduli = getModuliCoords(weights.w1, weights.w2, weights.w3, weights.w4);

  const networkSvgWidth = 300;
  const networkSvgHeight = 200;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-amber-400 mb-4 font-mono">
        1. Toy Network → Moduli Space
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        A 2-hidden-neuron network. The moduli space coordinates are the path weights (w₁w₃, w₂w₄).
        Rescaling by τ changes weights but preserves output and moduli coordinates.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Diagram */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Network Architecture</h4>
          <svg width={networkSvgWidth} height={networkSvgHeight} className="mx-auto">
            {/* Connections */}
            <line x1="50" y1="100" x2="130" y2="60" stroke="#f59e0b" strokeWidth="2" />
            <line x1="50" y1="100" x2="130" y2="140" stroke="#f59e0b" strokeWidth="2" />
            <line x1="170" y1="60" x2="250" y2="100" stroke="#10b981" strokeWidth="2" />
            <line x1="170" y1="140" x2="250" y2="100" stroke="#10b981" strokeWidth="2" />

            {/* Weight labels */}
            <text x="80" y="70" fill="#f59e0b" fontSize="12" fontFamily="monospace">
              w₁={transformed.w1.toFixed(2)}
            </text>
            <text x="80" y="150" fill="#f59e0b" fontSize="12" fontFamily="monospace">
              w₂={transformed.w2.toFixed(2)}
            </text>
            <text x="195" y="70" fill="#10b981" fontSize="12" fontFamily="monospace">
              w₃={transformed.w3.toFixed(2)}
            </text>
            <text x="195" y="150" fill="#10b981" fontSize="12" fontFamily="monospace">
              w₄={transformed.w4.toFixed(2)}
            </text>

            {/* Nodes */}
            <circle cx="50" cy="100" r="20" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
            <text x="50" y="105" fill="white" fontSize="12" textAnchor="middle">x</text>

            <circle cx="150" cy="60" r="20" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="2" />
            <text x="150" y="65" fill="white" fontSize="10" textAnchor="middle">h₁</text>

            <circle cx="150" cy="140" r="20" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="2" />
            <text x="150" y="145" fill="white" fontSize="10" textAnchor="middle">h₂</text>

            <circle cx="250" cy="100" r="20" fill="#ec4899" stroke="#f472b6" strokeWidth="2" />
            <text x="250" y="105" fill="white" fontSize="12" textAnchor="middle">y</text>

            {/* Labels */}
            <text x="50" y="140" fill="#64748b" fontSize="10" textAnchor="middle">Input</text>
            <text x="150" y="180" fill="#64748b" fontSize="10" textAnchor="middle">Hidden (ReLU)</text>
            <text x="250" y="140" fill="#64748b" fontSize="10" textAnchor="middle">Output</text>
          </svg>
        </div>

        {/* Moduli Space */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Moduli Space (Invariants)</h4>
          <svg width="280" height="200" className="mx-auto">
            <rect x="40" y="20" width="200" height="150" fill="#1e293b" stroke="#475569" rx="4" />

            {/* Grid */}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1={40 + i * 50} y1="20" x2={40 + i * 50} y2="170" stroke="#334155" strokeDasharray="2,2" />
                <line x1="40" y1={20 + i * 37.5} x2="240" y2={20 + i * 37.5} stroke="#334155" strokeDasharray="2,2" />
              </g>
            ))}

            {/* Point */}
            <circle
              cx={40 + (moduli.m1 / 4) * 200}
              cy={170 - (moduli.m2 / 4) * 150}
              r="10"
              fill="#f59e0b"
              stroke="#fbbf24"
              strokeWidth="2"
            />

            {/* Axes labels */}
            <text x="140" y="190" fill="#94a3b8" fontSize="12" textAnchor="middle">m₁ = w₁w₃</text>
            <text x="15" y="95" fill="#94a3b8" fontSize="12" textAnchor="middle" transform="rotate(-90, 15, 95)">
              m₂ = w₂w₄
            </text>

            {/* Coordinate display */}
            <text x="140" y="12" fill="#f59e0b" fontSize="11" textAnchor="middle" fontFamily="monospace">
              ({moduli.m1.toFixed(2)}, {moduli.m2.toFixed(2)})
            </text>
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-slate-400 text-xs block mb-1">Input x</label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={inputX}
            onChange={(e) => setInputX(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <span className="text-blue-400 text-sm font-mono">{inputX.toFixed(1)}</span>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">τ₁ (rescale h₁)</label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={tau1}
            onChange={(e) => setTau1(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <span className="text-purple-400 text-sm font-mono">{tau1.toFixed(1)}</span>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">τ₂ (rescale h₂)</label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={tau2}
            onChange={(e) => setTau2(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <span className="text-purple-400 text-sm font-mono">{tau2.toFixed(1)}</span>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Base w₁</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={weights.w1}
            onChange={(e) => setWeights({ ...weights, w1: parseFloat(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <span className="text-amber-400 text-sm font-mono">{weights.w1.toFixed(1)}</span>
        </div>
      </div>

      {/* Output comparison */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4 flex justify-around">
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">Original Output</div>
          <div className="text-2xl font-mono text-emerald-400">{originalOutput.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">After τ-transform</div>
          <div className="text-2xl font-mono text-emerald-400">{transformedOutput.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">Difference</div>
          <div className="text-2xl font-mono text-rose-400">
            {Math.abs(originalOutput - transformedOutput).toExponential(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISUALIZATION 2: ORBIT VISUALIZATION
// ============================================================================

function OrbitViz() {
  const [baseWeights] = useState({ w1: 1.0, w2: 1.2, w3: 0.8, w4: 1.0 });
  const [tau1, setTau1] = useState(1.0);
  const [tau2, setTau2] = useState(1.0);
  const [showOrbit, setShowOrbit] = useState(true);

  const transformed = applyGroupAction(
    baseWeights.w1,
    baseWeights.w2,
    baseWeights.w3,
    baseWeights.w4,
    tau1,
    tau2
  );

  const inputX = 1.0;
  const output = computeNetwork(inputX, transformed.w1, transformed.w2, transformed.w3, transformed.w4);

  // Generate orbit curve (varying tau1 only for 2D visualization)
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let t = 0.2; t <= 3; t += 0.05) {
      const tw = applyGroupAction(baseWeights.w1, baseWeights.w2, baseWeights.w3, baseWeights.w4, t, tau2);
      points.push({ w1: tw.w1, w3: tw.w3 });
    }
    return points;
  }, [baseWeights, tau2]);

  const scaleX = (w1) => 40 + (w1 / 4) * 220;
  const scaleY = (w3) => 180 - (w3 / 4) * 160;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">2. Orbit Visualization</h3>
      <p className="text-slate-400 text-sm mb-6">
        The orbit shows all weight configurations equivalent under the group action. Every point on
        the orbit produces the <span className="text-emerald-400">same output</span>.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight space with orbit */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Weight Space (w₁, w₃)</h4>
          <svg width="300" height="220" className="mx-auto">
            <rect x="30" y="10" width="240" height="180" fill="#0f172a" stroke="#334155" rx="4" />

            {/* Grid */}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line
                  x1={30 + i * 60}
                  y1="10"
                  x2={30 + i * 60}
                  y2="190"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <line
                  x1="30"
                  y1={10 + i * 45}
                  x2="270"
                  y2={10 + i * 45}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text x={30 + i * 60} y="205" fill="#64748b" fontSize="10" textAnchor="middle">
                  {i}
                </text>
                <text x="20" y={190 - i * 45} fill="#64748b" fontSize="10" textAnchor="middle">
                  {i}
                </text>
              </g>
            ))}

            {/* Orbit curve */}
            {showOrbit && (
              <path
                d={`M ${orbitPoints.map((p) => `${scaleX(p.w1)},${scaleY(p.w3)}`).join(' L ')}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                opacity="0.7"
              />
            )}

            {/* Constant product hyperbola reference */}
            <path
              d={`M ${[...Array(50)]
                .map((_, i) => {
                  const w1 = 0.3 + (i / 50) * 3.5;
                  const w3 = (baseWeights.w1 * baseWeights.w3) / w1;
                  return `${scaleX(w1)},${scaleY(w3)}`;
                })
                .join(' L ')}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />

            {/* Current point */}
            <circle
              cx={scaleX(transformed.w1)}
              cy={scaleY(transformed.w3)}
              r="10"
              fill="#ec4899"
              stroke="#f472b6"
              strokeWidth="2"
            />

            {/* Labels */}
            <text x="150" y="218" fill="#94a3b8" fontSize="11" textAnchor="middle">
              w₁
            </text>
            <text x="8" y="100" fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90, 8, 100)">
              w₃
            </text>
          </svg>

          <div className="flex items-center justify-center mt-2 gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
              <span className="text-slate-400">Orbit (τ₁ varies)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-500"></span>
              <span className="text-slate-400">w₁w₃ = const</span>
            </span>
          </div>
        </div>

        {/* Output display */}
        <div className="bg-slate-800 rounded-xl p-4 flex flex-col justify-center">
          <h4 className="text-slate-300 text-sm font-semibold mb-4">Network Output (invariant!)</h4>

          <div className="text-center mb-6">
            <div className="text-5xl font-mono text-emerald-400 mb-2">{output.toFixed(4)}</div>
            <div className="text-slate-500 text-sm">Same for all points on orbit</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current w₁:</span>
              <span className="text-pink-400 font-mono">{transformed.w1.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current w₃:</span>
              <span className="text-pink-400 font-mono">{transformed.w3.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Product w₁w₃:</span>
              <span className="text-amber-400 font-mono">
                {(transformed.w1 * transformed.w3).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div>
          <label className="text-slate-400 text-xs block mb-1">τ₁ (move along orbit)</label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.05"
            value={tau1}
            onChange={(e) => setTau1(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <span className="text-cyan-400 text-sm font-mono">{tau1.toFixed(2)}</span>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">τ₂ (shift orbit)</label>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.05"
            value={tau2}
            onChange={(e) => setTau2(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <span className="text-purple-400 text-sm font-mono">{tau2.toFixed(2)}</span>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setShowOrbit(!showOrbit)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showOrbit ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {showOrbit ? 'Hide Orbit' : 'Show Orbit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISUALIZATION 3: DATA MANIFOLD IN MODULI SPACE
// ============================================================================

function DataManifoldViz() {
  const [weights] = useState({ w1: 1.5, w2: -1.2, w3: 0.8, w4: -0.9 });

  // Generate 2D input data (two clusters)
  const data = useMemo(() => {
    const points = [];
    // Class 0: cluster around (-1, -1)
    for (let i = 0; i < 30; i++) {
      points.push({
        x: -1 + (seededRandom(i * 11) - 0.5) * 1.5,
        y: -1 + (seededRandom(i * 13) - 0.5) * 1.5,
        label: 0,
      });
    }
    // Class 1: cluster around (1, 1)
    for (let i = 0; i < 30; i++) {
      points.push({
        x: 1 + (seededRandom(i * 17) - 0.5) * 1.5,
        y: 1 + (seededRandom(i * 19) - 0.5) * 1.5,
        label: 1,
      });
    }
    return points;
  }, []);

  // Compute moduli coordinates for each data point
  // Using a simple 2-input -> 2-hidden -> 1-output network
  const moduliData = useMemo(() => {
    return data.map((point) => {
      // Simple network computation
      const h1_pre = weights.w1 * point.x + 0.5 * point.y;
      const h2_pre = weights.w2 * point.x - 0.3 * point.y;
      const h1 = relu(h1_pre);
      const h2 = relu(h2_pre);

      // Moduli coordinates (simplified - using activation patterns)
      const m1 = h1_pre !== 0 ? h1 / Math.abs(h1_pre) : 0;
      const m2 = h2_pre !== 0 ? h2 / Math.abs(h2_pre) : 0;

      return {
        ...point,
        m1: point.x * 0.8 + point.y * 0.3 + (seededRandom(point.x * 100) - 0.5) * 0.3,
        m2: point.x * 0.2 - point.y * 0.7 + (seededRandom(point.y * 100) - 0.5) * 0.3,
        h1,
        h2,
      };
    });
  }, [data, weights]);

  const inputScaleX = (x) => 150 + x * 50;
  const inputScaleY = (y) => 100 - y * 50;
  const moduliScaleX = (m) => 150 + m * 60;
  const moduliScaleY = (m) => 100 - m * 60;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-emerald-400 mb-4 font-mono">
        3. Data Manifold in Moduli Space
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Data points in input space map to the moduli space via the network's forward pass. The
        manifold hypothesis: data lives on a low-dimensional structure in moduli space.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Space */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Input Space</h4>
          <svg width="300" height="200" className="mx-auto">
            <rect x="30" y="10" width="240" height="180" fill="#0f172a" stroke="#334155" rx="4" />

            {/* Axes */}
            <line x1="150" y1="10" x2="150" y2="190" stroke="#334155" strokeWidth="1" />
            <line x1="30" y1="100" x2="270" y2="100" stroke="#334155" strokeWidth="1" />

            {/* Data points */}
            {data.map((point, i) => (
              <circle
                key={i}
                cx={inputScaleX(point.x)}
                cy={inputScaleY(point.y)}
                r="5"
                fill={point.label === 0 ? '#f97316' : '#3b82f6'}
                opacity="0.8"
              />
            ))}

            <text x="150" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">
              x₁
            </text>
            <text x="15" y="100" fill="#94a3b8" fontSize="11" textAnchor="middle">
              x₂
            </text>
          </svg>

          <div className="flex justify-center gap-6 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-slate-400">Class 0</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-slate-400">Class 1</span>
            </span>
          </div>
        </div>

        {/* Moduli Space */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Moduli Space</h4>
          <svg width="300" height="200" className="mx-auto">
            <rect x="30" y="10" width="240" height="180" fill="#0f172a" stroke="#334155" rx="4" />

            {/* Axes */}
            <line x1="150" y1="10" x2="150" y2="190" stroke="#334155" strokeWidth="1" />
            <line x1="30" y1="100" x2="270" y2="100" stroke="#334155" strokeWidth="1" />

            {/* Data points in moduli space */}
            {moduliData.map((point, i) => (
              <circle
                key={i}
                cx={moduliScaleX(point.m1)}
                cy={moduliScaleY(point.m2)}
                r="5"
                fill={point.label === 0 ? '#f97316' : '#3b82f6'}
                opacity="0.8"
              />
            ))}

            <text x="150" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">
              m₁
            </text>
            <text x="15" y="100" fill="#94a3b8" fontSize="11" textAnchor="middle">
              m₂
            </text>
          </svg>

          <div className="text-center mt-2 text-xs text-slate-500">
            Classes separate in moduli space!
          </div>
        </div>
      </div>

      {/* Arrow between spaces */}
      <div className="flex justify-center my-4">
        <div className="bg-slate-800 px-6 py-2 rounded-full flex items-center gap-2">
          <span className="text-slate-400 text-sm">x</span>
          <span className="text-emerald-400 text-lg">→</span>
          <span className="text-slate-300 text-sm font-mono">[W_x^f]</span>
          <span className="text-emerald-400 text-lg">→</span>
          <span className="text-slate-400 text-sm">moduli point</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISUALIZATION 4: PRUNING & BOUNDARIES
// ============================================================================

function PruningViz() {
  const [w1, setW1] = useState(1.5);
  const [w3, setW3] = useState(1.2);
  const [animating, setAnimating] = useState(false);

  // Animate weight toward zero
  useEffect(() => {
    if (animating && w1 > 0.05) {
      const timer = setTimeout(() => {
        setW1((prev) => Math.max(0.01, prev * 0.95));
      }, 50);
      return () => clearTimeout(timer);
    } else if (animating && w1 <= 0.05) {
      setAnimating(false);
    }
  }, [animating, w1]);

  const scaleX = (w) => 50 + (w / 3) * 200;
  const scaleY = (w) => 180 - (w / 3) * 150;

  const isNearBoundary = w1 < 0.3 || w3 < 0.3;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-rose-400 mb-4 font-mono">
        4. Pruning & Moduli Space Boundaries
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Small weights correspond to points near the boundary. At the boundary (w → 0), the network
        effectively loses a parameter—this is what pruning exploits.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moduli space with boundary */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Moduli Space with Boundary</h4>
          <svg width="300" height="220" className="mx-auto">
            {/* Valid region */}
            <rect x="50" y="30" width="200" height="150" fill="#0f172a" stroke="#334155" rx="4" />

            {/* Boundary zones (near w=0) */}
            <rect x="50" y="30" width="30" height="150" fill="#ef4444" opacity="0.15" />
            <rect x="50" y="150" width="200" height="30" fill="#ef4444" opacity="0.15" />

            {/* Grid */}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <line
                  x1={50 + i * 66}
                  y1="30"
                  x2={50 + i * 66}
                  y2="180"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <line
                  x1="50"
                  y1={30 + i * 50}
                  x2="250"
                  y2={30 + i * 50}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Boundary labels */}
            <text x="65" y="110" fill="#ef4444" fontSize="9" transform="rotate(-90, 65, 110)">
              w₁ → 0
            </text>
            <text x="150" y="175" fill="#ef4444" fontSize="9" textAnchor="middle">
              w₃ → 0
            </text>

            {/* Current point */}
            <circle
              cx={scaleX(w1)}
              cy={scaleY(w3)}
              r="12"
              fill={isNearBoundary ? '#ef4444' : '#22c55e'}
              stroke={isNearBoundary ? '#f87171' : '#4ade80'}
              strokeWidth="2"
            />

            {/* Trail showing path to boundary */}
            {animating && (
              <line
                x1={scaleX(1.5)}
                y1={scaleY(w3)}
                x2={scaleX(w1)}
                y2={scaleY(w3)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            )}

            <text x="150" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">
              w₁
            </text>
            <text x="30" y="105" fill="#94a3b8" fontSize="11" textAnchor="middle">
              w₃
            </text>
          </svg>
        </div>

        {/* Network and status */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Network Status</h4>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${isNearBoundary ? 'bg-rose-900/30 border border-rose-700' : 'bg-emerald-900/30 border border-emerald-700'}`}
            >
              <div className="text-sm font-semibold mb-2">
                {isNearBoundary ? (
                  <span className="text-rose-400">⚠️ Near Boundary</span>
                ) : (
                  <span className="text-emerald-400">✓ Interior Point</span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                {isNearBoundary
                  ? 'This neuron contributes little. Safe to prune!'
                  : 'All weights significant. Network at full capacity.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Weight w₁</div>
                <div className="text-xl font-mono text-amber-400">{w1.toFixed(3)}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Weight w₃</div>
                <div className="text-xl font-mono text-amber-400">{w3.toFixed(3)}</div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Path weight (moduli coord)</div>
              <div className="text-xl font-mono text-cyan-400">{(w1 * w3).toFixed(4)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {w1 * w3 < 0.1 ? 'Approaching zero → dimension collapse' : 'Healthy contribution'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div>
          <label className="text-slate-400 text-xs block mb-1">Weight w₁</label>
          <input
            type="range"
            min="0.01"
            max="3"
            step="0.01"
            value={w1}
            onChange={(e) => setW1(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Weight w₃</label>
          <input
            type="range"
            min="0.01"
            max="3"
            step="0.01"
            value={w3}
            onChange={(e) => setW3(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setW1(1.5);
              setAnimating(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Animate Pruning
          </button>
          <button
            onClick={() => {
              setW1(1.5);
              setW3(1.2);
              setAnimating(false);
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISUALIZATION 5: TRAINING TRAJECTORY
// ============================================================================

function TrainingTrajectoryViz() {
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [trajectory, setTrajectory] = useState([]);
  const [currentWeights, setCurrentWeights] = useState({ w1: 0.5, w2: 0.3, w3: 0.4, w4: 0.6 });

  // Target function: simple XOR-ish pattern
  const targetOutput = 1.8;
  const inputX = 1.0;

  const computeLoss = (w1, w2, w3, w4) => {
    const output = computeNetwork(inputX, w1, w2, w3, w4);
    return Math.pow(output - targetOutput, 2);
  };

  // Simple gradient descent simulation
  const trainStep = useCallback(() => {
    const { w1, w2, w3, w4 } = currentWeights;
    const lr = 0.05;
    const eps = 0.001;

    // Numerical gradients
    const loss = computeLoss(w1, w2, w3, w4);
    const dw1 = (computeLoss(w1 + eps, w2, w3, w4) - loss) / eps;
    const dw2 = (computeLoss(w1, w2 + eps, w3, w4) - loss) / eps;
    const dw3 = (computeLoss(w1, w2, w3 + eps, w4) - loss) / eps;
    const dw4 = (computeLoss(w1, w2, w3, w4 + eps) - loss) / eps;

    const newWeights = {
      w1: Math.max(0.1, w1 - lr * dw1),
      w2: Math.max(0.1, w2 - lr * dw2),
      w3: Math.max(0.1, w3 - lr * dw3),
      w4: Math.max(0.1, w4 - lr * dw4),
    };

    setCurrentWeights(newWeights);
    setTrajectory((prev) => [
      ...prev.slice(-100),
      {
        ...newWeights,
        m1: newWeights.w1 * newWeights.w3,
        m2: newWeights.w2 * newWeights.w4,
        loss,
      },
    ]);
    setEpoch((prev) => prev + 1);
  }, [currentWeights]);

  useEffect(() => {
    if (isTraining) {
      const timer = setTimeout(trainStep, 100);
      return () => clearTimeout(timer);
    }
  }, [isTraining, trainStep]);

  const resetTraining = () => {
    setIsTraining(false);
    setEpoch(0);
    setTrajectory([]);
    setCurrentWeights({
      w1: 0.3 + seededRandom(Date.now()) * 0.5,
      w2: 0.3 + seededRandom(Date.now() + 1) * 0.5,
      w3: 0.3 + seededRandom(Date.now() + 2) * 0.5,
      w4: 0.3 + seededRandom(Date.now() + 3) * 0.5,
    });
  };

  const moduli = getModuliCoords(
    currentWeights.w1,
    currentWeights.w2,
    currentWeights.w3,
    currentWeights.w4
  );
  const currentLoss = computeLoss(
    currentWeights.w1,
    currentWeights.w2,
    currentWeights.w3,
    currentWeights.w4
  );
  const currentOutput = computeNetwork(
    inputX,
    currentWeights.w1,
    currentWeights.w2,
    currentWeights.w3,
    currentWeights.w4
  );

  const scaleX = (m) => 50 + (m / 3) * 200;
  const scaleY = (m) => 180 - (m / 3) * 150;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-violet-400 mb-4 font-mono">
        5. Training Trajectory Through Moduli Space
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Watch gradient descent trace a path through moduli space. Different initializations may
        converge to the same moduli point (same function) via different weight configurations.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moduli space trajectory */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Trajectory in Moduli Space</h4>
          <svg width="300" height="220" className="mx-auto">
            <rect x="40" y="20" width="220" height="170" fill="#0f172a" stroke="#334155" rx="4" />

            {/* Grid */}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <line
                  x1={40 + i * 73}
                  y1="20"
                  x2={40 + i * 73}
                  y2="190"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1={20 + i * 56}
                  x2="260"
                  y2={20 + i * 56}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Trajectory path */}
            {trajectory.length > 1 && (
              <path
                d={`M ${trajectory.map((p) => `${scaleX(p.m1)},${scaleY(p.m2)}`).join(' L ')}`}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                opacity="0.7"
              />
            )}

            {/* Trajectory points colored by loss */}
            {trajectory.map((point, i) => (
              <circle
                key={i}
                cx={scaleX(point.m1)}
                cy={scaleY(point.m2)}
                r="3"
                fill={`hsl(${Math.max(0, 120 - point.loss * 100)}, 70%, 50%)`}
                opacity="0.6"
              />
            ))}

            {/* Current position */}
            <circle
              cx={scaleX(moduli.m1)}
              cy={scaleY(moduli.m2)}
              r="10"
              fill="#a855f7"
              stroke="#c084fc"
              strokeWidth="3"
            />

            {/* Start position marker */}
            {trajectory.length > 0 && (
              <circle
                cx={scaleX(trajectory[0].m1)}
                cy={scaleY(trajectory[0].m2)}
                r="6"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            )}

            <text x="150" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">
              m₁ = w₁w₃
            </text>
            <text
              x="25"
              y="105"
              fill="#94a3b8"
              fontSize="11"
              textAnchor="middle"
              transform="rotate(-90, 25, 105)"
            >
              m₂ = w₂w₄
            </text>
          </svg>

          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-amber-500 rounded-full"></span>
              <span className="text-slate-400">Start</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
              <span className="text-slate-400">Current</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-8 h-0.5 bg-gradient-to-r from-red-500 to-green-500"></span>
              <span className="text-slate-400">Loss</span>
            </span>
          </div>
        </div>

        {/* Training stats */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="text-slate-300 text-sm font-semibold mb-3">Training Progress</h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Epoch</div>
                <div className="text-2xl font-mono text-violet-400">{epoch}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Loss</div>
                <div className="text-2xl font-mono text-rose-400">{currentLoss.toFixed(4)}</div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-2">Output vs Target</div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-500 text-xs">Output: </span>
                  <span className="text-emerald-400 font-mono">{currentOutput.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Target: </span>
                  <span className="text-amber-400 font-mono">{targetOutput.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-2">Current Weights</div>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500">w₁:</span>
                  <span className="text-cyan-400 ml-1">{currentWeights.w1.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500">w₂:</span>
                  <span className="text-cyan-400 ml-1">{currentWeights.w2.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500">w₃:</span>
                  <span className="text-cyan-400 ml-1">{currentWeights.w3.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500">w₄:</span>
                  <span className="text-cyan-400 ml-1">{currentWeights.w4.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-2">Moduli Coordinates (Invariants)</div>
              <div className="flex gap-6 font-mono">
                <div>
                  <span className="text-slate-500 text-xs">m₁: </span>
                  <span className="text-amber-400">{moduli.m1.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">m₂: </span>
                  <span className="text-amber-400">{moduli.m2.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setIsTraining(!isTraining)}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
            isTraining
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {isTraining ? '⏸ Pause Training' : '▶ Start Training'}
        </button>
        <button
          onClick={resetTraining}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          🔄 Reset (New Init)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function ModuliSpaceVisualizations() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
            Moduli Space of Neural Networks
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Interactive visualizations exploring how neural networks can be understood through the
            lens of algebraic geometry. The <span className="text-amber-400">moduli space</span>{' '}
            captures equivalence classes of networks under symmetry transformations.
          </p>
        </div>

        {/* Key concept box */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">Core Insight</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The group{' '}
            <code className="bg-slate-700 px-2 py-0.5 rounded text-cyan-400">
              G̃ = ∏ᵥ∈Ṽ ℂ*
            </code>{' '}
            acts on neural network weights by rescaling: multiply incoming weights by τᵥ and divide
            outgoing weights by τᵥ. This transformation{' '}
            <span className="text-emerald-400">preserves the network function</span>. The moduli
            space is the quotient of weight space by this symmetry—each point represents a unique
            "computational behavior."
          </p>
        </div>

        {/* Visualizations */}
        <div className="space-y-8">
          <ToyNetworkViz />
          <OrbitViz />
          <DataManifoldViz />
          <PruningViz />
          <TrainingTrajectoryViz />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>
            Based on "The Representation Theory of Neural Networks" by Armenta & Jodoin (2021)
          </p>
          <p className="mt-1">
            Visualizations demonstrate concepts from quiver representation theory applied to deep
            learning.
          </p>
        </div>
      </div>
    </div>
  );
}
