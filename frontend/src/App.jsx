import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppShell, Group, Title, NavLink, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconHome, IconList, IconPlus, IconChartDots, IconSun, IconMoon } from '@tabler/icons-react';
import { vars } from './theme';
import Home from './pages/Home';
import Status from './pages/Status';
import CreateWorkflow from './pages/CreateWorkflow';
import Workflows from './pages/Workflows';
import WorkflowDetail from './pages/WorkflowDetail';

function Navigation() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home', icon: IconHome },
    { to: '/workflows', label: 'Workflows', icon: IconList },
    { to: '/create', label: 'Create New', icon: IconPlus },
    { to: '/status', label: 'Status', icon: IconChartDots },
  ];

  return (
    <Stack gap={4}>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          component={Link}
          to={to}
          label={label}
          leftSection={<Icon size={20} />}
          active={to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)}
          variant="light"
        />
      ))}
    </Stack>
  );
}

function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  const isDark = computed === 'dark';
  return (
    <Tooltip label={isDark ? 'Switch to light' : 'Switch to dark'}>
      <ActionIcon
        variant="subtle"
        color="white"
        size="lg"
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle color scheme"
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}

function App() {
  return (
    <Router>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 220, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Header style={{ background: `linear-gradient(135deg, ${vars.primary()} 0%, ${vars.accent()} 100%)` }}>
          <Group h="100%" px="md" justify="space-between">
            <Title order={3} c="white">
              ⚡ Workflow Builder
            </Title>
            <ThemeToggle />
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" style={{ backgroundColor: vars.bgSidebar() }}>
          <AppShell.Section grow>
            <Navigation />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main style={{ backgroundColor: vars.bgPage() }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/status" element={<Status />} />
            <Route path="/create" element={<CreateWorkflow />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </Router>
  );
}

export default App;
