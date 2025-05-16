import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '../context/ThemeContext';

interface AddColumnProps {
  boardId: string;
}

const AddColumn: React.FC<AddColumnProps> = ({ boardId }) => {
  const { darkMode } = useTheme();
  const { addColumn } = useBoard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setColumnTitle('');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddColumn = () => {
    if (columnTitle.trim()) {
      addColumn(boardId, columnTitle.trim());
      handleCloseDialog();
    }
  };

  return (
    <>
      <Box
        sx={{
          margin: '0 0.5rem',
          padding: '0.5rem',
          backgroundColor: darkMode ? '#444' : '#e0e0e0',
          borderRadius: '0.25rem',
          width: '280px',
          height: 'fit-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          transition: 'background-color 0.3s ease'
        }}
      >
        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          fullWidth
          variant="text"
          sx={{
            color: darkMode ? '#bbb' : '#666',
            '&:hover': {
              backgroundColor: darkMode ? '#555' : '#d5d5d5'
            }
          }}
        >
          新規カラム
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>新規カラム作成</DialogTitle>
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
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button
            onClick={handleAddColumn}
            color="primary"
            disabled={!columnTitle.trim()}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddColumn;