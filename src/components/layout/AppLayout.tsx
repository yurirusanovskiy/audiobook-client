'use client';

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Divider } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TranslateIcon from '@mui/icons-material/Translate';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { text: 'Projects', icon: <LibraryBooksIcon />, path: '/' },
    { text: 'Voices', icon: <RecordVoiceOverIcon />, path: '/voices' },
    { text: 'Dictionary', icon: <TranslateIcon />, path: '/dictionary' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, boxShadow: 0, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Audiobook TTS Engine
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" sx={{ px: 2, fontWeight: 'bold' }}>
            Studio
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                href={item.path}
                selected={pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, pt: 10, minHeight: '100vh' }}
      >
        {children}
      </Box>
    </Box>
  );
}
