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
import PersonIcon from '@mui/icons-material/Person';
import { useQuery } from '@tanstack/react-query';
import { characterService } from '@/lib/api';
import VoiceModal from '@/components/modals/VoiceModal';

export default function VoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    setPlayingId(charId);
    setTimeout(() => setPlayingId(null), 2000); // Simulate end of audio after 2s
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 } }}>
      {/* Header Area */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 1 }}>
            Voice Profiles
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            Manage and audition AI voices for your cast
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ 
            bgcolor: '#82B1FF', 
            color: '#0B1121',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#AECBFF'
            }
          }}
        >
          New Character
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search characters by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#212836',
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
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8' }} />
              </InputAdornment>
            ),
          }
        }}
      />

      <Container maxWidth="xl" sx={{ flexGrow: 1, px: '0 !important' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <CircularProgress sx={{ color: '#82B1FF' }} />
          </Box>
        ) : error ? (
          <Typography color="error">Failed to load voices. Ensure backend is running.</Typography>
        ) : filteredCharacters.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <Typography variant="h6" sx={{ color: '#94A3B8' }}>
              No characters found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCharacters.map((char) => {
              const hasAudioSample = true;
              const isPlaying = playingId === char.id;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={char.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      bgcolor: '#212836',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#82B1FF' }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            bgcolor: 'rgba(130, 177, 255, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <PersonIcon sx={{ color: '#82B1FF' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, lineHeight: 1.2 }}>
                              {char.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }}>
                              {char.voice_id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          sx={{ 
                            color: isPlaying ? '#82B1FF' : '#94A3B8',
                            bgcolor: isPlaying ? 'rgba(130, 177, 255, 0.1)' : 'transparent',
                          }}
                          disabled={!hasAudioSample}
                          onClick={() => handlePlaySample(char.id)}
                          title="Play Sample"
                        >
                          {hasAudioSample ? <VolumeUpIcon /> : <VolumeOffIcon />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', mt: 1 }}>
                        {char.gender && (
                          <Chip 
                            label={char.gender} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.05)', 
                              color: '#E2E8F0',
                              borderRadius: 1,
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }} 
                          />
                        )}
                        {char.age_category && (
                          <Chip 
                            label={char.age_category} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.05)', 
                              color: '#E2E8F0',
                              borderRadius: 1,
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }} 
                          />
                        )}
                      </Box>
                      
                      {char.prompt_style && (
                        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            &quot;{char.prompt_style}&quot;
                          </Typography>
                        </Box>
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
