import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Button, TextField, Box, FormControl, InputLabel, Select, MenuItem, Chip, FormHelperText, Paper, SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../context/ThemeContext';

interface TaskFormProps {
  columnId: string;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ columnId, onClose }) => {
  const { darkMode } = useTheme();
  const { addTask, labels } = useBoard();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(columnId, {
      title: title.trim(),
      description,
      dueDate,
      priority,
      labels: selectedLabelIds,
      assignee,
    });

    onClose();
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as 'high' | 'medium' | 'low');
  };

  const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLabelIds(event.target.value as string[]);
  };

  return (
    <Paper 
      sx={{
        padding: '1rem',
        marginBottom: '0.5rem',
        backgroundColor: darkMode ? '#444' : '#fff',
        color: darkMode ? '#fff' : '#333'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>新規タスク</h3>
          <Button size="small" onClick={onClose} startIcon={<CloseIcon />}>
            キャンセル
          </Button>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          label="タイトル"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="small"
        />

        <TextField
          margin="dense"
          label="説明"
          multiline
          rows={3}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            margin="dense"
            label="期限"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value || null)}
            size="small"
          />

          <FormControl margin="dense" fullWidth size="small">
            <InputLabel id="priority-label">優先度</InputLabel>
            <Select
              labelId="priority-label"
              value={priority}
              label="優先度"
              onChange={handlePriorityChange}
            >
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          margin="dense"
          label="担当者"
          fullWidth
          value={assignee || ''}
          onChange={(e) => setAssignee(e.target.value || null)}
          size="small"
        />

        <FormControl fullWidth margin="dense" size="small">
          <InputLabel id="labels-label">ラベル</InputLabel>
          <Select
            labelId="labels-label"
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
                        borderStyle: 'solid',
                        height: '20px',
                        fontSize: '0.7rem'
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={!title.trim()}
          >
            作成
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default TaskForm;