'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Paper, Button, AppBar, Toolbar, IconButton,
  List, ListItem, Divider, Avatar, Container,
  TextField, Select, MenuItem, FormControl, Tooltip,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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

  const charValue = line.character_id || '';

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
      onChange(idx, 'phonetic_text', data.processed_lines[0]?.processed_text || line.text);
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
      onChange(idx, 'audio_takes', data.audio_takes);
    },
    onError: (error) => {
      console.error("Line audio generation failed", error);
      alert("Failed to generate audio for this line.");
    }
  });

  const handleToggleManualPhonetics = () => {
    if (line.is_manual_phonetics) {
      onChange(idx, 'is_manual_phonetics', false);
      setTimeout(() => onSave(), 100);
    } else {
      processPhoneticsMutation.mutate();
    }
  };

  return (
    <Box sx={{ 
      bgcolor: '#151A25', 
      border: '1px solid rgba(255,255,255,0.05)', 
      borderRadius: 3, 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2.5 
    }}>
      {/* Top Row: Character Select & Phonetics Toggle */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ flexGrow: 1 }}>
          <Select
            value={charValue}
            onChange={(e) => {
              onChange(idx, 'character_id', e.target.value === 'narrator' ? null : e.target.value);
              setTimeout(() => onSave(), 100);
            }}
            IconComponent={KeyboardArrowDownIcon}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.03)',
              color: '#FFF',
              fontWeight: 500,
              fontSize: '0.875rem',
              borderRadius: 2,
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
            }}
            MenuProps={{
              slotProps: { paper: { sx: { bgcolor: '#1E293B', color: '#FFF' } } }
            }}
          >
            <MenuItem value="narrator" sx={{ fontWeight: 500 }}>Narrator</MenuItem>
            {characters.map(c => (
              <MenuItem key={c.id} value={c.id} sx={{ fontWeight: 500 }}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          onClick={handleToggleManualPhonetics}
          disabled={processPhoneticsMutation.isPending}
          sx={{ 
            bgcolor: line.is_manual_phonetics ? 'rgba(244,143,177,0.15)' : 'rgba(255,255,255,0.03)',
            color: line.is_manual_phonetics ? '#f48fb1' : '#94A3B8',
            border: `1px solid ${line.is_manual_phonetics ? 'rgba(244,143,177,0.3)' : 'rgba(255,255,255,0.05)'}`,
            fontWeight: 500,
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 1,
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: line.is_manual_phonetics ? 'rgba(244,143,177,0.25)' : 'rgba(255,255,255,0.08)',
            }
          }}
        >
          {processPhoneticsMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Preprocess Phonetics'}
        </Button>
      </Box>

      {/* Text Area (Original or Phonetic based on state) */}
      <Box>
        <Typography sx={{ 
          color: '#94A3B8', 
          fontSize: '0.6875rem', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.07em',
          mb: 1
        }}>
          Original Text
        </Typography>
        <TextField
          multiline
          fullWidth
          value={line.text}
          onChange={(e) => onChange(idx, 'text', e.target.value)}
          onBlur={onSave}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              bgcolor: '#0B1121',
              borderRadius: 2,
              lineHeight: 1.6,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            }
          }}
        />
      </Box>

      {/* Phonetic Text Area (Only visible when active) */}
      {line.is_manual_phonetics && (
        <Box>
          <Typography sx={{ 
            color: '#f48fb1', 
            fontSize: '0.6875rem', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.07em',
            mb: 1
          }}>
            Phonetic Text (ruaccent)
          </Typography>
          <TextField
            multiline
            fullWidth
            value={line.phonetic_text || ''}
            onChange={(e) => onChange(idx, 'phonetic_text', e.target.value)}
            onBlur={onSave}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#f48fb1',
                bgcolor: '#0B1121',
                borderRadius: 2,
                lineHeight: 1.6,
                fontFamily: 'monospace',
                '& fieldset': { borderColor: 'rgba(244,143,177,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(244,143,177,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#f48fb1' },
              }
            }}
          />
        </Box>
      )}

      {/* Prompt Override */}
      <Box>
        <Typography sx={{ 
          color: '#94A3B8', 
          fontSize: '0.6875rem', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.07em',
          mb: 1
        }}>
          Prompt Override
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. Whisper, Dramatic, Slow paced…"
          value={line.prompt_override || ''}
          onChange={(e) => onChange(idx, 'prompt_override', e.target.value)}
          onBlur={onSave}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#E2E8F0',
              bgcolor: '#0B1121',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            }
          }}
        />
      </Box>

      {/* Line Audio Generation/Playback */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  {isPlaying ? 'Pause' : 'Play Preview'}
                </Button>
                
                {/* Audio Takes Dropdown */}
                {line.audio_takes && line.audio_takes.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={line.audio_url}
                      onChange={(e) => onChange(idx, 'audio_url', e.target.value)}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.03)',
                        color: '#FFF',
                        fontSize: '0.75rem',
                        height: '32px',
                        borderRadius: 2,
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' }
                      }}
                      MenuProps={{
                        slotProps: { paper: { sx: { bgcolor: '#1E293B', color: '#FFF' } } }
                      }}
                    >
                      {line.audio_takes.map(take => (
                        <MenuItem key={take.id} value={take.audio_url} sx={{ fontSize: '0.75rem' }}>
                          Take {take.take_number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => generateLineAudioMutation.mutate()} 
                  disabled={generateLineAudioMutation.isPending} 
                  startIcon={generateLineAudioMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <ReplayIcon />}
                  sx={{ 
                    color: '#94A3B8', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' } 
                  }}
                >
                  Regenerate
                </Button>
              </>
            ) : (
              <Button 
                variant="outlined" 
                startIcon={generateLineAudioMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                onClick={() => generateLineAudioMutation.mutate()}
                disabled={generateLineAudioMutation.isPending}
                size="small"
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#94A3B8',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }
                }}
              >
                {generateLineAudioMutation.isPending ? 'Generating...' : 'Generate audio preview'}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
// --- End Line Editor ---


export default function SceneEditorPage() {
  const { id, sceneId } = useParams<{ id: string; sceneId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editedLines, setEditedLines] = useState<SceneLine[]>([]);
  const editedLinesRef = useRef(editedLines);

  useEffect(() => {
    editedLinesRef.current = editedLines;
  }, [editedLines]);

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
    setEditedLines(prev => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], [field]: value };
      return newLines;
    });
  };

  const handleBlurSave = () => {
    saveSceneMutation.mutate(editedLinesRef.current);
  };

  if (sceneLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0B1121' }}>
        <CircularProgress sx={{ color: '#82B1FF' }} />
      </Box>
    );
  }

  if (!scene) {
    return (
      <Box sx={{ p: 4, bgcolor: '#0B1121', height: '100vh' }}>
        <Typography color="error">Scene not found</Typography>
      </Box>
    );
  }

  const isExtracted = scene.status === 'extracted' || scene.status === 'completed' || (scene.lines && scene.lines.length > 0);
  const characters = projectCharacters || [];
  const wordCount = scene.raw_text ? scene.raw_text.split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 130));

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0B1121' }}>
      {/* Topbar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: '#151A25' }}>
        <Toolbar sx={{ gap: 2, minHeight: '64px !important', px: 3 }}>
          <IconButton edge="start" onClick={() => router.push(`/projects/${id}`)} sx={{ color: '#94A3B8', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
              {project?.title || 'Loading project...'}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.2 }}>
              {scene.title}
            </Typography>
          </Box>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.8125rem' }}>
            {wordCount.toLocaleString()} words · Est. {estimatedMinutes} min
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Workspace */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Left Pane: Raw Text */}
        <Box sx={{ width: '42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
              Raw Text
            </Typography>
            <Button 
              startIcon={extractMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon fontSize="small" />}
              onClick={() => extractMutation.mutate()}
              disabled={extractMutation.isPending}
              sx={{ 
                background: 'linear-gradient(135deg, #90caf9 0%, #a5b4fc 100%)',
                color: '#0f172a',
                boxShadow: '0 0 16px rgba(144,202,249,0.3)',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                '&:hover': { opacity: 0.9 }
              }}
            >
              {extractMutation.isPending ? 'Extracting...' : 'Extract Script & Roles'}
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#0d1929', overflowY: 'auto' }}>
            <Typography sx={{ 
              color: '#FFF', 
              fontFamily: 'monospace', 
              fontSize: '0.8125rem', 
              lineHeight: 1.75, 
              whiteSpace: 'pre-wrap' 
            }}>
              {scene.raw_text}
            </Typography>
          </Box>
        </Box>

        {/* Right Pane: Dialogue Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
              Scene & Dialogue Editor
            </Typography>
            <Chip 
              label={`${editedLines.length} blocks`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(144,202,249,0.12)', 
                color: '#90caf9', 
                fontWeight: 600, 
                fontSize: '0.6875rem',
                borderRadius: 1
              }} 
            />
          </Box>
          
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, pb: 15 }}>
            {!isExtracted ? (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                  Click "Extract Script & Roles" to generate dialogue blocks
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {editedLines.map((line, idx) => (
                  <LineEditor 
                    key={line.id || idx}
                    line={line}
                    idx={idx}
                    projectId={id as string}
                    sceneId={sceneId as string}
                    characters={characters}
                    onChange={handleLineChange}
                    onSave={handleBlurSave}
                  />
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Box>

      {/* Global Audio Player Bar */}
      <Box sx={{ 
        p: 2, 
        px: 3,
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        bgcolor: '#151A25',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        position: 'fixed',
        bottom: 0,
        left: 88, // Account for sidebar width
        right: 0,
        zIndex: 10
      }}>
        <audio 
          controls 
          src={scene.audio_url ? `http://127.0.0.1:8000${scene.audio_url}` : undefined} 
          style={{ flexGrow: 1, height: 40, opacity: scene.audio_url ? 1 : 0.4 }}
        />
        
        <Button 
          variant={scene.audio_url ? "outlined" : "contained"}
          color={scene.audio_url ? "primary" : "secondary"}
          startIcon={generateAudioMutation.isPending ? <CircularProgress size={16} color="inherit" /> : (scene.audio_url ? <ReplayIcon /> : <PlayCircleOutlineIcon />)}
          onClick={() => generateAudioMutation.mutate()}
          disabled={generateAudioMutation.isPending || !isExtracted}
          sx={{ 
            bgcolor: scene.audio_url ? 'transparent' : '#82B1FF',
            color: scene.audio_url ? '#82B1FF' : '#0f172a',
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
  );
}
