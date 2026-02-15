import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  Card,
  Stack,
  Textarea,
  Text,
  Group,
  Loader,
  Alert,
  Badge,
  Paper,
  Title,
  Anchor,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconPlayerPlay } from '@tabler/icons-react';
import { vars } from '../theme';
import { getWorkflow, runWorkflowStream, getWorkflowRuns } from '../api';
import { stepsToFlow } from '../utils/flowHelpers';
import { InputNode } from '../components/workflow/InputNode';
import { RunStepNode } from '../components/workflow/RunStepNode';
import { AnimatedEdge } from '../components/workflow/AnimatedEdge';

const nodeTypes = { input: InputNode, runStep: RunStepNode };
const edgeTypes = { animated: AnimatedEdge };

function WorkflowDetailInner() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [streamingSteps, setStreamingSteps] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const streamAbortRef = useRef(null);

  const stepStatuses = useMemo(() => {
    const statuses = {};
    const stepCount = workflow?.steps?.length ?? 0;
    for (let i = 0; i < stepCount; i++) {
      const s = streamingSteps.find((x) => x.stepNumber === i + 1);
      statuses[i] = s?.status ?? 'pending';
    }
    return statuses;
  }, [workflow?.steps?.length, streamingSteps]);

  const activeEdgeFrom = useMemo(() => {
    if (streamingSteps.length === 0) return -1;
    const current = streamingSteps.find((s) => s.status === 'streaming');
    if (current) return current.stepNumber - 1;
    const last = streamingSteps[streamingSteps.length - 1];
    return last ? last.stepNumber : -1;
  }, [streamingSteps]);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(
    () => (workflow?.steps ? stepsToFlow(workflow.steps, stepStatuses, activeEdgeFrom) : { nodes: [], edges: [] }),
    [workflow?.steps, stepStatuses, activeEdgeFrom]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  useEffect(() => {
    if (!id) return;
    fetchWorkflow();
    fetchRunHistory();
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const response = await getWorkflow(id);
      setWorkflow(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const fetchRunHistory = async () => {
    if (!id) return;
    try {
      const response = await getWorkflowRuns(id);
      setRunHistory(response.data);
    } catch (err) {
      console.error('Failed to load run history');
    }
  };

  const handleRun = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }
    setRunning(true);
    setError(null);
    setResults(null);
    setStreamingSteps([]);
    streamAbortRef.current = new AbortController();

    try {
      await runWorkflowStream(id, inputText, {
        signal: streamAbortRef.current.signal,
        onEvent(ev) {
          if (ev.type === 'step_start') {
            setStreamingSteps((prev) => [
              ...prev,
              {
                stepNumber: ev.stepNumber,
                stepName: ev.stepName,
                stepType: ev.stepType,
                input: prev.length === 0 ? inputText : null,
                output: '',
                status: 'streaming',
                error: null,
              },
            ]);
          } else if (ev.type === 'chunk') {
            setStreamingSteps((prev) =>
              prev.map((s) =>
                s.stepNumber === ev.stepNumber ? { ...s, output: s.output + (ev.chunk || '') } : s
              )
            );
          } else if (ev.type === 'step_done') {
            setStreamingSteps((prev) =>
              prev.map((s) =>
                s.stepNumber === ev.stepNumber ? { ...s, output: ev.output ?? s.output, status: 'success' } : s
              )
            );
          } else if (ev.type === 'step_error') {
            setStreamingSteps((prev) =>
              prev.map((s) =>
                s.stepNumber === ev.stepNumber ? { ...s, status: 'failed', error: ev.error } : s
              )
            );
          } else if (ev.type === 'complete') {
            setResults({
              workflowId: ev.workflowId,
              workflowName: ev.workflowName,
              results: ev.results,
            });
            setStreamingSteps([]);
            fetchRunHistory();
          } else if (ev.type === 'error') {
            setError(ev.error || 'Stream error');
          }
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to run workflow');
      }
    } finally {
      setRunning(false);
      streamAbortRef.current = null;
    }
  };

  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">Loading workflow...</Text>
      </Stack>
    );
  }

  if (!workflow) {
    return (
      <Alert color="red" title="Not found">
        Workflow not found.
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
      <Group>
        <Anchor component={Link} to="/workflows" size="sm" c="primary">
          ← Back to Workflows
        </Anchor>
      </Group>

      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Title order={3} mb="xs">{workflow.name}</Title>
        <Text size="sm" c="dimmed" mb="md">
          {workflow.description || 'No description'}
        </Text>

        <Text size="sm" fw={500} mb="xs">Workflow path</Text>
        <Box style={{ height: 140, border: `1px solid ${vars.border()}`, borderRadius: 'var(--mantine-radius-md)', backgroundColor: vars.bgCanvas() }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            style={{ width: '100%', height: '100%' }}
          >
            <Background size={1} />
            <Controls showInteractive={false} />
            {running && (
              <Panel position="top-center">
                <Badge size="sm" color="primary" variant="light">Running…</Badge>
              </Panel>
            )}
          </ReactFlow>
        </Box>
      </Card>

      {error && (
        <Alert color="red" variant="light" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Card withBorder shadow="sm" padding="lg" radius="md">
        <form onSubmit={handleRun}>
          <Textarea
            label="Input text"
            placeholder="Enter the text you want to process through this workflow..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            minRows={5}
            required
            mb="md"
          />
          <Button type="submit" loading={running} leftSection={<IconPlayerPlay size={18} />}>
            {running ? 'Processing…' : 'Run Workflow'}
          </Button>
        </form>
      </Card>

      {streamingSteps.length > 0 && (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Group mb="md">
            <Title order={4}>Results</Title>
            <Badge color="primary" variant="light">Live</Badge>
          </Group>
          <Stack gap="md">
            {streamingSteps.map((step, index) => (
              <Paper key={step.stepNumber} withBorder p="md" radius="md" style={{ borderLeftWidth: 4, borderLeftColor: step.status === 'success' ? vars.successBorder() : step.status === 'failed' ? vars.dangerBorder() : vars.primaryBorder() }}>
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>Step {step.stepNumber}: {step.stepName}</Text>
                  <Badge size="sm" color={step.status === 'success' ? 'green' : step.status === 'failed' ? 'red' : 'primary'} variant="light">
                    {step.status === 'streaming' ? 'Streaming' : step.status === 'success' ? 'Done' : step.status.toUpperCase()}
                  </Badge>
                </Group>
                {index === 0 && step.input != null && (
                  <>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Input</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', background: vars.bgElevated(), padding: 8, borderRadius: 4 }}>{step.input}</Text>
                  </>
                )}
                <Text size="xs" c="dimmed" tt="uppercase" fw={500} mt="xs">Output</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap', background: vars.bgElevated(), padding: 8, borderRadius: 4, minHeight: 24 }}>
                  {step.output}
                  {step.status === 'streaming' && <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>}
                </Text>
                {step.error && (
                  <Alert color="red" variant="light" mt="xs">{step.error}</Alert>
                )}
              </Paper>
            ))}
          </Stack>
        </Card>
      )}

      {results && (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Title order={4} mb="md">Results</Title>
          <Stack gap="md">
            {results.results.map((step, index) => (
              <Paper key={index} withBorder p="md" radius="md" style={{ borderLeftWidth: 4, borderLeftColor: step.status === 'success' ? vars.successBorder() : vars.dangerBorder() }}>
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>Step {step.stepNumber}: {step.stepName}</Text>
                  <Badge size="sm" color={step.status === 'success' ? 'green' : 'red'} variant="light">{step.status}</Badge>
                </Group>
                {step.status === 'success' ? (
                  <>
                    {index === 0 && (
                      <>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Input</Text>
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap', background: vars.bgElevated(), padding: 8, borderRadius: 4 }}>{step.input}</Text>
                      </>
                    )}
                    <Text size="xs" c="dimmed" tt="uppercase" fw={500} mt="xs">Output</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', background: vars.bgElevated(), padding: 8, borderRadius: 4 }}>{step.output}</Text>
                  </>
                ) : (
                  <Alert color="red" variant="light">{step.error}</Alert>
                )}
              </Paper>
            ))}
          </Stack>
        </Card>
      )}

      {runHistory.length > 0 && (
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Title order={4} mb="md">Recent runs (last 5)</Title>
          <Stack gap="sm">
            {runHistory.map((run) => (
              <Paper key={run.id} withBorder p="sm" radius="sm">
                <Text size="xs" c="dimmed">{new Date(run.created_at).toLocaleString()}</Text>
                <Text size="sm" lineClamp={2} mt={4}>{run.input_text}</Text>
                <Text size="xs" c="primary" fw={500} mt={4}>{run.results?.length ?? 0} steps completed</Text>
              </Paper>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default function WorkflowDetail() {
  return (
    <ReactFlowProvider>
      <WorkflowDetailInner />
    </ReactFlowProvider>
  );
}
