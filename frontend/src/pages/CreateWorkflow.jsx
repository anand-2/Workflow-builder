import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  Card,
  Stack,
  TextInput,
  Textarea,
  Text,
  Paper,
  Group,
  Alert,
} from '@mantine/core';
import { createWorkflow } from '../api';
import { STEP_TYPES, MAX_STEPS, INPUT_NODE_ID } from '../constants';
import { vars } from '../theme';
import { InputNode } from '../components/workflow/InputNode';
import { StepNode } from '../components/workflow/StepNode';

const nodeTypes = { input: InputNode, step: StepNode };

const initialNodes = [
  {
    id: INPUT_NODE_ID,
    type: 'input',
    position: { x: 80, y: 200 },
    data: {},
    deletable: false,
    draggable: true,
  },
];

const initialEdges = [];

function getOrderedSteps(nodes, edges) {
  const stepIds = [];
  let currentId = INPUT_NODE_ID;
  while (true) {
    const edge = edges.find((e) => e.source === currentId);
    if (!edge) break;
    stepIds.push(edge.target);
    currentId = edge.target;
  }
  return stepIds
    .map((id) => {
      const node = nodes.find((n) => n.id === id);
      return node?.data?.type ? { type: node.data.type, name: node.data.label } : null;
    })
    .filter(Boolean);
}

function CreateWorkflowInner() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [formData, setFormData] = React.useState({ name: '', description: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const stepNodes = nodes.filter((n) => n.type === 'step');
  const atMaxSteps = stepNodes.length >= MAX_STEPS;

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (ev) => {
      ev.preventDefault();
      const raw = ev.dataTransfer.getData('application/reactflow');
      if (!raw || atMaxSteps) return;
      try {
        const { type, label } = JSON.parse(raw);
        const position = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
        const id = `step-${Date.now()}`;
        const newNode = {
          id,
          type: 'step',
          position,
          data: { type, label },
        };
        setNodes((nds) => nds.concat(newNode));
      } catch (_) {}
    },
    [screenToFlowPosition, atMaxSteps, setNodes]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a workflow name');
      return;
    }
    const steps = getOrderedSteps(nodes, edges);
    if (steps.length === 0) {
      setError('Add at least one step and connect it from Input');
      return;
    }
    if (steps.length > MAX_STEPS) {
      setError(`Maximum ${MAX_STEPS} steps allowed`);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createWorkflow({
        name: formData.name,
        description: formData.description,
        steps,
      });
      navigate('/workflows');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Group align="flex-start" gap="md" wrap="nowrap" style={{ flex: 1, minHeight: 0 }}>
        <Card withBorder shadow="sm" radius="md" p="md" style={{ width: 320, flexShrink: 0, backgroundColor: vars.bgSidebar() }}>
          <Text fw={600} size="lg" mb="md">Create New Workflow</Text>
          {error && (
            <Alert color="red" mb="md" variant="light" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Workflow Name"
                placeholder="e.g. Blog Post Processor"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Textarea
                label="Description"
                placeholder="What does this workflow do?"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                minRows={2}
              />
              <Text size="sm" fw={500} c="dimmed">Steps (drag onto canvas)</Text>
              <Stack gap="xs">
                {STEP_TYPES.map((step) => {
                  const alreadyAdded = stepNodes.some((n) => n.data?.type === step.value);
                  const disabled = atMaxSteps || alreadyAdded;
                  return (
                    <Paper
                      key={step.value}
                      withBorder
                      p="xs"
                      radius="sm"
                      style={{
                        cursor: disabled ? 'not-allowed' : 'grab',
                        opacity: disabled ? 0.6 : 1,
                      }}
                      draggable={!disabled}
                      onDragStart={(e) => {
                        if (disabled) return;
                        e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: step.value, label: step.label }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      <Text size="sm" fw={500}>{step.label}</Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>{step.description}</Text>
                    </Paper>
                  );
                })}
              </Stack>
              <Group gap="sm">
                <Button type="submit" loading={loading} disabled={stepNodes.length === 0}>
                  Create Workflow
                </Button>
                <Button variant="default" onClick={() => navigate('/workflows')}>
                  Cancel
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>

        <Paper withBorder radius="md" style={{ flex: 1, minWidth: 0, minHeight: 480, height: '100%', backgroundColor: vars.bgCanvas() }} ref={reactFlowWrapper}>
          <ReactFlow
            style={{ width: '100%', height: '100%', minHeight: 480, backgroundColor: vars.bgCanvas() }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background />
            <Controls />
            <Panel position="top-left">
              <Text size="xs" c="dimmed">
                Drag steps from the left and connect Input → Step 1 → Step 2 … (max {MAX_STEPS} steps)
              </Text>
            </Panel>
          </ReactFlow>
        </Paper>
      </Group>
    </Box>
  );
}

export default function CreateWorkflow() {
  return (
    <ReactFlowProvider>
      <CreateWorkflowInner />
    </ReactFlowProvider>
  );
}
