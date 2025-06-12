import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';
import { Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip, 
  Typography, IconButton, SelectChangeEvent, Tabs, Tab, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Divider, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '../context/ThemeContext';

interface TaskDetailsProps {
  open: boolean;
  handleClose: () => void;
  task: Task;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `task-tab-${index}`,
    'aria-controls': `task-tabpanel-${index}`,
  };
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ open, handleClose, task }) => {
  const { darkMode } = useTheme();
  const { updateTask, deleteTask, labels, data, addComment, currentUser } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(task.labels);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(task.assignees || []);
  const [tabValue, setTabValue] = useState(0);
  const [newComment, setNewComment] = useState('');

  const availableUsers = Object.values(data.users);

  // Update state when task changes
  useEffect(() => {
    setEditedTask(task);
    setSelectedLabelIds(task.labels);
    setSelectedAssignees(task.assignees || []);
    
    // Clear new comment indicator when opening details
    if (task.hasNewComments) {
      updateTask(task.id, { hasNewComments: false });
    }
  }, [task, updateTask]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditedTask({ ...task });
    setSelectedLabelIds(task.labels);
    setSelectedAssignees(task.assignees || []);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    updateTask(task.id, {
      ...editedTask,
      labels: selectedLabelIds,
      assignees: selectedAssignees,
      assignee: selectedAssignees.length > 0 ? selectedAssignees[0] : null,
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

  const handleAssigneeChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedAssignees(event.target.value as string[]);
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const getAssigneeNames = () => {
    if (task.assignees && task.assignees.length > 0) {
      return task.assignees
        .map(assigneeId => data.users[assigneeId]?.name || assigneeId)
        .filter(name => name);
    }
    return task.assignee ? [task.assignee] : [];
  };

  const taskLabels = task.labels
    .map(labelId => labels.find(label => label.id === labelId))
    .filter(label => label !== undefined);

  const assigneeNames = getAssigneeNames();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
            <FormControl fullWidth margin="dense">
              <InputLabel id="assignees-label">担当者</InputLabel>
              <Select
                labelId="assignees-label"
                multiple
                value={selectedAssignees}
                label="担当者"
                onChange={handleAssigneeChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((userId) => {
                      const user = availableUsers.find(u => u.id === userId);
                      return user ? (
                        <Chip 
                          key={user.id} 
                          label={user.name} 
                          size="small"
                          sx={{ 
                            backgroundColor: darkMode ? '#555' : '#e3f2fd',
                            color: darkMode ? '#fff' : '#1976d2'
                          }} 
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Chip 
                      label={user.name} 
                      size="small"
                      sx={{ 
                        backgroundColor: darkMode ? '#555' : '#e3f2fd',
                        color: darkMode ? '#fff' : '#1976d2'
                      }} 
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>複数選択可能です</FormHelperText>
            </FormControl>
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
        // View Mode with Tabs
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
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="task details tabs">
              <Tab label="詳細" {...a11yProps(0)} />
              <Tab 
                label="コメント" 
                icon={task.comments && task.comments.length > 0 ? <CommentIcon /> : undefined}
                {...a11yProps(1)} 
              />
              <Tab 
                label="履歴" 
                icon={<HistoryIcon />} 
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>
          
          <DialogContent sx={{ padding: 0 }}>
            <TabPanel value={tabValue} index={0}>
              {/* Task Details */}
              <Box sx={{
                marginBottom: '1rem',
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

              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{
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

              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{
                    padding: '1rem',
                    backgroundColor: darkMode ? '#333' : '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    <Typography variant="subtitle2" color="textSecondary">担当者</Typography>
                    <Box sx={{ mt: 1 }}>
                      {assigneeNames.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {assigneeNames.map((name, index) => (
                            <Chip key={index} label={name} size="small" />
                          ))}
                        </Box>
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
                padding: '1rem',
                backgroundColor: darkMode ? '#333' : '#f5f5f5',
                borderRadius: '4px'
              }}>
                <Typography variant="subtitle2" color="textSecondary">作成日時</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {new Date(task.createdAt).toLocaleString('ja-JP')}
                </Typography>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {/* Comments Tab */}
              <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                  {task.comments && task.comments.length > 0 ? (
                    <List>
                      {task.comments.map((comment, index) => (
                        <React.Fragment key={comment.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2">{comment.author}</Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Paper sx={{ 
                                  p: 1, 
                                  mt: 1, 
                                  backgroundColor: darkMode ? '#444' : '#f8f9fa',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {comment.text}
                                </Paper>
                              }
                            />
                          </ListItem>
                          {index < task.comments.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        まだコメントがありません
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Add Comment */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="コメントを追加..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {/* History Tab */}
              <Box sx={{ height: '400px', overflowY: 'auto' }}>
                {task.history && task.history.length > 0 ? (
                  <List>
                    {task.history.map((entry, index) => (
                      <React.Fragment key={entry.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <HistoryIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2">{entry.author}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(entry.timestamp).toLocaleString('ja-JP')}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <strong>{entry.action}:</strong> {entry.details}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < task.history.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      履歴がありません
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>
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