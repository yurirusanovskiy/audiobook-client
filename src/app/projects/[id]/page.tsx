'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Card, CardContent, Button, Grid, IconButton,
  Container, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, sceneService } from '@/lib/api';
import CastingModal from '@/components/modals/CastingModal';
import DeleteProjectModal from '@/components/modals/DeleteProjectModal';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [castingOpen, setCastingOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/');
    }
  });

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

  if (projectLoading || scenesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#82B1FF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => router.push('/')} 
          sx={{ mr: 2, color: '#94A3B8', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
            {project?.title || 'Project Details'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            {project?.language_code === 'ru-RU' ? 'Русский' : project?.language_code} • {scenes?.length || 0} Scenes
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<GroupsIcon />}
          onClick={() => setCastingOpen(true)}
          sx={{ 
            bgcolor: '#82B1FF', 
            color: '#0B1121',
            px: 3,
            py: 1.5,
            mr: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#AECBFF'
            }
          }}
        >
          Characters / Casting
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => setDeleteOpen(true)}
          sx={{ 
            px: 2,
            py: 1.5,
            borderRadius: 2,
            minWidth: 'auto'
          }}
        >
          <DeleteOutlinedIcon />
        </Button>
      </Box>

      <Container maxWidth="xl" sx={{ px: '0 !important' }}>
        <Grid container spacing={3}>
          {scenes?.map((scene) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={scene.id}>
              <Card sx={{ 
                bgcolor: '#212836', 
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 200
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                    {scene.title}
                  </Typography>
                  <Chip 
                    label={scene.status === 'draft' ? 'Draft' : scene.status === 'extracted' ? 'Script Extracted' : 'Completed'} 
                    size="small" 
                    sx={{ 
                      bgcolor: scene.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)', 
                      color: scene.status === 'completed' ? '#4CAF50' : '#94A3B8',
                      borderRadius: 1,
                      fontWeight: 500,
                      mb: 2
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: '#94A3B8', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {scene.raw_text?.substring(0, 150)}...
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<EditNoteIcon />}
                    onClick={() => router.push(`/projects/${id}/scenes/${scene.id}`)}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      py: 1,
                      '&:hover': {
                        borderColor: '#82B1FF',
                        bgcolor: 'rgba(130, 177, 255, 0.05)'
                      }
                    }}
                  >
                    Open Editor
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          {scenes?.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h6" color="#94A3B8">No scenes generated yet.</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Casting Modal Component */}
      {project && <CastingModal open={castingOpen} onClose={() => setCastingOpen(false)} projectId={project.id!} scenes={scenes || []} />}
      
      {/* Delete Project Modal */}
      {project && (
        <DeleteProjectModal 
          open={deleteOpen} 
          onClose={() => setDeleteOpen(false)} 
          onConfirm={() => deleteMutation.mutate()} 
          projectTitle={project.title} 
          isDeleting={deleteMutation.isPending} 
        />
      )}
    </Box>
  );
}
