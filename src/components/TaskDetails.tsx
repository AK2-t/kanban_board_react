import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';
import { Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip, Typography, IconButton, SelectChangeEvent, Tabs, Tab, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '../context/ThemeContext';

interface TaskDetailsProps {
  open: boolean;
  handleClose: () => void;
  task: Task;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ open, handleClose, task }) => {
  const { darkMode } = useTheme();
  const { updateTask, deleteTask, labels, addComment, markCommentsAsRead } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(task.labels);
  const [tabValue, setTabValue] = useState(0);
  const [newComment, setNewComment] = useState('');

  // Update state when task changes
  useEffect(() => {
    setEditedTask(task);
    setSelectedLabelIds(task.labels);
    if (task.hasNewComments) {
      markCommentsAsRead(task.id);
    }
  }, [task, markCommentsAsRead]);

  const handleEditClick = () => {
    setEditedTask({ ...task });
    setSelectedLabelIds(task.labels);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    updateTask(task.id, {
      ...editedTask,
      labels: selectedLabelIds,
    });
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    deleteTask(task.id);
    handleClose();
  };

  const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLabelIds(event.target.value as string[]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setEditedTask(prev => ({
      ...prev,
      priority: event.target.value as 'high' | 'medium' | 'low'
    }));
  };

  const taskLabels = task.labels
    .map(labelId => labels.find(label => label.id === labelId))
    .filter(label => label !== undefined);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim(), 'デフォルトユーザー');
      setNewComment('');
    }
  };

  const renderTaskDetails = () => (
    <>
      <Box sx={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
        borderRadius: '4px'
      }}>
        <Typography variant="subtitle2" color="textSecondary">説明</Typography>
        {task.description ? (
          <Typography 
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              backgroundColor: darkMode ? '#444' : '#fff',
              padding: '1rem',
              borderRadius: '4px',
              marginTop: '0.5rem',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`
            }}
          >
            {task.description}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
            説明がありません
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Typography variant="subtitle2" color="textSecondary">優先度</Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'} 
                color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                size="small" 
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Typography variant="subtitle2" color="textSecondary">期限</Typography>
            <Box sx={{ mt: 1 }}>
              {task.dueDate ? (
                <Typography variant="body2">{formatDate(task.dueDate)}</Typography>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  期限なし
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Typography variant="subtitle2" color="textSecondary">担当者</Typography>
            <Box sx={{ mt: 1 }}>
              {task.assignee ? (
                <Chip label={task.assignee} />
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  担当者なし
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            borderRadius: '4px'
          }}>
            <Typography variant="subtitle2" color="textSecondary">ラベル</Typography>
            {taskLabels.length > 0 ? (
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {taskLabels.map(label => (
                  label && (
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
                  )
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                ラベルなし
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
        borderRadius: '4px'
      }}>
        <Typography variant="subtitle2" color="textSecondary">作成日時</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {new Date(task.createdAt).toLocaleString('ja-JP')}
        </Typography>
      </Box>
    </>
  );

  const renderComments = () => (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="コメントを入力..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleCommentSubmit}
          disabled={!newComment.trim()}
          startIcon={<SendIcon />}
          size="small"
        >
          コメント送信
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {task.comments && task.comments.length > 0 ? (
        <Box>
          {task.comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: darkMode ? '#444' : '#f9f9f9',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {comment.author}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(comment.createdAt).toLocaleString('ja-JP')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
          まだコメントがありません
        </Typography>
      )}
    </Box>
  );

  const renderHistory = () => (
    <Box>
      {task.history && task.history.length > 0 ? (
        <Box>
          {task.history.slice().reverse().map((entry) => (
            <Box
              key={entry.id}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: darkMode ? '#444' : '#f9f9f9',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {entry.author}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(entry.timestamp).toLocaleString('ja-JP')}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {entry.details}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
          履歴がありません
        </Typography>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {isEditing ? (
        // Edit Mode
        <>
          <DialogTitle>タスクの編集</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="タイトル"
              type="text"
              fullWidth
              value={editedTask.title}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="説明"
              multiline
              rows={4}
              fullWidth
              value={editedTask.description}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="priority-label">優先度</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={editedTask.priority}
                label="優先度"
                onChange={handlePriorityChange}
              >
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="dueDate"
              label="期限"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editedTask.dueDate || ''}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="assignee"
              label="担当者"
              fullWidth
              value={editedTask.assignee || ''}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditing(false)} color="inherit">キャンセル</Button>
            <Button onClick={handleSaveClick} color="primary" disabled={!editedTask.title.trim()}>保存</Button>
          </DialogActions>
        </>
      ) : (
        // View Mode
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{task.title}</Typography>
              <Box>
                <IconButton size="small" onClick={handleEditClick} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleDeleteClick} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="task details tabs">
                <Tab label="詳細" />
                <Tab 
                  label={`コメント (${task.comments?.length || 0})`}
                  sx={{
                    color: task.hasNewComments ? 'error.main' : 'inherit',
                    fontWeight: task.hasNewComments ? 'bold' : 'normal'
                  }}
                />
                <Tab label={`履歴 (${task.history?.length || 0})`} />
              </Tabs>
            </Box>

            {tabValue === 0 && renderTaskDetails()}
            {tabValue === 1 && renderComments()}
            {tabValue === 2 && renderHistory()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">閉じる</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default TaskDetails;