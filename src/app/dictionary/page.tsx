'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Button, CircularProgress, 
  Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryService } from '@/lib/api';
import DictionaryModal from '@/components/modals/DictionaryModal';

export default function DictionaryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['dictionary'],
    queryFn: () => dictionaryService.getEntries(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => dictionaryService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
    }
  });

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'name': return 'primary';
      case 'place': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Phonetic Dictionary
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Entry
        </Button>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, px: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Failed to load dictionary. Ensure backend is running.</Typography>
        ) : entries?.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="40vh">
            <Typography variant="h6" color="text.secondary">
              No phonetic rules found. Add one to correct AI pronunciation.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell><strong>Word</strong></TableCell>
                  <TableCell><strong>Phonetic Replacement</strong></TableCell>
                  <TableCell><strong>Language</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries?.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{entry.word}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{entry.phonetic_replacement}</TableCell>
                    <TableCell>{entry.language}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={entry.entry_type || 'word'} 
                          size="small" 
                          color={getTypeColor(entry.entry_type)} 
                          variant="outlined" 
                        />
                        {/* Placeholder for future audio pronunciation feature */}
                        <IconButton size="small" color="primary" title="Play Pronunciation (Coming Soon)">
                          <VolumeUpIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        onClick={() => entry.id && deleteMutation.mutate(entry.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <DictionaryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
