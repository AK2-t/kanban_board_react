import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useBoard } from '../context/BoardContext';
import { Task } from '../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { IconButton, Menu, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Paper, Typography } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: Task[];
  index: number;
  boardId: string;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, index, boardId }) => {
  const { darkMode } = useTheme();
  const { updateColumn, deleteColumn } = useBoard();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditColumn = () => {
    setColumnTitle(column.title);
    setIsEditingColumn(true);
    handleMenuClose();
  };

  const handleDeleteColumn = () => {
    deleteColumn(boardId, column.id);
    handleMenuClose();
  };

  const handleColumnUpdate = () => {
    if (columnTitle.trim()) {
      updateColumn(boardId, column.id, columnTitle.trim());
    }
    setIsEditingColumn(false);
  };

  const handleAddTaskToggle = () => {
    setIsAddingTask(!isAddingTask);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <Box
          {...provided.draggableProps}
          ref={provided.innerRef}
          sx={{
            margin: '0 0.5rem',
            backgroundColor: darkMode ? '#333' : '#f0f0f0',
            borderRadius: '0.25rem',
            width: '280px',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
          }}
        >
          <Box 
            {...provided.dragHandleProps}
            sx={{
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: darkMode ? '#fff' : '#333',
                margin: 0 
              }}
            >
              {column.title}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  padding: '0.5rem',
                  flexGrow: 1,
                  minHeight: '100px',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: snapshot.isDraggingOver
                    ? darkMode ? '#3a3a3a' : '#e6e6e6'
                    : 'transparent'
                }}
              >
                {tasks.map((task, taskIndex) => (
                  <TaskCard key={task.id} task={task} index={taskIndex} />
                ))}
                {provided.placeholder}
                {isAddingTask && (
                  <TaskForm
                    columnId={column.id}
                    onClose={handleAddTaskToggle}
                  />
                )}
              </Box>
            )}
          </Droppable>

          {!isAddingTask && (
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddTaskToggle}
              fullWidth
              variant="text"
              size="small"
              sx={{
                margin: '0.5rem',
                color: darkMode ? '#bbb' : '#666',
                backgroundColor: darkMode ? '#444' : '#e0e0e0',
                '&:hover': {
                  backgroundColor: darkMode ? '#555' : '#d5d5d5'
                }
              }}
            >
              タスクを追加
            </Button>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditColumn}>カラムを編集</MenuItem>
            <MenuItem onClick={handleDeleteColumn}>カラムを削除</MenuItem>
          </Menu>

          <Dialog open={isEditingColumn} onClose={() => setIsEditingColumn(false)}>
            <DialogTitle>カラム名を編集</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="カラム名"
                fullWidth
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditingColumn(false)}>キャンセル</Button>
              <Button
                onClick={handleColumnUpdate}
                disabled={!columnTitle.trim()}
                color="primary"
              >
                更新
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Draggable>
  );
};

export default Column;