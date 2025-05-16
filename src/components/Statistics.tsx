import React, { useMemo } from 'react';
import { useBoard } from '../context/BoardContext';
import { Typography, Paper, Box, Divider, Chip } from '@mui/material';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';
import { isOverdue } from '../utils/dateUtils';

const Statistics: React.FC = () => {
  const { darkMode } = useTheme();
  const { data, currentBoardId, labels } = useBoard();

  const stats = useMemo(() => {
    if (!currentBoardId) return null;
    
    const board = data.boards[currentBoardId];
    if (!board) return null;
    
    // Get all tasks in the current board
    const allTasks: Task[] = [];
    const completedColumnIds: string[] = [];
    
    // Find "completed" column(s) (those with "完了" in the title)
    board.columnOrder.forEach(columnId => {
      const column = board.columns[columnId];
      if (column.title.includes('完了')) {
        completedColumnIds.push(columnId);
      }
      
      column.taskIds.forEach(taskId => {
        const task = data.tasks[taskId];
        if (task) {
          allTasks.push(task);
        }
      });
    });
    
    // Calculate statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => 
      completedColumnIds.includes(task.columnId)
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const overdueTasks = allTasks.filter(task => 
      !completedColumnIds.includes(task.columnId) && isOverdue(task.dueDate)
    ).length;
    
    const highPriorityTasks = allTasks.filter(task => 
      !completedColumnIds.includes(task.columnId) && task.priority === 'high'
    ).length;
    
    // Calculate label usage
    const labelUsage: { [key: string]: number } = {};
    
    labels.forEach(label => {
      labelUsage[label.id] = 0;
    });
    
    allTasks.forEach(task => {
      task.labels.forEach(labelId => {
        if (labelUsage[labelId] !== undefined) {
          labelUsage[labelId]++;
        }
      });
    });
    
    // Sort labels by usage
    const sortedLabels = labels
      .map(label => ({
        ...label,
        count: labelUsage[label.id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 labels
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      highPriorityTasks,
      topLabels: sortedLabels,
    };
  }, [data, currentBoardId, labels]);

  if (!stats) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>ボード統計</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Paper 
          sx={{ 
            flex: 1,
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }}
        >
          <Typography 
            variant="subtitle2" 
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            完了率
          </Typography>
          
          <Box sx={{ fontSize: '1.5rem', fontWeight: 500, marginTop: '0.5rem' }}>
            {stats.completionRate}%
          </Box>
          
          <Box 
            sx={{ 
              height: '8px',
              backgroundColor: darkMode ? '#555' : '#eee',
              borderRadius: '4px',
              marginTop: '0.5rem',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${stats.completionRate}%`,
                backgroundColor: 
                  stats.completionRate < 30 ? '#f44336' : 
                  stats.completionRate < 70 ? '#ff9800' : 
                  '#4caf50',
                transition: 'width 0.5s ease'
              }
            }}
          />
          
          <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
            {stats.completedTasks} / {stats.totalTasks} タスク完了
          </Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            flex: 1,
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }}
        >
          <Typography 
            variant="subtitle2" 
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            優先度「高」のタスク
          </Typography>
          
          <Box sx={{ fontSize: '1.5rem', fontWeight: 500, marginTop: '0.5rem' }}>
            {stats.highPriorityTasks}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
            優先度「高」の未完了タスク
          </Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            flex: 1,
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#333'
          }}
        >
          <Typography 
            variant="subtitle2" 
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            期限切れのタスク
          </Typography>
          
          <Box sx={{ fontSize: '1.5rem', fontWeight: 500, marginTop: '0.5rem' }}>
            {stats.overdueTasks}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
            有効な期限があり期限切れのタスク
          </Typography>
        </Paper>
      </Box>
      
      <Paper 
        sx={{ 
          marginTop: 2,
          padding: '1rem',
          backgroundColor: darkMode ? '#333' : '#fff',
          color: darkMode ? '#fff' : '#333'
        }}
      >
        <Typography 
          variant="subtitle2" 
          color="textSecondary"
          sx={{ fontWeight: 500 }}
        >
          よく使用されるラベル
        </Typography>
        
        {stats.topLabels.length > 0 ? (
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {stats.topLabels.map(label => (
              <Chip 
                key={label.id} 
                label={`${label.name} (${label.count})`} 
                size="small"
                sx={{ 
                  backgroundColor: `${label.color}20`,
                  borderColor: label.color,
                  color: label.color,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }} 
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
            ラベルがまだ使われていません
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Statistics;