'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid2, CircularProgress, 
  Container 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Your Projects
        </Typography>
        {projects && projects.length > 0 && (
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadOpen(true)}
          >
            Upload Book
          </Button>
        )}
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, px: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Failed to load projects. Ensure backend is running.</Typography>
        ) : projects?.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="60vh"
            gap={4}
          >
            <Typography variant="h4" color="text.secondary" fontWeight="500">
              No Projects Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="sm">
              Start by uploading an entire book (.txt). We&apos;ll automatically break it down into scenes and cast the characters using AI.
            </Typography>
            <Box display="flex" gap={2}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadOpen(true)}
              >
                Upload New Book
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<AddIcon />}
                onClick={() => setManualOpen(true)}
              >
                New Project
              </Button>
            </Box>
          </Box>
        ) : (
          <Grid2 container spacing={3}>
            {projects?.map((project) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 2 }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom fontWeight="600">
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Language: {project.language_code || 'ru-RU'}
                    </Typography>
                    {project.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {project.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Container>

      <UploadBookModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ManualProjectModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </Box>
  );
}
