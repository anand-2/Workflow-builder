import React, { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Badge,
  Box,
} from '@mantine/core';
import { IconRefresh, IconDatabase, IconRobot, IconCheck, IconX } from '@tabler/icons-react';
import { vars } from '../theme';
import { healthCheck } from '../api';

function Status() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await healthCheck();
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>System Status</Title>
        <Button leftSection={<IconRefresh size={18} />} loading={loading} onClick={checkHealth} variant="light">
          Refresh
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light">{error}</Alert>
      )}

      {loading && !status && (
        <Stack align="center" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">Checking system health...</Text>
        </Stack>
      )}

      {status && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <Box>
                  {status.status === 'healthy' ? <IconCheck size={48} color={vars.success()} /> : <IconX size={48} color={vars.danger()} />}
                </Box>
                <Title order={4}>Overall Status</Title>
                <Badge size="lg" color={status.status === 'healthy' ? 'green' : 'red'} variant="light">
                  {status.status.toUpperCase()}
                </Badge>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <IconDatabase size={48} color={status.database === 'connected' ? vars.info() : vars.danger()} />
                <Title order={4}>Database</Title>
                <Badge size="lg" color={status.database === 'connected' ? 'teal' : 'red'} variant="light">
                  {status.database === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
                <Text size="xs" c="dimmed">PostgreSQL</Text>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <IconRobot size={48} color={status.llm === 'connected' ? vars.primary() : vars.danger()} />
                <Title order={4}>LLM Service</Title>
                <Badge size="lg" color={status.llm === 'connected' ? 'primary' : 'red'} variant="light">
                  {status.llm === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
                <Text size="xs" c="dimmed">Google Gemini Pro</Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <Text size="sm"><strong>Last checked:</strong> {new Date(status.timestamp).toLocaleString()}</Text>
            </Group>
          </Card>

          {status.status === 'healthy' ? (
            <Alert color="green" variant="light" title="All Systems Operational">
              The backend API, database, and LLM service are all running correctly. You can create and run workflows without issues.
            </Alert>
          ) : (
            <Alert color="red" variant="light" title="System Issues Detected">
              One or more services are not responding correctly. Please check your configuration and try again.
            </Alert>
          )}
        </>
      )}

      <Card withBorder padding="md" radius="md">
        <Title order={4} mb="md">System Information</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Box>
            <Text size="sm" fw={600}>Frontend</Text>
            <Text size="xs" c="dimmed">React 18 + Vite</Text>
          </Box>
          <Box>
            <Text size="sm" fw={600}>Backend</Text>
            <Text size="xs" c="dimmed">FastAPI + Python</Text>
          </Box>
          <Box>
            <Text size="sm" fw={600}>Database</Text>
            <Text size="xs" c="dimmed">PostgreSQL</Text>
          </Box>
          <Box>
            <Text size="sm" fw={600}>LLM Provider</Text>
            <Text size="xs" c="dimmed">Google Gemini</Text>
          </Box>
        </SimpleGrid>
      </Card>
    </Stack>
  );
}

export default Status;
