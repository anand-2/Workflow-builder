import React from 'react';
import { Paper, Text, Group } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { vars } from '../../theme';

export function InputNode() {
  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{
        minWidth: 140,
        backgroundColor: vars.nodeTriggerBg(),
        borderColor: vars.nodeTriggerBorder(),
        borderWidth: 1,
      }}
    >
      <Handle type="source" position={Position.Right} id="out" />
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" fw={600} c="var(--app-text-secondary)">Input</Text>
        <IconArrowRight size={16} color={vars.warning()} />
      </Group>
      <Text size="xs" c="var(--app-text-muted)" mt={4}>Start here</Text>
    </Paper>
  );
}
