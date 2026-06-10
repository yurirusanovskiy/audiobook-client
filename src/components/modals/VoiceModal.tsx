'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Box, IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const [pitchOverride, setPitchOverride] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !voiceId) throw new Error("Name and Voice ID are required");
      
      const newChar: Character = {
        id: `char_${Date.now()}`,
        name,
        voice_id: voiceId,
        gender,
        age_category: ageCategory,
        prompt_style: promptStyle,
        pitch_override: pitchOverride,
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
    setPitchOverride('');
    mutation.reset();
    onClose();
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.03)',
      borderRadius: 2,
      color: '#FFFFFF',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#82B1FF',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#94A3B8',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#82B1FF',
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#151A25',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.05)'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        pt: 3,
        px: 3
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
          Create New Voice
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label="Character Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={mutation.isPending}
            required
            sx={textFieldStyles}
          />
          
          <TextField
            label="ElevenLabs Voice ID (or Custom ID)"
            fullWidth
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            disabled={mutation.isPending}
            required
            sx={textFieldStyles}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Gender"
              fullWidth
              value={gender}
              onChange={(e) => setGender(e.target.value as Character['gender'])}
              disabled={mutation.isPending}
              sx={textFieldStyles}
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
              sx={textFieldStyles}
            >
              <MenuItem value="child">Child</MenuItem>
              <MenuItem value="young">Young</MenuItem>
              <MenuItem value="adult">Adult</MenuItem>
              <MenuItem value="elderly">Elderly</MenuItem>
            </TextField>
          </Box>

          <TextField
            select
            label="Pitch Override (Optional)"
            fullWidth
            value={pitchOverride}
            onChange={(e) => setPitchOverride(e.target.value)}
            disabled={mutation.isPending}
            sx={textFieldStyles}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="Very High">Very High</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Deep">Deep</MenuItem>
            <MenuItem value="Squeaky">Squeaky</MenuItem>
            <MenuItem value="Raspy">Raspy</MenuItem>
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
            sx={textFieldStyles}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={mutation.isPending}
          sx={{ color: '#94A3B8', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          disabled={!name || !voiceId || mutation.isPending}
          sx={{ 
            bgcolor: '#82B1FF', 
            color: '#0B1121',
            px: 3,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#AECBFF'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(130, 177, 255, 0.3)',
              color: 'rgba(11, 17, 33, 0.5)'
            }
          }}
        >
          {mutation.isPending ? <CircularProgress size={24} sx={{ color: '#0B1121' }} /> : "Create Character"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
