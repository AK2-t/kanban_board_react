import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const BoardSelector: React.FC = () => {
  const { darkMode } = useTheme();
  const { data, currentBoardId, addBoard, updateBoard, deleteBoard, switchBoard } = useBoard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBoardId, setMenuBoardId] = useState<string | null>(null);

  const handleAddBoardClick = () => {
    setEditingBoardId(null);
    setBoardTitle('');
    setIsDialogOpen(true);
  };

  const handleEditBoard = (boardId: string) => {
    setEditingBoardId(boardId);
    setBoardTitle(data.boards[boardId].title);
    setIsDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteBoard = (boardId: string) => {
    deleteBoard(boardId);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setBoardTitle('');
    setEditingBoardId(null);
  };

  const handleBoardSubmit = () => {
    if (boardTitle.trim()) {
      if (editingBoardId) {
        updateBoard(editingBoardId, boardTitle.trim());
      } else {
        addBoard(boardTitle.trim());
      }
      handleDialogClose();
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, boardId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuBoardId(boardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBoardId(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {data.boardOrder.map((boardId) => (
          <Box key={boardId} sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                marginRight: '0.5rem',
                backgroundColor: boardId === currentBoardId ? 
                  (darkMode ? '#444' : '#e0e0e0') : 
                  'transparent',
                color: darkMode ? '#fff' : '#333',
                borderColor: darkMode ? '#555' : '#ccc',
                '&:hover': {
                  backgroundColor: darkMode ? '#555' : '#f0f0f0',
                }
              }}
              onClick={() => switchBoard(boardId)}
            >
              {data.boards[boardId].title}
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, boardId)}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddBoardClick}
        >
          新規ボード
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuBoardId && (
          <>
            <MenuItem onClick={() => handleEditBoard(menuBoardId)}>編集</MenuItem>
            <MenuItem onClick={() => handleDeleteBoard(menuBoardId)} disabled={data.boardOrder.length <= 1}>削除</MenuItem>
          </>
        )}
      </Menu>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{editingBoardId ? 'ボード編集' : '新規ボード作成'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ボード名"
            fullWidth
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button onClick={handleBoardSubmit} disabled={!boardTitle.trim()}>
            {editingBoardId ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BoardSelector;