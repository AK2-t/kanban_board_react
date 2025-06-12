import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { User } from '../types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Box, Card, CardContent, 
  Typography, Avatar, IconButton, Chip, List, ListItem, ListItemAvatar,
  ListItemText, ListItemSecondaryAction
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface UserManagerProps {
  open: boolean;
  onClose: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ open, onClose }) => {
  const { darkMode } = useTheme();
  const { data, addUser, updateUser } = useBoard();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('メンバー');
  const [newUserAvatar, setNewUserAvatar] = useState('');

  const users = Object.values(data.users);

  const handleAddUser = () => {
    if (newUserName.trim()) {
      addUser(
        newUserName.trim(),
        newUserAvatar.trim() || undefined,
        newUserRole
      );
      setNewUserName('');
      setNewUserAvatar('');
      setNewUserRole('メンバー');
      setIsAddingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserRole(user.role || 'メンバー');
    setNewUserAvatar(user.avatar || '');
  };

  const handleUpdateUser = () => {
    if (editingUser && newUserName.trim()) {
      updateUser(editingUser.id, {
        name: newUserName.trim(),
        role: newUserRole,
        avatar: newUserAvatar.trim() || undefined,
      });
      setEditingUser(null);
      setNewUserName('');
      setNewUserAvatar('');
      setNewUserRole('メンバー');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserAvatar('');
    setNewUserRole('メンバー');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
      case '管理者':
        return 'error';
      case 'lead':
      case 'リーダー':
        return 'warning';
      case 'member':
      case 'メンバー':
      default:
        return 'default';
    }
  };

  const getUserTaskCounts = (userId: string) => {
    const tasks = Object.values(data.tasks);
    const userTasks = tasks.filter(task => 
      task.assignees?.includes(userId) || task.assignee === data.users[userId]?.name
    );
    return {
      total: userTasks.length,
      high: userTasks.filter(task => task.priority === 'high').length,
      inProgress: userTasks.filter(task => {
        // Find tasks in progress columns (assuming column titles contain "進行" or similar)
        const board = Object.values(data.boards)[0]; // Current board
        if (!board) return false;
        const column = board.columns[task.columnId];
        return column?.title.includes('進行') || column?.title.includes('作業');
      }).length
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">ユーザー管理</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingUser(true)}
            disabled={isAddingUser || editingUser !== null}
          >
            ユーザー追加
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Add/Edit User Form */}
        {(isAddingUser || editingUser) && (
          <Card sx={{ mb: 2, backgroundColor: darkMode ? '#444' : '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {editingUser ? 'ユーザー編集' : '新規ユーザー追加'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  autoFocus
                  label="ユーザー名"
                  fullWidth
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>役割</InputLabel>
                  <Select
                    value={newUserRole}
                    label="役割"
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <MenuItem value="メンバー">メンバー</MenuItem>
                    <MenuItem value="リーダー">リーダー</MenuItem>
                    <MenuItem value="管理者">管理者</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="アバター URL (任意)"
                  fullWidth
                  value={newUserAvatar}
                  onChange={(e) => setNewUserAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="contained"
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    disabled={!newUserName.trim()}
                  >
                    {editingUser ? '更新' : '追加'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Typography variant="subtitle1" gutterBottom>
          登録ユーザー ({users.length}人)
        </Typography>
        
        {users.length > 0 ? (
          <List>
            {users.map((user) => {
              const taskCounts = getUserTaskCounts(user.id);
              return (
                <ListItem
                  key={user.id}
                  sx={{
                    border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: darkMode ? '#444' : '#fff'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        <Chip 
                          label={user.role || 'メンバー'} 
                          size="small" 
                          color={getRoleColor(user.role) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          担当タスク: {taskCounts.total}件
                          {taskCounts.high > 0 && ` | 高優先度: ${taskCounts.high}件`}
                          {taskCounts.inProgress > 0 && ` | 進行中: ${taskCounts.inProgress}件`}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user)}
                      disabled={isAddingUser || editingUser !== null}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            ユーザーが登録されていません
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

export default UserManager;