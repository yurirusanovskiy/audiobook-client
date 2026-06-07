'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Box, Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/lib/api';

interface UploadBookModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadBookModal({ open, onClose }: UploadBookModalProps) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('ru-RU');
  const [file, setFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title || !file) throw new Error("Title and File are required");
      
      // 1. Create the project metadata
      const project = await projectService.createProject({
        title,
        // Assuming backend handles language_code or we can add it to Project model. 
        // Our backend API reference says POST /projects takes title and language_code.
      });
      
      const projectId = project.id;
      if (!projectId) throw new Error("Failed to create project");

      // 2. Upload the book and trigger chunking
      const uploadRes = await projectService.uploadBook(projectId, file);
      return uploadRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to upload book", error);
      alert("Failed to upload book. Please try again.");
    }
  });

  const handleClose = () => {
    setTitle('');
    setLanguage('ru-RU');
    setFile(null);
    mutation.reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create / Upload New Book</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Project Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending}
          />
          
          <TextField
            select
            label="Language"
            fullWidth
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={mutation.isPending}
          >
            <MenuItem value="ru-RU">Russian</MenuItem>
            <MenuItem value="ro-RO">Romanian</MenuItem>
            <MenuItem value="en-US">English</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ height: 100, borderStyle: 'dashed', borderWidth: 2 }}
            disabled={mutation.isPending}
          >
            {file ? file.name : "Select .txt File"}
            <input
              type="file"
              hidden
              accept=".txt"
              onChange={handleFileChange}
            />
          </Button>
          
          {mutation.isPending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Uploading and segmenting book into scenes using ML...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          disabled={!title || !file || mutation.isPending}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
