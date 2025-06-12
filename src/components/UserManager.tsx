import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { User } from '../types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface UserManagerProps {
  open: boolean;
  onClose: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ open, onClose }) => {
  const { darkMode } = useTheme();
  const { users, addUser, updateUser, deleteUser } = useBoard();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as User['role'],
    avatar: ''
  });

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    addUser(formData.name, formData.email, formData.role, formData.avatar || undefined);
    setFormData({ name: '', email: '', role: 'member', avatar: '' });
    setShowAddForm(false);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !formData.name.trim() || !formData.email.trim()) return;
    
    updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.avatar || undefined
    });
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'member', avatar: '' });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || ''
    });
    setShowAddForm(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('このユーザーを削除しますか？')) {
      deleteUser(userId);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setShowAddForm(false);
    setFormData({ name: '', email: '', role: 'member', avatar: '' });
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'member': return 'メンバー';
      case 'viewer': return '閲覧者';
      default: return role;
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error';
      case 'member': return 'primary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>ユーザー管理</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setShowAddForm(true);
              setEditingUser(null);
              setFormData({ name: '', email: '', role: 'member', avatar: '' });
            }}
            disabled={showAddForm || !!editingUser}
          >
            ユーザーを追加
          </Button>
        </Box>

        {(showAddForm || editingUser) && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: darkMode ? '#333' : '#f5f5f5' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {editingUser ? 'ユーザーを編集' : '新規ユーザーを追加'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="名前"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                size="small"
              />
              
              <TextField
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                size="small"
              />
              
              <TextField
                label="アバターURL（オプション）"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                fullWidth
                size="small"
                placeholder="https://example.com/avatar.jpg"
              />
              
              <FormControl fullWidth size="small">
                <InputLabel>役割</InputLabel>
                <Select
                  value={formData.role}
                  label="役割"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                >
                  <MenuItem value="admin">管理者</MenuItem>
                  <MenuItem value="member">メンバー</MenuItem>
                  <MenuItem value="viewer">閲覧者</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  disabled={!formData.name.trim() || !formData.email.trim()}
                >
                  {editingUser ? '更新' : '追加'}
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  キャンセル
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          登録ユーザー一覧 ({users.length}人)
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ユーザー</TableCell>
                <TableCell>メールアドレス</TableCell>
                <TableCell>役割</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ width: 32, height: 32 }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user)}
                      disabled={showAddForm || !!editingUser}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={showAddForm || !!editingUser}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      登録されているユーザーがありません
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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