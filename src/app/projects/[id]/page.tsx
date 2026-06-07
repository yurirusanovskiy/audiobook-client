'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, CircularProgress, 
  List, ListItem, ListItemButton, ListItemText,
  Paper, Divider, Button, AppBar, Toolbar, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { projectService, sceneService } from '@/lib/api';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id as string),
    enabled: !!id,
  });

  const { data: scenes, isLoading: scenesLoading } = useQuery({
    queryKey: ['scenes', id],
    queryFn: () => sceneService.getScenes(id as string),
    enabled: !!id,
  });

  const { data: activeScene, isLoading: sceneLoading } = useQuery({
    queryKey: ['scene', selectedSceneId],
    queryFn: () => sceneService.getScene(selectedSceneId as string),
    enabled: !!selectedSceneId,
  });

  const generateAudioMutation = useMutation({
    mutationFn: () => sceneService.generateAudio(selectedSceneId as string),
    onSuccess: (data) => {
      alert("Audio generated! " + (data.audio_file_url || ''));
    },
    onError: (error) => {
      console.error("Audio generation failed", error);
      alert("Failed to generate audio.");
    }
  });

  if (projectLoading || scenesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.push('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {project?.title || 'Project Details'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Scene List */}
        <Paper 
          variant="outlined" 
          sx={{ 
            width: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 0,
            borderTop: 0,
            borderBottom: 0,
            borderLeft: 0,
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Scenes</Typography>
          </Box>
          <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
            {scenes?.map((scene) => (
              <React.Fragment key={scene.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    selected={selectedSceneId === scene.id}
                    onClick={() => setSelectedSceneId(scene.id as string)}
                  >
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: selectedSceneId === scene.id ? 'bold' : 'normal' }}>{scene.title}</Typography>} 
                      secondary={scene.status} 
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {scenes?.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No scenes generated yet.</Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Right Area: Scene Editor */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
          {!selectedSceneId ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">Select a scene to edit or view</Typography>
            </Box>
          ) : sceneLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : activeScene ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{activeScene.title}</Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<PlayCircleOutlineIcon />}
                  onClick={() => generateAudioMutation.mutate()}
                  disabled={generateAudioMutation.isPending}
                >
                  Generate Audio
                </Button>
              </Box>

              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {activeScene.raw_text}
                </Typography>
              </Paper>
              
              {activeScene.audio_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Scene Audio:</Typography>
                  <audio controls src={activeScene.audio_url} style={{ width: '100%' }} />
                </Box>
              )}
            </Box>
          ) : (
            <Typography color="error">Failed to load scene.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
