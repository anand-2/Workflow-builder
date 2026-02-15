import React from 'react';
import { Paper, Text } from '@mantine/core';
import { Handle, Position } from '@xyflow/react';
import './StepNode.css';

export function StepNode({ data, selected }) {
  return (
    <Paper
      shadow={selected ? 'md' : 'sm'}
      p="md"
      radius="md"
      withBorder
      className={`stepNode_root${selected ? ' stepNode_root--selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} id="in" />
      <Text size="sm" fw={600} c="var(--app-text-primary)">{data?.label ?? 'Step'}</Text>
      <Text size="xs" c="var(--app-text-muted)" mt={4}>{data?.type ?? ''}</Text>
      <Handle type="source" position={Position.Right} id="out" />
    </Paper>
  );
}
