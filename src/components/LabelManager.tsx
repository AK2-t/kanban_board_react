import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { Dialog, DialogTitle, DialogContent, Box, List, ListItem, ListItemText, IconButton, TextField, Button, DialogActions, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Label as LabelIcon } from '@mui/icons-material';
import { TwitterPicker } from 'react-color';

interface LabelManagerProps {
  open: boolean;
  onClose: () => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({ open, onClose }) => {
  const { darkMode } = useTheme();
  const { labels, addLabel, updateLabel, deleteLabel } = useBoard();
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#61bd4f');

  const handleAddLabelClick = () => {
    setIsAddingLabel(true);
    setLabelName('');
    setLabelColor('#61bd4f');
  };

  const handleEditLabelClick = (labelId: string) => {
    const label = labels.find(l => l.id === labelId);
    if (label) {
      setSelectedLabel(labelId);
      setLabelName(label.name);
      setLabelColor(label.color);
      setIsEditingLabel(true);
    }
  };

  const handleDeleteLabelClick = (labelId: string) => {
    if (window.confirm('このラベルを削除しますか？このラベルが付いたタスクからも削除されます。')) {
      deleteLabel(labelId);
    }
  };

  const handleDialogClose = () => {
    setIsAddingLabel(false);
    setIsEditingLabel(false);
  };

  const handleSubmit = () => {
    if (labelName.trim()) {
      if (isEditingLabel && selectedLabel) {
        updateLabel(selectedLabel, labelName.trim(), labelColor);
      } else {
        addLabel(labelName.trim(), labelColor);
      }
      handleDialogClose();
    }
  };

  const handleColorChange = (color: any) => {
    setLabelColor(color.hex);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          ラベル管理
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddLabelClick}
            size="small"
            variant="outlined"
          >
            新規ラベル
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {labels.map((label) => (
            <ListItem
              key={label.id}
              secondaryAction={
                <Box>
                  <Tooltip title="編集">
                    <IconButton
                      edge="end"
                      onClick={() => handleEditLabelClick(label.id)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="削除">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteLabelClick(label.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <Box 
                sx={{ 
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: label.color,
                  marginRight: '10px'
                }} 
              />
              <ListItemText primary={label.name} />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '16px',
                  padding: '4px 8px',
                  backgroundColor: `${label.color}20`,
                  border: `1px solid ${label.color}`,
                  color: label.color,
                  fontSize: '0.75rem',
                  marginLeft: '10px'
                }}
              >
                <LabelIcon fontSize="small" sx={{ marginRight: 0.5 }} />
                {label.name}
              </Box>
            </ListItem>
          ))}
        </List>

        {labels.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
            ラベルがありません。新しいラベルを作成してください。
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>

      {/* Add/Edit Label Dialog */}
      <Dialog
        open={isAddingLabel || isEditingLabel}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {isEditingLabel ? 'ラベルを編集' : '新規ラベルの作成'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ラベル名"
            fullWidth
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 1 }}>カラー</Box>
            <TwitterPicker
              color={labelColor}
              onChange={handleColorChange}
              triangle="hide"
              width="100%"
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1 }}>プレビュー:</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '16px',
                padding: '4px 8px',
                backgroundColor: `${labelColor}20`,
                border: `1px solid ${labelColor}`,
                color: labelColor,
                fontSize: '0.75rem',
                marginLeft: '10px'
              }}
            >
              <LabelIcon fontSize="small" sx={{ marginRight: 0.5 }} />
              {labelName || 'ラベル名'}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={!labelName.trim()}
          >
            {isEditingLabel ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default LabelManager;