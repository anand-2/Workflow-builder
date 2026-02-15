import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Modal,
  Box,
} from '@mantine/core';
import { getWorkflows, deleteWorkflow } from '../api';
import { IconPlus, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import './Workflows.css';

function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, workflow: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await getWorkflows();
      setWorkflows(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (workflow) => setDeleteModal({ open: true, workflow });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.workflow) return;
    try {
      setDeleting(true);
      await deleteWorkflow(deleteModal.workflow.id);
      setWorkflows((w) => w.filter((x) => x.id !== deleteModal.workflow.id));
      setDeleteModal({ open: false, workflow: null });
    } catch (err) {
      setError('Failed to delete workflow');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">Loading workflows...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>All Workflows</Title>
        <Button component={Link} to="/create" leftSection={<IconPlus size={18} />}>
          Create New
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {workflows.length === 0 ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Text size="4rem" className="workflows_emptyIcon">📋</Text>
            <Title order={4}>No workflows yet</Title>
            <Text c="dimmed">Create your first workflow to get started.</Text>
            <Button component={Link} to="/create">Create Workflow</Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {workflows.map((workflow) => (
            <Card key={workflow.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="xs">
                <Title order={4}>{workflow.name}</Title>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {workflow.description || 'No description'}
                </Text>
                <Group gap="xs" c="dimmed" size="xs">
                  <Text span>{workflow.steps?.length ?? 0} steps</Text>
                  <Text span>•</Text>
                  <Text span>{new Date(workflow.created_at).toLocaleDateString()}</Text>
                </Group>
                <Group mt="sm">
                  <Button
                    variant="filled"
                    size="sm"
                    leftSection={<IconPlayerPlay size={16} />}
                    onClick={() => navigate(`/workflows/${workflow.id}`)}
                    className="workflows_runButton"
                  >
                    Run
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => handleDeleteClick(workflow)}
                  >
                    Delete
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, workflow: null })}
        title="Delete workflow?"
      >
        <Text size="sm" c="dimmed" mb="md">
          Are you sure you want to delete &quot;{deleteModal.workflow?.name}&quot;? This cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModal({ open: false, workflow: null })}>
            Cancel
          </Button>
          <Button color="red" loading={deleting} onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}

export default Workflows;
