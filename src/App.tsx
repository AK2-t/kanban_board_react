import React from 'react';
import { useTheme } from './context/ThemeContext';
import Header from './components/Header';
import BoardSelector from './components/BoardSelector';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import { useBoard } from './context/BoardContext';
import { Box, Paper, Typography } from '@mui/material';

const App: React.FC = () => {
  const { darkMode } = useTheme();
  const { currentBoardId } = useBoard();

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2, overflow: 'hidden' }}>
        <BoardSelector />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {currentBoardId ? (
            <>
              <Dashboard />
              <KanbanBoard />
            </>
          ) : (
            <Paper
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginTop: '2rem',
                padding: '1rem',
              }}
            >
              <Typography variant="h6">ボードがありません。新しいボードを作成してください。</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default App;