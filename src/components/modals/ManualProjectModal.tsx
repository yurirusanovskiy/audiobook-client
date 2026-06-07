'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Box
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/lib/api';

interface ManualProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManualProjectModal({ open, onClose }: ManualProjectModalProps) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('ru-RU');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      
      const project = await projectService.createProject({
        title,
        description,
        // Backend could support language later
      });
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create project", error);
      alert("Failed to create project. Please try again.");
    }
  });

  const handleClose = () => {
    setTitle('');
    setLanguage('ru-RU');
    setDescription('');
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
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

          <TextField
            label="Description (Optional)"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={mutation.isPending}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          disabled={!title || mutation.isPending}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
