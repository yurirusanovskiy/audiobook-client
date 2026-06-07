'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, CircularProgress, 
  Container, TextField, InputAdornment, IconButton, Chip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useQuery } from '@tanstack/react-query';
import { characterService } from '@/lib/api';
import VoiceModal from '@/components/modals/VoiceModal';

export default function VoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track which audio is currently playing to toggle pause/play if needed later
  // We'd typically use a ref to an HTMLAudioElement.
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { data: characters, isLoading, error } = useQuery({
    queryKey: ['characters'],
    queryFn: characterService.getCharacters,
  });

  const filteredCharacters = characters?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.voice_id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePlaySample = (charId: string) => {
    // In the future, this will fetch or play the audio URL from the Character object
    // Currently acting as a placeholder simulation
    console.log(`Playing audio sample for character: ${charId}`);
    setPlayingId(charId);
    setTimeout(() => setPlayingId(null), 2000); // Simulate end of audio after 2s
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Voices Library
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          New Voice
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search voices by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }
          }}
          sx={{ maxWidth: 600, bgcolor: 'background.paper' }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, px: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Failed to load voices. Ensure backend is running.</Typography>
        ) : filteredCharacters.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <Typography variant="h6" color="text.secondary">
              No voices found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCharacters.map((char) => {
              // Assume a character has an audio sample if logic dictates. 
              // For now, let's pretend every character has a potential sample, but we make it active.
              const hasAudioSample = true; // Later: !!char.audio_sample_url
              const isPlaying = playingId === char.id;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={char.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      '&:hover': { borderColor: 'primary.main', boxShadow: 2 }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {char.name}
                        </Typography>
                        <IconButton 
                          color={isPlaying ? "secondary" : "primary"}
                          disabled={!hasAudioSample}
                          onClick={() => handlePlaySample(char.id)}
                          title="Play Sample"
                        >
                          {hasAudioSample ? <VolumeUpIcon /> : <VolumeOffIcon />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {char.gender && (
                          <Chip label={char.gender} size="small" variant="outlined" />
                        )}
                        {char.age_category && (
                          <Chip label={char.age_category} size="small" variant="outlined" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        <strong>ID:</strong> {char.voice_id}
                      </Typography>
                      
                      {char.prompt_style && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          &quot;{char.prompt_style}&quot;
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <VoiceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
