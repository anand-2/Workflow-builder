import React from 'react';
import { Link } from 'react-router-dom';
import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { IconPlus, IconList, IconChartDots, IconArrowRight } from '@tabler/icons-react';
import { vars } from '../theme';

const features = [
  {
    title: 'Create Workflow',
    description: 'Choose from 6 step types: clean text, summarize, extract key points, tag category, sentiment analysis, or translate to simple language. Build your flow with drag and drop.',
    color: 'primary',
    icon: IconPlus,
  },
  {
    title: 'Run Workflow',
    description: 'Input your text and watch it transform step by step. See the output of each processing stage with live streaming.',
    color: 'pink',
    icon: IconArrowRight,
  },
  {
    title: 'View History',
    description: 'Track your last 5 runs for each workflow. Review past inputs and outputs anytime.',
    color: 'blue',
    icon: IconList,
  },
];

const stepTypes = [
  { name: 'Clean Text', desc: 'Remove noise & fix typos' },
  { name: 'Summarize', desc: 'Condense to key points' },
  { name: 'Extract Key Points', desc: 'Bullet point highlights' },
  { name: 'Tag Category', desc: 'Auto-categorize content' },
  { name: 'Sentiment Analysis', desc: 'Detect positive/negative' },
  { name: 'Translate to Simple', desc: 'Simplify language' },
];

function Home() {
  return (
    <Stack gap="xl">
      <Box>
        <Title order={2} mb="xs">Welcome to Workflow Builder</Title>
        <Text c="dimmed" size="md" mb="lg">
          Create custom workflows to process text with AI-powered steps. Build multi-step automations, run them on your content, and track results.
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {features.map(({ title, description, color, icon: Icon }) => (
          <Card key={title} shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color={color}>
                <Icon size={22} />
              </ThemeIcon>
              <Title order={4}>{title}</Title>
            </Group>
            <Text size="sm" c="dimmed">{description}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder padding="md" radius="md">
        <Title order={4} mb="md">Available Step Types</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
          {stepTypes.map((step, i) => (
            <Card key={i} padding="sm" withBorder radius="sm" style={{ borderLeftWidth: 4, borderLeftColor: vars.primary() }}>
              <Text size="sm" fw={600}>{step.name}</Text>
              <Text size="xs" c="dimmed">{step.desc}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Card>

      <Group>
        <Button component={Link} to="/create" leftSection={<IconPlus size={18} />}>
          Create New Workflow
        </Button>
        <Button component={Link} to="/workflows" variant="light">
          View All Workflows
        </Button>
        <Button component={Link} to="/status" variant="default" leftSection={<IconChartDots size={18} />}>
          System Status
        </Button>
      </Group>
    </Stack>
  );
}

export default Home;
