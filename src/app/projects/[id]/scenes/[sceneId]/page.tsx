'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Paper, Button, AppBar, Toolbar, IconButton,
  List, ListItem, Divider, Avatar, Container,
  TextField, Select, MenuItem, FormControl, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import TranslateIcon from '@mui/icons-material/Translate';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sceneService, projectService, processingService, SceneLine } from '@/lib/api';

// --- Line Editor Sub-Component ---
const LineEditor = ({ 
  line, 
  idx, 
  projectId, 
  sceneId, 
  characters, 
  onChange, 
  onSave 
}: { 
  line: SceneLine; 
  idx: number; 
  projectId: string; 
  sceneId: string;
  characters: any[]; 
  onChange: (index: number, field: keyof SceneLine, value: any) => void;
  onSave: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  const isNarrator = !line.character_id;
  const charValue = isNarrator ? 'narrator' : line.character_id;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const processPhoneticsMutation = useMutation({
    mutationFn: () => processingService.preprocessLines(projectId, [line]),
    onSuccess: (data) => {
      // Set text to processed text and toggle manual mode ON
      onChange(idx, 'text', data.processed_lines[0]?.processed_text || line.text);
      onChange(idx, 'is_manual_phonetics', true);
      setTimeout(() => onSave(), 100);
    },
    onError: (error) => {
      console.error("Phonetics processing failed", error);
      alert("Failed to process phonetics.");
    }
  });

  const generateLineAudioMutation = useMutation({
    mutationFn: () => sceneService.generateLineAudio(sceneId, line.id as number),
    onSuccess: (data) => {
      onChange(idx, 'audio_url', data.audio_url);
    },
    onError: (error) => {
      console.error("Line audio generation failed", error);
      alert("Failed to generate audio for this line.");
    }
  });

  const handleToggleManualPhonetics = () => {
    if (line.is_manual_phonetics) {
      // Turn off manual phonetics
      onChange(idx, 'is_manual_phonetics', false);
      setTimeout(() => onSave(), 100);
    } else {
      // Turn on manual phonetics by running ruaccent right now
      processPhoneticsMutation.mutate();
    }
  };

  return (
    <ListItem sx={{ p: 0, display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
      <Avatar sx={{ 
        bgcolor: isNarrator ? 'rgba(255,255,255,0.05)' : 'rgba(130, 177, 255, 0.1)', 
        color: isNarrator ? '#94A3B8' : '#82B1FF',
        width: 40, height: 40, mt: 1
      }}>
        {isNarrator ? <SettingsVoiceIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
      </Avatar>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={charValue}
              onChange={(e) => {
                onChange(idx, 'character_id', e.target.value === 'narrator' ? null : e.target.value);
                setTimeout(() => onSave(), 100);
              }}
              sx={{ 
                color: isNarrator ? '#94A3B8' : '#82B1FF', 
                fontWeight: 600,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#82B1FF' }
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: { bgcolor: '#1E293B', color: '#FFF' }
                  }
                }
              }}
            >
              <MenuItem value="narrator" sx={{ fontWeight: 600 }}>Narrator</MenuItem>
              {characters.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            placeholder="Prompt Override (e.g. Whispering)"
            value={line.prompt_override || ''}
            onChange={(e) => onChange(idx, 'prompt_override', e.target.value)}
            onBlur={onSave}
            sx={{ 
              flexGrow: 1, maxWidth: 200,
              '& .MuiOutlinedInput-root': {
                color: '#4CAF50',
                bgcolor: 'rgba(76, 175, 80, 0.05)',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(76, 175, 80, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(76, 175, 80, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
              }
            }}
          />

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title={line.is_manual_phonetics ? "Manual Phonetics is ON. Click to disable." : "Process with ruaccent to edit phonetics manually."}>
              <Button 
                variant={line.is_manual_phonetics ? "contained" : "outlined"}
                startIcon={processPhoneticsMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <TranslateIcon />}
                onClick={handleToggleManualPhonetics}
                disabled={processPhoneticsMutation.isPending}
                size="small"
                sx={{ 
                  color: line.is_manual_phonetics ? '#fff' : '#ef5350',
                  bgcolor: line.is_manual_phonetics ? '#ef5350' : 'transparent',
                  borderColor: line.is_manual_phonetics ? 'transparent' : 'rgba(239, 83, 80, 0.5)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: line.is_manual_phonetics ? '#d32f2f' : 'rgba(239, 83, 80, 0.1)',
                    borderColor: '#ef5350',
                  }
                }}
              >
                {line.is_manual_phonetics ? 'Phonetics: Manual' : 'Phonetics: Auto'}
              </Button>
            </Tooltip>

            {line.id && (
              <>
                {line.audio_url ? (
                  <>
                    <audio 
                      ref={audioRef} 
                      src={`http://127.0.0.1:8000${line.audio_url}`} 
                      onEnded={() => setIsPlaying(false)} 
                      style={{ display: 'none' }} 
                    />
                    <Button 
                      variant="contained" 
                      startIcon={isPlaying ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
                      onClick={togglePlay}
                      size="small"
                      sx={{ 
                        bgcolor: '#4CAF50', 
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        minWidth: 100,
                        '&:hover': { bgcolor: '#45a049' }
                      }}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <IconButton size="small" onClick={() => generateLineAudioMutation.mutate()} disabled={generateLineAudioMutation.isPending} sx={{ color: '#82B1FF' }}>
                      {generateLineAudioMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <ReplayIcon />}
                    </IconButton>
                  </>
                ) : (
                  <Button 
                    variant="outlined" 
                    startIcon={generateLineAudioMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                    onClick={() => generateLineAudioMutation.mutate()}
                    disabled={generateLineAudioMutation.isPending}
                    size="small"
                    sx={{ 
                      borderColor: '#82B1FF', 
                      color: '#82B1FF',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(130, 177, 255, 0.1)' }
                    }}
                  >
                    {generateLineAudioMutation.isPending ? 'Wait...' : 'Generate preview'}
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
        
        <TextField
          multiline
          fullWidth
          value={line.text}
          onChange={(e) => onChange(idx, 'text', e.target.value)}
          onBlur={onSave}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              bgcolor: isNarrator ? 'rgba(255,255,255,0.02)' : 'rgba(130, 177, 255, 0.03)',
              borderRadius: 2,
              lineHeight: 1.6,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#82B1FF' },
            }
          }}
        />
      </Box>
    </ListItem>
  );
};
// --- End Line Editor ---


export default function SceneEditorPage() {
  const { id, sceneId } = useParams<{ id: string; sceneId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editedLines, setEditedLines] = useState<SceneLine[]>([]);
  const [isPlayingScene, setIsPlayingScene] = useState(false);
  const sceneAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id as string),
    enabled: !!id,
  });

  const { data: projectCharacters } = useQuery({
    queryKey: ['projectCharacters', id],
    queryFn: () => projectService.getProjectCharacters(id as string),
    enabled: !!id,
  });

  const { data: scene, isLoading: sceneLoading } = useQuery({
    queryKey: ['scene', sceneId],
    queryFn: () => sceneService.getScene(sceneId as string),
    enabled: !!sceneId,
  });

  useEffect(() => {
    if (scene?.lines) {
      setEditedLines(scene.lines);
    }
  }, [scene?.lines]);

  const extractMutation = useMutation({
    mutationFn: () => sceneService.extractScript(sceneId as string),
    onSuccess: (data) => {
      queryClient.setQueryData(['scene', sceneId], data);
    },
    onError: (error) => {
      console.error("Extraction failed", error);
      alert("Failed to extract script.");
    }
  });

  const saveSceneMutation = useMutation({
    mutationFn: (lines: SceneLine[]) => sceneService.updateScene(sceneId as string, { lines }),
    onSuccess: (data) => {
      queryClient.setQueryData(['scene', sceneId], data);
    },
    onError: (error) => {
      console.error("Save failed", error);
    }
  });

  const generateAudioMutation = useMutation({
    mutationFn: () => sceneService.generateAudio(sceneId as string),
    onSuccess: (data) => {
      queryClient.setQueryData(['scene', sceneId], data);
    },
    onError: (error) => {
      console.error("Audio generation failed", error);
      alert("Failed to generate scene audio.");
    }
  });

  const handleLineChange = (index: number, field: keyof SceneLine, value: any) => {
    const newLines = [...editedLines];
    newLines[index] = { ...newLines[index], [field]: value };
    setEditedLines(newLines);
  };

  const handleBlurSave = () => {
    saveSceneMutation.mutate(editedLines);
  };

  const togglePlayScene = () => {
    if (sceneAudioRef.current) {
      if (isPlayingScene) {
        sceneAudioRef.current.pause();
      } else {
        sceneAudioRef.current.play();
      }
      setIsPlayingScene(!isPlayingScene);
    }
  };

  if (sceneLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#82B1FF' }} />
      </Box>
    );
  }

  if (!scene) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Scene not found</Typography>
      </Box>
    );
  }

  const isExtracted = scene.status === 'extracted' || scene.status === 'completed' || (scene.lines && scene.lines.length > 0);
  const characters = projectCharacters || [];

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0B1121' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" onClick={() => router.push(`/projects/${id}`)} sx={{ color: '#94A3B8' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
              {scene.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {project?.title}
            </Typography>
          </Box>
          
          {/* Player removed from here */}
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ width: '100%', maxWidth: 1000, bgcolor: '#151A25', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
          
          {!isExtracted ? (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 10, overflow: 'auto' }}>
              <SettingsVoiceIcon sx={{ fontSize: 64, color: 'rgba(130, 177, 255, 0.2)', mb: 3 }} />
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                Raw Manuscript Text
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 600, mb: 4 }}>
                This scene contains raw text. Before you can assign voices or generate audio, you need to extract the script to identify the narrator and characters.
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, bgcolor: '#0B1121', borderColor: 'rgba(255,255,255,0.05)', width: '100%', textAlign: 'left', mb: 4 }}>
                <Typography variant="body2" sx={{ color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>
                  {scene.raw_text}
                </Typography>
              </Paper>

              <Button 
                variant="contained" 
                startIcon={extractMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                onClick={() => extractMutation.mutate()}
                disabled={extractMutation.isPending}
                sx={{ 
                  bgcolor: '#82B1FF', 
                  color: '#0B1121',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { bgcolor: '#AECBFF' }
                }}
              >
                {extractMutation.isPending ? 'Extracting Script (AI)...' : 'Extract Script (AI)'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(130, 177, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>Script Editor</Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{editedLines.length} dialogue blocks. Edits are auto-saved.</Typography>
                </Box>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                <List sx={{ p: 0 }}>
                  {editedLines.map((line, idx) => (
                    <React.Fragment key={line.id || idx}>
                      <LineEditor 
                        line={line}
                        idx={idx}
                        projectId={id as string}
                        sceneId={sceneId as string}
                        characters={characters}
                        onChange={handleLineChange}
                        onSave={handleBlurSave}
                      />
                      {idx < editedLines.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>

              {/* Bottom Sticky Player Bar */}
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid rgba(255,255,255,0.05)', 
                bgcolor: '#0B1121',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                position: 'sticky',
                bottom: 0,
                zIndex: 10
              }}>
                <audio 
                  controls 
                  src={scene.audio_url ? `http://127.0.0.1:8000${scene.audio_url}` : undefined} 
                  style={{ flexGrow: 1, height: 40, opacity: scene.audio_url ? 1 : 0.5 }}
                />
                
                <Button 
                  variant={scene.audio_url ? "outlined" : "contained"}
                  color={scene.audio_url ? "primary" : "secondary"}
                  startIcon={generateAudioMutation.isPending ? <CircularProgress size={16} color="inherit" /> : (scene.audio_url ? <ReplayIcon /> : <PlayCircleOutlineIcon />)}
                  onClick={() => generateAudioMutation.mutate()}
                  disabled={generateAudioMutation.isPending}
                  sx={{ 
                    bgcolor: scene.audio_url ? 'transparent' : '#82B1FF',
                    color: scene.audio_url ? '#82B1FF' : '#0B1121',
                    borderColor: scene.audio_url ? '#82B1FF' : 'transparent',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    minWidth: 160,
                    '&:hover': { bgcolor: scene.audio_url ? 'rgba(130, 177, 255, 0.1)' : '#AECBFF' }
                  }}
                >
                  {generateAudioMutation.isPending ? 'Generating...' : (scene.audio_url ? 'Regenerate Scene' : 'Generate Audio')}
                </Button>
              </Box>
            </Box>
          )}

        </Paper>
      </Box>
    </Box>
  );
}
