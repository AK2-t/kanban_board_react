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
    
    // Calculate user statistics
    const userStats: { [key: string]: { total: number; completed: number; overdue: number; high: number } } = {};
    
    Object.values(data.users).forEach(user => {
      userStats[user.id] = { total: 0, completed: 0, overdue: 0, high: 0 };
    });
    
    allTasks.forEach(task => {
      // Handle assignees array
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assigneeId => {
          if (userStats[assigneeId]) {
            userStats[assigneeId].total++;
            if (completedColumnIds.includes(task.columnId)) {
              userStats[assigneeId].completed++;
            }
            if (!completedColumnIds.includes(task.columnId) && isOverdue(task.dueDate)) {
              userStats[assigneeId].overdue++;
            }
            if (task.priority === 'high') {
              userStats[assigneeId].high++;
            }
          }
        });
      }
      // Handle legacy assignee field
      else if (task.assignee) {
        const user = Object.values(data.users).find(u => u.name === task.assignee);
        if (user && userStats[user.id]) {
          userStats[user.id].total++;
          if (completedColumnIds.includes(task.columnId)) {
            userStats[user.id].completed++;
          }
          if (!completedColumnIds.includes(task.columnId) && isOverdue(task.dueDate)) {
            userStats[user.id].overdue++;
          }
          if (task.priority === 'high') {
            userStats[user.id].high++;
          }
        }
      }
    });
    
    // Get top performing users
    const topUsers = Object.keys(userStats)
      .map(userId => ({
        user: data.users[userId],
        stats: userStats[userId],
        completionRate: userStats[userId].total > 0 ? 
          Math.round((userStats[userId].completed / userStats[userId].total) * 100) : 0
      }))
      .filter(item => item.stats.total > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      highPriorityTasks,
      topLabels: sortedLabels,
      topUsers,
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
      
      {/* User Statistics */}
      {stats.topUsers.length > 0 && (
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
            担当者別統計
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {stats.topUsers.map(({ user, stats: userTaskStats, completionRate }) => (
              <Box 
                key={user.id}
                sx={{
                  minWidth: '200px',
                  padding: '0.5rem',
                  border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                  borderRadius: '4px',
                  backgroundColor: darkMode ? '#444' : '#f9f9f9'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.role || 'メンバー'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    完了率: {completionRate}% ({userTaskStats.completed}/{userTaskStats.total})
                  </Typography>
                  {userTaskStats.overdue > 0 && (
                    <Typography variant="body2" color="error">
                      期限切れ: {userTaskStats.overdue}件
                    </Typography>
                  )}
                  {userTaskStats.high > 0 && (
                    <Typography variant="body2" color="warning.main">
                      高優先度: {userTaskStats.high}件
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Statistics;