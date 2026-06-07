'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Box
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryService, DictionaryEntry } from '@/lib/api';

interface DictionaryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DictionaryModal({ open, onClose }: DictionaryModalProps) {
  const [word, setWord] = useState('');
  const [phoneticReplacement, setPhoneticReplacement] = useState('');
  const [language, setLanguage] = useState('ru-RU');
  const [entryType, setEntryType] = useState<DictionaryEntry['entry_type']>('word');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!word || !phoneticReplacement) throw new Error("Word and phonetic replacement are required");
      
      const newEntry: DictionaryEntry = {
        word,
        phonetic_replacement: phoneticReplacement,
        language,
        entry_type: entryType,
      };
      
      return await dictionaryService.createEntry(newEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to add dictionary entry", error);
      alert("Failed to add entry. Please try again.");
    }
  });

  const handleClose = () => {
    setWord('');
    setPhoneticReplacement('');
    setLanguage('ru-RU');
    setEntryType('word');
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Dictionary Entry</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Word"
            fullWidth
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={mutation.isPending}
            required
          />
          
          <TextField
            label="Phonetic Replacement (e.g. з+амок)"
            fullWidth
            value={phoneticReplacement}
            onChange={(e) => setPhoneticReplacement(e.target.value)}
            disabled={mutation.isPending}
            required
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
            select
            label="Entry Type"
            fullWidth
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as DictionaryEntry['entry_type'])}
            disabled={mutation.isPending}
          >
            <MenuItem value="word">Word</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="place">Place</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          disabled={!word || !phoneticReplacement || mutation.isPending}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : "Add Entry"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
