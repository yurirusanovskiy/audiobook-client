'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUpOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  projectService,
  characterService,
  Character,
  Scene,
  getAudioUrl,
} from '@/lib/api';
import CastingModal from '@/components/modals/CastingModal';
import VoiceModal from '@/components/modals/VoiceModal';
import SwapCharacterModal from '@/components/modals/SwapCharacterModal';

interface CastingDirectorSectionProps {
  projectId: string;
  scenes: Scene[];
}

export default function CastingDirectorSection({
  projectId,
  scenes,
}: CastingDirectorSectionProps) {
  const queryClient = useQueryClient();
  const [castingOpen, setCastingOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [characterToDuplicate, setCharacterToDuplicate] =
    useState<Character | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [characterToSwap, setCharacterToSwap] = useState<Character | null>(
    null,
  );

  const { data: characters, isLoading } = useQuery({
    queryKey: ['projectCharacters', projectId],
    queryFn: () => projectService.getProjectCharacters(projectId),
    enabled: !!projectId,
  });

  const generateSampleMutation = useMutation({
    mutationFn: (characterId: string) =>
      characterService.generateSample(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projectCharacters', projectId],
      });
    },
    onError: (error) => {
      console.error('Failed to generate voice sample', error);
      alert('Failed to generate sample.');
    },
  });

  const linkMutation = useMutation({
    mutationFn: (characterId: string) =>
      projectService.linkCharacter(projectId, characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projectCharacters', projectId],
      });
    },
    onError: (error) => {
      console.error('Failed to link character to project', error);
      alert('Failed to add new character to project.');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (characterId: string) =>
      api
        .delete(`/projects/${projectId}/characters/${characterId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projectCharacters', projectId],
      });
    },
    onError: (error) => {
      console.error('Failed to unlink character', error);
      alert('Failed to remove character from project.');
    },
  });

  const handleEdit = (char: Character) => {
    setCharacterToDuplicate(char);
    setDuplicateModalOpen(true);
  };

  const handleSwap = (char: Character) => {
    setCharacterToSwap(char);
    setSwapModalOpen(true);
  };

  const handlePlaySample = (audioUrl: string | undefined) => {
    if (audioUrl) {
      new Audio(getAudioUrl(audioUrl)).play();
    }
  };

  if (isLoading) {
    return <CircularProgress sx={{ color: '#82B1FF', my: 4 }} />;
  }

  const hasCharacters = characters && characters.length > 0;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AutoAwesomeIcon sx={{ color: '#82B1FF', mr: 2 }} />
        <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          Project Cast
        </Typography>
      </Box>

      {!hasCharacters ? (
        <Card
          sx={{
            bgcolor: 'rgba(130, 177, 255, 0.05)',
            border: '1px dashed rgba(130, 177, 255, 0.3)',
            borderRadius: 3,
            textAlign: 'center',
            py: 6,
          }}
        >
          <AutoAwesomeIcon
            sx={{ color: '#82B1FF', fontSize: 48, mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
            No cast assigned yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Run the AI Casting Director to automatically discover characters
            from your scenes.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setCastingOpen(true)}
            sx={{
              bgcolor: '#82B1FF',
              color: '#0B1121',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#AECBFF' },
            }}
          >
            Run AI Casting
          </Button>
        </Card>
      ) : (
        <Card
          sx={{
            bgcolor: '#212836',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <List sx={{ width: '100%', p: 0 }}>
              {characters.map((char, index) => (
                <ListItem
                  key={char.id}
                  divider={index < characters.length - 1}
                  sx={{
                    px: 3,
                    py: 2,
                    borderColor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                        }}
                      >
                        {char.name}
                      </Typography>
                      <Chip
                        label={char.gender}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: '#94A3B8',
                        }}
                      />
                      <Chip
                        label={char.age_category}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: '#94A3B8',
                        }}
                      />
                      <Chip
                        label={`Voice: ${char.voice_id}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(130, 177, 255, 0.1)',
                          color: '#82B1FF',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      {char.prompt_style}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
                    {char.sample_audio_url ? (
                      <Tooltip title="Play Sample">
                        <IconButton
                          onClick={() =>
                            handlePlaySample(char.sample_audio_url)
                          }
                          sx={{
                            color: '#82B1FF',
                            bgcolor: 'rgba(130, 177, 255, 0.1)',
                            '&:hover': { bgcolor: 'rgba(130, 177, 255, 0.2)' },
                          }}
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Generate Voice Sample">
                        <IconButton
                          onClick={() =>
                            generateSampleMutation.mutate(char.id!)
                          }
                          disabled={generateSampleMutation.isPending}
                          sx={{
                            color: '#94A3B8',
                            '&:hover': { color: '#82B1FF' },
                          }}
                        >
                          {generateSampleMutation.isPending &&
                          generateSampleMutation.variables === char.id ? (
                            <CircularProgress
                              size={24}
                              sx={{ color: '#82B1FF' }}
                            />
                          ) : (
                            <VolumeUpIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Edit Character Voice">
                      <IconButton
                        onClick={() => handleEdit(char)}
                        sx={{
                          color: '#94A3B8',
                          '&:hover': { color: '#FFFFFF' },
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Replace Character">
                      <IconButton
                        onClick={() => handleSwap(char)}
                        sx={{
                          color: '#94A3B8',
                          '&:hover': { color: '#82B1FF' },
                        }}
                      >
                        <SwapHorizOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setCastingOpen(true)}
                sx={{ color: '#82B1FF', textTransform: 'none' }}
              >
                Rerun Casting
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CastingModal
        open={castingOpen}
        onClose={() => setCastingOpen(false)}
        projectId={projectId}
        scenes={scenes}
      />

      {duplicateModalOpen && characterToDuplicate && (
        <VoiceModal
          open={duplicateModalOpen}
          onClose={() => {
            setDuplicateModalOpen(false);
            setCharacterToDuplicate(null);
          }}
          characterToEdit={characterToDuplicate}
          duplicateMode={true}
          onSuccess={(newChar) => {
            linkMutation.mutate(newChar.id!);
          }}
        />
      )}

      {swapModalOpen && characterToSwap && (
        <SwapCharacterModal
          open={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false);
            setCharacterToSwap(null);
          }}
          projectId={projectId}
          characterToReplace={characterToSwap}
        />
      )}
    </Box>
  );
}
