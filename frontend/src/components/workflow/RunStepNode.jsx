import React from 'react';
import { Paper, Text, Group, Loader, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { vars } from '../../theme';

const statusConfig = {
  pending: {
    bg: vars.nodeDefaultBg(),
    borderColor: vars.nodeDefaultBorder(),
    icon: null,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  streaming: {
    bg: vars.nodeActiveBg(),
    borderColor: vars.nodeActiveBorder(),
    icon: 'loader',
    animation: 'none',
  },
  success: {
    bg: vars.nodeSuccessBg(),
    borderColor: vars.nodeSuccessBorder(),
    icon: 'check',
    animation: 'none',
  },
  failed: {
    bg: vars.nodeErrorBg(),
    borderColor: vars.nodeErrorBorder(),
    icon: 'x',
    animation: 'none',
  },
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
      style={{
        minWidth: 160,
        borderWidth: 2,
        borderColor: config.borderColor,
        backgroundColor: config.bg,
        animation: config.animation,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />
      <Group gap="xs" wrap="nowrap">
        {config.icon === 'loader' && <Loader size="sm" color="blue" />}
        {config.icon === 'check' && <IconCheck size={18} color={vars.success()} />}
        {config.icon === 'x' && <IconX size={18} color={vars.danger()} />}
        {config.icon === null && (
          <Box style={{ width: 18, height: 18, borderRadius: 4, background: vars.edgeDefault() }} />
        )}
        <Box>
          <Text size="sm" fw={600} c="var(--app-text-primary)">Step {data?.stepNumber ?? ''}</Text>
          <Text size="xs" c="var(--app-text-muted)">{data?.label ?? '—'}</Text>
        </Box>
      </Group>
      <Handle type="source" position={Position.Right} id="out" />
    </Paper>
  );
}
