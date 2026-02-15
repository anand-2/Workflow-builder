import React from 'react';
import { Paper, Text, Group, Loader, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { vars } from '../../theme';
import './RunStepNode.css';

const statusConfig = {
  pending: { icon: null },
  streaming: { icon: 'loader' },
  success: { icon: 'check' },
  failed: { icon: 'x' },
};

export function RunStepNode({ data }) {
  const status = data?.status ?? 'pending';
  const config = statusConfig[status];

  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      className={`runStepNode_root runStepNode_root--${status}`}
    >
      <Handle type="target" position={Position.Left} id="in" />
      <Group gap="xs" wrap="nowrap">
        {config.icon === 'loader' && <Loader size="sm" color="blue" />}
        {config.icon === 'check' && <IconCheck size={18} color={vars.success()} />}
        {config.icon === 'x' && <IconX size={18} color={vars.danger()} />}
        {config.icon === null && <Box className="runStepNode_placeholderBox" />}
        <Box>
          <Text size="sm" fw={600} c="var(--app-text-primary)">Step {data?.stepNumber ?? ''}</Text>
          <Text size="xs" c="var(--app-text-muted)">{data?.label ?? '—'}</Text>
        </Box>
      </Group>
      <Handle type="source" position={Position.Right} id="out" />
    </Paper>
  );
}
