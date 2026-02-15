import React, { useCallback, useRef, useState, useEffect } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconRotate2, IconRotateClockwise } from '@tabler/icons-react';
import { createWorkflow } from '../api';
import { STEP_TYPES, MAX_STEPS, INPUT_NODE_ID } from '../constants';
import './CreateWorkflow.css';
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
  const visited = new Set();
  let currentId = INPUT_NODE_ID;
  visited.add(currentId);

  while (true) {
    const edge = edges.find((e) => e.source === currentId);
    if (!edge) break;

    if (visited.has(edge.target)) {
      throw new Error("Cycles (loops) are not allowed in this workflow.");
    }

    stepIds.push(edge.target);
    visited.add(edge.target);
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
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  
  // --- UNDO / REDO STATE ---
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const nameInputRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const stepNodes = nodes.filter((n) => n.type === 'step');
  const atMaxSteps = stepNodes.length >= MAX_STEPS;

  // Helper to save current state before an action
  const takeSnapshot = useCallback(() => {
    setPast((prev) => [...prev, { nodes: [...nodes], edges: [...edges] }].slice(-20));
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [{ nodes, edges }, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setPast(newPast);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture(newFuture);
  }, [future, nodes, edges, setNodes, setEdges]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Action Wrappers
  const onConnect = useCallback((params) => {
    takeSnapshot();
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges, takeSnapshot]);

  const onNodesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgeDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodeDragStart = useCallback(() => takeSnapshot(), [takeSnapshot]);

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
        takeSnapshot();
        setNodes((nds) => nds.concat(newNode));
      } catch (_) {}
    },
    [screenToFlowPosition, atMaxSteps, setNodes, takeSnapshot]
  );

  const onDragOver = useCallback((ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      notifications.show({
        title: 'Input Required',
        message: 'Please enter a workflow name.',
        color: 'red',
      });
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
      return;
    }

    let steps;
    try {
      steps = getOrderedSteps(nodes, edges);
      if (steps.length === 0) {
        throw new Error('Add at least one step and connect it from Input.');
      }
    } catch (err) {
      notifications.show({
        title: 'Workflow Error',
        message: err.message,
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await createWorkflow({
        name: formData.name,
        description: formData.description,
        steps,
      });
      notifications.show({
        title: 'Success!',
        message: 'Workflow created successfully.',
        color: 'teal',
      });
      navigate('/workflows');
    } catch (err) {
      notifications.show({
        title: 'Creation Failed',
        message: err.response?.data?.detail || err.message || 'Failed to create workflow',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="createWorkflow_root">
      <Group align="flex-start" gap="md" wrap="nowrap" className="createWorkflow_layout">
        <Card withBorder shadow="sm" radius="md" p="md" className="createWorkflow_sidebar">
          <Text fw={600} size="lg" mb="md">Create New Workflow</Text>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                ref={nameInputRef}
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
                      className={disabled ? 'createWorkflow_stepPaper createWorkflow_stepPaper--disabled' : 'createWorkflow_stepPaper'}
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
                <Button type="submit" loading={loading}>
                  Create Workflow
                </Button>
                <Button variant="default" onClick={() => navigate('/workflows')}>
                  Cancel
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>

        <Paper withBorder radius="md" className="createWorkflow_canvas" ref={reactFlowWrapper}>
          <ReactFlow
            className="createWorkflow_reactFlow"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgeDelete={onEdgeDelete}
            onNodeDragStart={onNodeDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <Group gap="xs">
                <Button 
                  variant="default" 
                  size="compact-sm" 
                  onClick={undo} 
                  disabled={past.length === 0}
                  leftSection={<IconRotate2 size={16} />}
                >
                  Undo
                </Button>
                <Button 
                  variant="default" 
                  size="compact-sm" 
                  onClick={redo} 
                  disabled={future.length === 0}
                  leftSection={<IconRotateClockwise size={16} />}
                >
                  Redo
                </Button>
              </Group>
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