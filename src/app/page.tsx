'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, CircularProgress, 
  Container, Chip, LinearProgress
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/lib/api';
import UploadBookModal from '@/components/modals/UploadBookModal';
import ManualProjectModal from '@/components/modals/ManualProjectModal';

export default function ProjectsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 } }}>
      {/* Header Area */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 1 }}>
            Audiobook Projects
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            {projects ? projects.length : 0} active productions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setManualOpen(true)}
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
          Create / Upload New Book
        </Button>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, px: '0 !important' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress sx={{ color: '#82B1FF' }} />
          </Box>
        ) : error ? (
          <Typography color="error">Failed to load projects. Ensure backend is running.</Typography>
        ) : (
          <Grid container spacing={3}>
            {/* New Project Card (Dashed) */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card 
                onClick={() => setUploadOpen(true)}
                sx={{ 
                  height: '100%', 
                  minHeight: 280,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  border: '2px dashed rgba(130, 177, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    borderColor: '#82B1FF',
                    bgcolor: 'rgba(130, 177, 255, 0.05)'
                  }
                }}
              >
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(130, 177, 255, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <AddIcon sx={{ color: '#82B1FF', fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#82B1FF', fontWeight: 500 }}>
                  New Project
                </Typography>
              </Card>
            </Grid>

            {/* Project Cards */}
            {projects?.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    minHeight: 280,
                    display: 'flex', 
                    flexDirection: 'column',
                    bgcolor: '#212836',
                    position: 'relative'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    {/* Top Row: Icon and Menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(130, 177, 255, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <LibraryBooksIcon sx={{ color: '#82B1FF' }} />
                      </Box>
                      <MoreVertIcon sx={{ color: '#94A3B8', cursor: 'pointer' }} />
                    </Box>

                    {/* Title and Author */}
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                      {project.description || 'Unknown Author'}
                    </Typography>

                    <Box sx={{ mb: 'auto' }}>
                      <Chip 
                        label={project.language_code === 'ru-RU' ? 'Русский' : project.language_code || 'ru-RU'} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.05)', 
                          color: '#E2E8F0',
                          borderRadius: 1,
                          fontWeight: 500,
                        }} 
                      />
                    </Box>

                    {/* Stats (Mocked for now since backend doesn't return scenes count directly on projects list) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        24 scenes
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        ~12h 40m
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={65} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#82B1FF'
                            }
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#82B1FF', fontWeight: 600 }}>
                        65%
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Open Project Button at bottom */}
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
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
                        Open Project
                      </Button>
                    </Link>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <UploadBookModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ManualProjectModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </Box>
  );
}
