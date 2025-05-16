import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, TextField, Box, Chip, FormHelperText, Typography, Divider, SelectChangeEvent } from '@mui/material';

interface TaskFilterProps {
  open: boolean;
  onClose: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ open, onClose }) => {
  const { darkMode } = useTheme();
  const { data, currentBoardId, labels } = useBoard();
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<string>('all');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [assignee, setAssignee] = useState<string>('all');
  const [uniqueAssignees, setUniqueAssignees] = useState<string[]>([]);

  useEffect(() => {
    if (!currentBoardId || !open) return;
    
    const board = data.boards[currentBoardId];
    if (!board) return;
    
    // Collect all tasks in the current board
    const allTasks: Task[] = [];
    const assignees = new Set<string>();
    
    board.columnOrder.forEach(columnId => {
      const column = board.columns[columnId];
      column.taskIds.forEach(taskId => {
        const task = data.tasks[taskId];
        if (task) {
          allTasks.push(task);
          if (task.assignee) {
            assignees.add(task.assignee);
          }
        }
      });
    });
    
    setUniqueAssignees(Array.from(assignees).sort());
    
    // Apply filters
    let filtered = allTasks;
    
    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term)
      );
    }
    
    // Priority filter
    if (priority !== 'all') {
      filtered = filtered.filter(task => task.priority === priority);
    }
    
    // Labels filter
    if (selectedLabelIds.length > 0) {
      filtered = filtered.filter(task => 
        selectedLabelIds.some(labelId => task.labels.includes(labelId))
      );
    }
    
    // Assignee filter
    if (assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee === assignee);
    }
    
    setFilteredTasks(filtered);
  }, [data, currentBoardId, searchTerm, priority, selectedLabelIds, assignee, open]);

  const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLabelIds(event.target.value as string[]);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriority('all');
    setSelectedLabelIds([]);
    setAssignee('all');
  };

  if (!currentBoardId) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>タスクフィルター</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="キーワード検索"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="タイトルまたは説明で検索"
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="priority-filter-label">優先度</InputLabel>
            <Select
              labelId="priority-filter-label"
              value={priority}
              label="優先度"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel id="assignee-filter-label">担当者</InputLabel>
            <Select
              labelId="assignee-filter-label"
              value={assignee}
              label="担当者"
              onChange={(e) => setAssignee(e.target.value)}
            >
              <MenuItem value="all">すべて</MenuItem>
              {uniqueAssignees.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth margin="dense">
          <InputLabel id="label-filter-label">ラベル</InputLabel>
          <Select
            labelId="label-filter-label"
            multiple
            value={selectedLabelIds}
            label="ラベル"
            onChange={handleLabelChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((labelId) => {
                  const label = labels.find(l => l.id === labelId);
                  return label ? (
                    <Chip 
                      key={label.id} 
                      label={label.name} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${label.color}20`,
                        borderColor: label.color,
                        color: label.color,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }} 
                    />
                  ) : null;
                })}
              </Box>
            )}
          >
            {labels.map((label) => (
              <MenuItem key={label.id} value={label.id}>
                <Chip 
                  label={label.name} 
                  size="small"
                  sx={{ 
                    backgroundColor: `${label.color}20`,
                    borderColor: label.color,
                    color: label.color,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }} 
                />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>複数選択可能です</FormHelperText>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleClearFilters}
          >
            フィルターをクリア
          </Button>
        </Box>

        <Divider sx={{ margin: '1rem 0' }} />

        <Typography variant="subtitle1">検索結果: {filteredTasks.length} タスク</Typography>
        
        {filteredTasks.length > 0 ? (
          <Box sx={{ mt: 1, maxHeight: '200px', overflowY: 'auto' }}>
            {filteredTasks.map((task) => {
              const column = Object.values(data.boards[currentBoardId].columns).find(
                col => col.id === task.columnId
              );
              
              return (
                <Box 
                  key={task.id} 
                  sx={{
                    p: 1,
                    mb: 1,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    backgroundColor: darkMode ? '#444' : '#f9f9f9'
                  }}
                >
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {column ? `カラム: ${column.title}` : ''}
                    {task.priority !== 'medium' && ` | 優先度: ${task.priority === 'high' ? '高' : '低'}`}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            条件に一致するタスクがありません
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFilter;