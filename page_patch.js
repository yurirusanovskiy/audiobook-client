const fs = require('fs');

let code = fs.readFileSync('src/app/voices/page.tsx', 'utf8');

// Replace VoiceModal imports and states
code = code.replace(
  "const [modalOpen, setModalOpen] = useState(false);",
  "const [modalOpen, setModalOpen] = useState(false);\n  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);"
);

code = code.replace(
  "import AddIcon from '@mui/icons-material/Add';",
  "import AddIcon from '@mui/icons-material/Add';\nimport EditIcon from '@mui/icons-material/Edit';\nimport DeleteIcon from '@mui/icons-material/Delete';"
);

code = code.replace(
  "import { characterService } from '@/lib/api';",
  "import { characterService, Character } from '@/lib/api';\nimport { useMutation, useQueryClient } from '@tanstack/react-query';"
);

// Add Delete Mutation
const deleteMutationStr = `
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: characterService.deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (char: Character) => {
    setCharacterToEdit(char);
    setModalOpen(true);
  };
`;

code = code.replace(
  "const { data: characters, isLoading, error } = useQuery({",
  deleteMutationStr + "\n  const { data: characters, isLoading, error } = useQuery({"
);

// Add action buttons to Card
const actionsStr = `
                        <Box sx={{ display: 'flex' }}>
                          <IconButton size="small" onClick={() => handleEdit(char)} sx={{ color: '#94A3B8', '&:hover': { color: '#82B1FF' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(char.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            sx={{ 
                              color: isPlaying ? '#82B1FF' : '#94A3B8',
                              bgcolor: isPlaying ? 'rgba(130, 177, 255, 0.1)' : 'transparent',
                              ml: 1
                            }}
                            disabled={!hasAudioSample}
                            onClick={() => handlePlaySample(char.id)}
                            title="Play Sample"
                            size="small"
                          >
                            {hasAudioSample ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                          </IconButton>
                        </Box>
`;

code = code.replace(
  /<IconButton[\s\S]*?<\/IconButton>/,
  actionsStr
);

code = code.replace(
  /<VoiceModal open=\{modalOpen\} onClose=\{\(\) => setModalOpen\(false\)\} \/>/,
  `<VoiceModal open={modalOpen} onClose={() => { setModalOpen(false); setCharacterToEdit(null); }} characterToEdit={characterToEdit} />`
);

code = code.replace(
  "onClick={() => setModalOpen(true)}",
  "onClick={() => { setCharacterToEdit(null); setModalOpen(true); }}"
);

fs.writeFileSync('src/app/voices/page.tsx', code);
