import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task as TaskType } from '../types';
import TaskDetails from './TaskDetails';
import { formatDate, isOverdue, isToday, isUpcoming } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { useBoard } from '../context/BoardContext';
import { Paper, Typography, Chip, Box } from '@mui/material';
import { PriorityHigh, Label } from '@mui/icons-material';

interface TaskProps {
  task: TaskType;
  index: number;
}

const TaskCard: React.FC<TaskProps> = ({ task, index }) => {
  const { darkMode } = useTheme();
  const { labels } = useBoard();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const taskOverdue = isOverdue(task.dueDate);
  const taskIsToday = isToday(task.dueDate);
  const taskIsUpcoming = isUpcoming(task.dueDate);

  const taskLabels = task.labels
    .map(labelId => labels.find(label => label.id === labelId))
    .filter(label => label !== undefined);

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return 'inherit';
    }
  };

  // Date chip styling based on date status
  const getDateChipStyles = () => {
    if (taskOverdue) {
      return {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        borderColor: '#ffcdd2'
      };
    }
    if (taskIsToday) {
      return {
        backgroundColor: '#e8f5e9',
        color: '#388e3c',
        borderColor: '#c8e6c9'
      };
    }
    if (taskIsUpcoming) {
      return {
        backgroundColor: '#fff8e1',
        color: '#f57c00',
        borderColor: '#ffecb3'
      };
    }
    return {};
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            elevation={snapshot.isDragging ? 3 : 1}
            onClick={handleCardClick}
            sx={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: darkMode ? '#444' : '#fff',
              color: darkMode ? '#fff' : '#333',
              boxShadow: taskOverdue ? 
                '0 0 0 2px #f44336 !important' : 
                '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08) !important'
              },
              '&:last-child': {
                marginBottom: 0
              }
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500, 
                marginBottom: '0.5rem', 
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </Typography>
            
            {taskLabels.length > 0 && (
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.25rem',
                marginTop: '0.25rem'
              }}>
                {taskLabels.map(label => (
                  label && (
                    <Chip
                      key={label.id}
                      icon={<Label />}
                      label={label.name}
                      size="small"
                      sx={{ 
                        backgroundColor: `${label.color}20`,
                        borderColor: label.color,
                        color: label.color,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        height: '20px',
                        fontSize: '0.7rem'
                      }}
                    />
                  )
                ))}
              </Box>
            )}
            
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <Box display="flex" alignItems="center">
                {task.priority !== 'medium' && (
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: getPriorityColor(task.priority),
                    fontSize: '0.75rem',
                    marginRight: '0.5rem'
                  }}>
                    <PriorityHigh fontSize="small" sx={{ marginRight: '2px' }} />
                    {task.priority === 'high' ? '高' : '低'}
                  </Box>
                )}
                
                {task.assignee && (
                  <Chip 
                    label={task.assignee} 
                    size="small"
                    sx={{ 
                      height: '20px', 
                      fontSize: '0.7rem',
                      marginRight: '4px' 
                    }} 
                  />
                )}
              </Box>
              
              {task.dueDate && (
                <Chip 
                  variant="outlined" 
                  size="small" 
                  label={formatDate(task.dueDate)}
                  sx={{
                    fontSize: '0.7rem',
                    height: '24px',
                    ...getDateChipStyles()
                  }}
                />
              )}
            </Box>
          </Paper>
        )}
      </Draggable>
      
      <TaskDetails 
        open={detailsOpen} 
        handleClose={handleCloseDetails} 
        task={task} 
      />
    </>
  );
};

export default TaskCard;
