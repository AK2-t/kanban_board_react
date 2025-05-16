import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBoard } from '../context/BoardContext';
import { IconButton, Button, Typography, Box } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Header: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { exportData, importData } = useBoard();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      component="header"
      sx={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${darkMode ? '#555' : '#ddd'}`,
        backgroundColor: darkMode ? '#333' : '#fff',
        color: darkMode ? '#fff' : '#333',
      }}
    >
      <Typography variant="h5" component="h1">
        カンバンボード
      </Typography>
      <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<FileDownloadIcon />} 
            onClick={handleExport}
          >
            エクスポート
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<FileUploadIcon />} 
            onClick={handleImportClick}
          >
            インポート
          </Button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportChange}
            style={{ display: 'none' }}
          />
        </Box>
        <IconButton onClick={toggleTheme} size="small" color="inherit">
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;