import re

with open("src/components/modals/VoiceModal.tsx", "r") as f:
    content = f.read()

# Add Autocomplete, Chip to imports
content = content.replace("Divider, Switch, FormControlLabel, List, ListItem, ListItemText, ListItemSecondaryAction, Paper", "Divider, Switch, FormControlLabel, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, Autocomplete, Chip")

# Replace TextField for promptStyle
old_text_field = """          <TextField
            label="Prompt Instructions (Traits / Emotions)"
            multiline
            rows={3}
            fullWidth
            value={promptStyle}
            onChange={(e) => setPromptStyle(e.target.value)}
            placeholder="e.g. Speak with a hoarse, raspy voice. Sound like a heavy smoker. Very slow delivery."
            sx={textFieldStyles}
            helperText="Add specific traits to inject into the Gemini prompt (e.g. raspy, hoarse, happy, scared)"
            slotProps={{ formHelperText: { sx: { color: '#64748B' } } }}
          />"""

new_text_field = """          <Autocomplete
            multiple
            freeSolo
            options={["Raspy", "Hoarse", "Clear", "Breathy", "Nasal", "Muffled", "Gravelly", "Smooth", "Husky", "Smoker's voice", "Whispery", "Loud", "Soft-spoken", "Monotone", "Expressive"]}
            value={promptStyle ? promptStyle.split(',').map(s => s.trim()).filter(Boolean) : []}
            onChange={(e, newValue) => setPromptStyle(newValue.join(', '))}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip variant="outlined" label={option} key={key} {...tagProps} sx={{ color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.2)' }} />;
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Base Voice Traits"
                placeholder="Select or type custom traits..."
                sx={textFieldStyles}
                helperText="These traits form the BASE voice (e.g. Raspy). Specific emotions (e.g. shouts, whispers) are set directly in the script for each line."
                slotProps={{ formHelperText: { sx: { color: '#64748B' } } }}
              />
            )}
          />"""

content = content.replace(old_text_field, new_text_field)

with open("src/components/modals/VoiceModal.tsx", "w") as f:
    f.write(content)

