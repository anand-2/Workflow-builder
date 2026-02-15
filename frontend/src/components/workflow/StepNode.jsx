import React from 'react';
import { Paper, Text } from '@mantine/core';
import { Handle, Position } from '@xyflow/react';
import { vars } from '../../theme';

export function StepNode({ data, selected }) {
  const bg = selected ? vars.nodeActiveBg() : vars.nodeDefaultBg();
  const borderColor = selected ? vars.nodeActiveBorder() : vars.nodeDefaultBorder();

  return (
    <Paper
      shadow={selected ? 'md' : 'sm'}
      p="md"
      radius="md"
      withBorder
      style={{
        minWidth: 160,
        borderWidth: selected ? 2 : 1,
        borderColor,
        backgroundColor: bg,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />
      <Text size="sm" fw={600} c="var(--app-text-primary)">{data?.label ?? 'Step'}</Text>
      <Text size="xs" c="var(--app-text-muted)" mt={4}>{data?.type ?? ''}</Text>
      <Handle type="source" position={Position.Right} id="out" />
    </Paper>
  );
}
