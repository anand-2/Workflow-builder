import { INPUT_NODE_ID } from '../constants';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const SPACING = 120;

/**
 * Build React Flow nodes and edges from workflow steps (for read-only / run view).
 * @param {Array<{ type: string, name: string }>} steps
 * @param {Object} stepStatuses - optional map stepIndex (0-based) -> 'pending' | 'streaming' | 'success' | 'failed'
 * @param {number} activeEdgeFrom - optional step index (0-based) for which edge is "active" (from this step to next)
 */
export function stepsToFlow(steps, stepStatuses = {}, activeEdgeFrom = -1) {
  if (!steps || steps.length === 0) {
    return {
      nodes: [
        { id: INPUT_NODE_ID, type: 'input', position: { x: 0, y: 0 }, data: {}, draggable: false, selectable: false },
      ],
      edges: [],
    };
  }

  const nodes = [];
  const edges = [];

  nodes.push({
    id: INPUT_NODE_ID,
    type: 'input',
    position: { x: 0, y: 0 },
    data: {},
    draggable: false,
    selectable: false,
  });

  steps.forEach((step, i) => {
    const id = `step-${i}`;
    nodes.push({
      id,
      type: 'runStep',
      position: { x: NODE_WIDTH + SPACING + i * (NODE_WIDTH + SPACING), y: 0 },
      data: {
        label: step.name,
        type: step.type,
        stepNumber: i + 1,
        status: stepStatuses[i] ?? 'pending',
      },
      draggable: false,
      selectable: false,
    });

    const source = i === 0 ? INPUT_NODE_ID : `step-${i - 1}`;
    const target = id;
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      type: 'animated',
      data: { active: activeEdgeFrom === i },
    });
  });

  return { nodes, edges };
}
