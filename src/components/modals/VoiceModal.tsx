'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Box
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { characterService, Character } from '@/lib/api';

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VoiceModal({ open, onClose }: VoiceModalProps) {
  const [name, setName] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [gender, setGender] = useState<Character['gender']>('male');
  const [ageCategory, setAgeCategory] = useState<Character['age_category']>('adult');
  const [promptStyle, setPromptStyle] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !voiceId) throw new Error("Name and Voice ID are required");
      
      const newChar: Character = {
        id: `char_${Date.now()}`, // Typically backend assigns this, but if API expects ID we pass one
        name,
        voice_id: voiceId,
        gender,
        age_category: ageCategory,
        prompt_style: promptStyle,
      };
      
      return await characterService.createCharacter(newChar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create voice", error);
      alert("Failed to create voice. Please try again.");
    }
  });

  const handleClose = () => {
    setName('');
    setVoiceId('');
    setGender('male');
    setAgeCategory('adult');
    setPromptStyle('');
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Voice</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Voice Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={mutation.isPending}
            required
          />
          
          <TextField
            label="ElevenLabs Voice ID (or Custom ID)"
            fullWidth
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            disabled={mutation.isPending}
            required
          />

          <TextField
            select
            label="Gender"
            fullWidth
            value={gender}
            onChange={(e) => setGender(e.target.value as Character['gender'])}
            disabled={mutation.isPending}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>

          <TextField
            select
            label="Age Category"
            fullWidth
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value as Character['age_category'])}
            disabled={mutation.isPending}
          >
            <MenuItem value="child">Child</MenuItem>
            <MenuItem value="young">Young</MenuItem>
            <MenuItem value="adult">Adult</MenuItem>
            <MenuItem value="elderly">Elderly</MenuItem>
          </TextField>

          <TextField
            label="Default Prompt Style (Optional)"
            multiline
            rows={2}
            fullWidth
            value={promptStyle}
            onChange={(e) => setPromptStyle(e.target.value)}
            disabled={mutation.isPending}
            placeholder="e.g. Speak confidently and slowly"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          disabled={!name || !voiceId || mutation.isPending}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : "Create Voice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
