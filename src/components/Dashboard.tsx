import React, { useState } from 'react';
import Statistics from './Statistics';
import LabelManager from './LabelManager';
import { Button, Box, Typography } from '@mui/material';
import { Label as LabelIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import TaskFilter from './TaskFilter';
import { useTheme } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const { darkMode } = useTheme();
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <Box
      sx={{
        marginBottom: '1rem',
        padding: '1rem',
        borderRadius: '4px',
        backgroundColor: darkMode ? '#333' : '#f0f0f0'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <Typography variant="h6">ダッシュボード</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setIsFilterOpen(true)}
          >
            フィルター
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LabelIcon />}
            onClick={() => setIsLabelManagerOpen(true)}
          >
            ラベル管理
          </Button>
        </Box>
      </Box>

      <Statistics />

      <LabelManager
        open={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
      />

      <TaskFilter
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;