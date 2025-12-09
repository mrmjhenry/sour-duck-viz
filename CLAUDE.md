# CLAUDE.md - AI Assistant Guide for sour-duck-viz

## Project Overview

**sour-duck-viz** is an interactive visualization project demonstrating the moduli space of neural networks through the lens of algebraic geometry. The project provides educational visualizations of mathematical concepts from "The Representation Theory of Neural Networks" by Armenta & Jodoin (2021).

### Purpose
- Educational demonstration of neural network theory
- Interactive visualization of moduli space concepts
- Exploration of group actions on neural network weights
- Illustrates how symmetry transformations preserve network functions

### Technology Stack
- **React** - UI framework with hooks (useState, useEffect, useCallback, useMemo)
- **JSX** - Component-based architecture
- **Tailwind CSS** - Utility-first styling (slate, amber, violet, cyan color schemes)
- **SVG** - Mathematical visualizations and interactive graphics

## Repository Structure

```
sour-duck-viz/
├── README.md                  # Initial commit description
├── moduli-space-viz.jsx       # Main React component (1,193 lines)
└── .git/                      # Git repository data
```

### File Overview

#### moduli-space-viz.jsx
The single-file React application containing:
- **Utility Functions** (lines 1-69): Mathematical operations, data generation
- **ToyNetworkViz** (lines 75-257): Basic network → moduli space mapping
- **OrbitViz** (lines 263-464): Orbit visualization in weight space
- **DataManifoldViz** (lines 470-625): Data mapping to moduli space
- **PruningViz** (lines 631-831): Weight pruning and boundary visualization
- **TrainingTrajectoryViz** (lines 837-1132): Training dynamics in moduli space
- **Main App** (lines 1138-1192): Container component

## Codebase Architecture

### Component Structure

The codebase follows a functional React pattern with:
1. **Utility functions** at the top (pure functions)
2. **Visualization components** (each self-contained)
3. **Main export component** at the bottom

### Key Mathematical Concepts

#### Group Action
```javascript
const applyGroupAction = (w1, w2, w3, w4, tau1, tau2) => {
  return {
    w1: tau1 * w1,    // Scale incoming weights
    w2: tau2 * w2,
    w3: w3 / tau1,    // Inverse scale outgoing weights
    w4: w4 / tau2,
  };
};
```
This transformation preserves network output while changing individual weights.

#### Moduli Coordinates
```javascript
const getModuliCoords = (w1, w2, w3, w4) => {
  return { m1: w1 * w3, m2: w2 * w4 };
};
```
Path weights (products of connected weights) are invariant under group action.

#### Network Computation
```javascript
const computeNetwork = (x, w1, w2, w3, w4) => {
  const h1 = relu(w1 * x);      // First hidden neuron
  const h2 = relu(w2 * x);      // Second hidden neuron
  return w3 * h1 + w4 * h2;     // Output
};
```
Simple 2-layer network: 1 input → 2 hidden (ReLU) → 1 output.

### Component Patterns

Each visualization component follows this pattern:
1. **State management** - useState for interactive parameters
2. **Derived values** - useMemo/useCallback for computed values
3. **Visualization** - SVG-based 2D graphics
4. **Controls** - Range sliders and buttons for interaction
5. **Layout** - Grid-based responsive layout with Tailwind

### Color Scheme Convention

The project uses consistent Tailwind colors for semantic meaning:
- **Amber/Yellow** (#f59e0b) - Weights, invariants, moduli coordinates
- **Cyan** (#06b6d4) - Orbits, trajectories
- **Violet/Purple** (#8b5cf6) - Hidden layer, training
- **Rose/Pink** (#ec4899) - Current point, outputs
- **Emerald/Green** (#10b981) - Outputs, success states
- **Blue** (#3b82f6) - Input, data class
- **Orange** (#f97316) - Data class 0
- **Slate** (grays) - Background, UI chrome

## Code Conventions

### Naming Conventions
- **Components**: PascalCase (e.g., `ToyNetworkViz`, `OrbitViz`)
- **Functions**: camelCase (e.g., `computeNetwork`, `applyGroupAction`)
- **State variables**: camelCase (e.g., `inputX`, `tau1`, `isTraining`)
- **Constants**: camelCase (e.g., `networkSvgWidth`)
- **Mathematical variables**: Greek letters as subscripts (w₁, w₂, τ₁, m₁)

### Component Organization
```javascript
function ComponentName() {
  // 1. State declarations
  const [state, setState] = useState(initialValue);

  // 2. Derived values and memoization
  const derived = useMemo(() => computation, [deps]);

  // 3. Event handlers
  const handleEvent = useCallback(() => { ... }, [deps]);

  // 4. Effects
  useEffect(() => { ... }, [deps]);

  // 5. Computed values for rendering
  const value = computeValue();

  // 6. JSX return
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
}
```

### SVG Visualization Patterns

#### Coordinate Scaling
```javascript
// Convert domain values to SVG coordinates
const scaleX = (value) => offset + (value / maxValue) * width;
const scaleY = (value) => height - (value / maxValue) * scaledHeight;
```

#### Grid Rendering
```javascript
{[0, 1, 2, 3, 4].map((i) => (
  <g key={i}>
    <line x1={...} y1={...} x2={...} y2={...} />
  </g>
))}
```

### Tailwind Layout Patterns

- **Container**: `bg-slate-900 rounded-2xl p-6 border border-slate-700`
- **Card**: `bg-slate-800 rounded-xl p-4`
- **Grid**: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- **Button**: `px-4 py-2 bg-{color}-600 hover:bg-{color}-500 text-white rounded-lg`

## Development Workflow

### No Build System
This is a standalone JSX file without a build configuration. To use:

1. **Integration into a React project**:
   ```bash
   # Copy into a React app
   cp moduli-space-viz.jsx src/components/
   ```

2. **Import and use**:
   ```javascript
   import ModuliSpaceVisualizations from './components/moduli-space-viz';

   function App() {
     return <ModuliSpaceVisualizations />;
   }
   ```

3. **Required dependencies**:
   ```json
   {
     "dependencies": {
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     }
   }
   ```

4. **Tailwind CSS setup required** (classes must be available)

### Git Workflow

Current branches:
- Main branch: (not explicitly set)
- Current: `claude/claude-md-miy0xltwm3kuby2i-01XNFKEuRn7CxFsjjuYBiEa2`

Standard git operations:
```bash
# Stage changes
git add moduli-space-viz.jsx

# Commit with descriptive message
git commit -m "Add interactive pruning visualization"

# Push to remote
git push -u origin <branch-name>
```

## Common Tasks

### Adding a New Visualization Component

1. **Create component function** after existing visualizations:
   ```javascript
   function NewVisualizationViz() {
     const [param, setParam] = useState(defaultValue);

     return (
       <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
         <h3 className="text-xl font-bold text-{color}-400 mb-4 font-mono">
           N. New Visualization
         </h3>
         {/* Content */}
       </div>
     );
   }
   ```

2. **Add to main component**:
   ```javascript
   <div className="space-y-8">
     <ToyNetworkViz />
     {/* ... existing components ... */}
     <NewVisualizationViz />
   </div>
   ```

### Modifying Network Architecture

The current network is: `1 input → 2 hidden (ReLU) → 1 output`

To change:
1. Update `computeNetwork` function
2. Update weight parameters in all components
3. Update moduli coordinate calculation in `getModuliCoords`
4. Update SVG visualizations to match new architecture

### Adjusting Visual Styling

**Color changes**: Update Tailwind classes
```javascript
// From: text-amber-400
// To:   text-blue-400
```

**Layout changes**: Modify grid classes
```javascript
// From: grid-cols-1 lg:grid-cols-2
// To:   grid-cols-1 lg:grid-cols-3
```

**Animation timing**: Modify setTimeout/useEffect delays
```javascript
// In TrainingTrajectoryViz
const timer = setTimeout(trainStep, 100); // Adjust delay here
```

### Adding Interactive Controls

Pattern for range sliders:
```javascript
<div>
  <label className="text-slate-400 text-xs block mb-1">
    Parameter Name
  </label>
  <input
    type="range"
    min="0"
    max="10"
    step="0.1"
    value={parameter}
    onChange={(e) => setParameter(parseFloat(e.target.value))}
    className="w-full accent-{color}-500"
  />
  <span className="text-{color}-400 text-sm font-mono">
    {parameter.toFixed(1)}
  </span>
</div>
```

## Mathematical Background

### Core Concept: Moduli Space

The **moduli space** is the quotient of weight space by group action symmetry:
```
M = W / G̃
```

Where:
- W = space of all network weights
- G̃ = group of rescaling transformations
- Each point in M represents a unique network function

### Group Action: G̃ = ∏ᵥ∈Ṽ ℂ*

For each hidden neuron v, we can scale:
- Incoming weights by τᵥ
- Outgoing weights by 1/τᵥ

This preserves the network's input-output mapping.

### Invariants (Moduli Coordinates)

The products along paths (m₁ = w₁·w₃, m₂ = w₂·w₄) are invariant:
```javascript
// Before transformation
m1 = w1 * w3

// After transformation with tau1
w1' = tau1 * w1
w3' = w3 / tau1
m1' = w1' * w3' = (tau1 * w1) * (w3 / tau1) = w1 * w3 = m1
```

### Boundary and Pruning

When weights approach zero, the network approaches the moduli space boundary. This corresponds to neuron pruning - effectively reducing network dimension.

## Best Practices for AI Assistants

### When Modifying Code

1. **Preserve mathematical correctness**: Don't break the group action properties
2. **Maintain component isolation**: Each visualization is self-contained
3. **Keep consistent styling**: Use established color/layout patterns
4. **Update all related visualizations**: Changes to math should propagate
5. **Test interactivity**: Ensure sliders and buttons work as expected

### When Adding Features

1. **Follow existing patterns**: Match component structure and naming
2. **Document mathematical basis**: Add comments for non-obvious math
3. **Maintain responsiveness**: Use Tailwind responsive classes (lg:, md:)
4. **Consider performance**: Use useMemo/useCallback for expensive computations
5. **Keep accessibility in mind**: Ensure contrast and interactive elements are clear

### When Explaining Code

1. **Reference mathematical concepts**: Connect to the paper's theory
2. **Explain symmetry preservation**: Why transformations don't change output
3. **Clarify visualization choices**: Why certain colors/layouts were chosen
4. **Show relationships**: How components demonstrate different aspects of same theory

### Common Pitfalls to Avoid

- **Breaking weight-output invariance**: Transformations must preserve network function
- **Inconsistent coordinate scaling**: SVG scaling must match across visualizations
- **State synchronization issues**: Multiple useEffects can cause race conditions
- **Performance issues**: Avoid generating large datasets on every render
- **Missing dependencies**: useEffect/useMemo/useCallback deps must be complete

## Key Dependencies to Note

### React Hooks Used
- `useState` - Component state management
- `useEffect` - Side effects and animations
- `useCallback` - Memoized callbacks for performance
- `useMemo` - Memoized computed values

### No External Math Libraries
All mathematical operations are implemented directly:
- `relu` - ReLU activation
- `sigmoid` - Sigmoid activation (defined but unused)
- `seededRandom` - Deterministic pseudo-random numbers
- `generateSpiralData` - Synthetic dataset generation

### No External Visualization Libraries
All graphics are hand-coded SVG:
- Allows fine-grained control
- No dependency management needed
- Lightweight and portable

## Project History

- **First commit (46c3063)**: Initial project setup
- **Second commit (977cf8d)**: Main visualization code added

## Future Enhancement Ideas

### Potential Additions
1. **3D visualizations**: Use Three.js for higher-dimensional moduli spaces
2. **More network architectures**: CNNs, deeper networks, skip connections
3. **Real datasets**: MNIST, CIFAR-10 projections to moduli space
4. **Training algorithms**: SGD, Adam, momentum comparison
5. **Moduli space metrics**: Distance, geodesics, curvature
6. **Export/Save**: Download trajectory data, network snapshots

### Integration Possibilities
1. **Jupyter notebook**: For educational/research use
2. **Interactive textbook**: Embed in learning materials
3. **Research tool**: Extend for actual network analysis
4. **Web app**: Deploy standalone with build system

## References

### Primary Source
**"The Representation Theory of Neural Networks"**
- Authors: Armenta & Jodoin
- Year: 2021
- Concepts: Quiver representations, moduli spaces, group actions on networks

### Related Concepts
- Algebraic geometry and neural networks
- Symmetry and equivariance in deep learning
- Loss landscape geometry
- Neural network expressivity and universality

---

## Quick Reference

### File Locations
- Main component: `moduli-space-viz.jsx`
- Documentation: `README.md`
- This guide: `CLAUDE.md`

### Component Line Numbers
- Utilities: 1-69
- ToyNetworkViz: 75-257
- OrbitViz: 263-464
- DataManifoldViz: 470-625
- PruningViz: 631-831
- TrainingTrajectoryViz: 837-1132
- Main App: 1138-1192

### Key Functions
- `computeNetwork`: Line 12
- `applyGroupAction`: Line 24
- `getModuliCoords`: Line 19
- `generateOrbit`: Line 34
- `generateSpiralData`: Line 58

---

**Last Updated**: 2025-12-09
**Repository**: sour-duck-viz
**Branch**: claude/claude-md-miy0xltwm3kuby2i-01XNFKEuRn7CxFsjjuYBiEa2
