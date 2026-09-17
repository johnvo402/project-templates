import MenuIcon from '@mui/icons-material/Menu';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { AppNavigationItem } from '../app/app-navigation';
import type { AuthUser } from '../core/auth/auth-session';

const drawerWidth = 264;

type Props = {
  user: AuthUser;
  navigation: readonly AppNavigationItem[];
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({ user, navigation, onLogout, children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';

  const groups = useMemo(
    () => navigation.reduce<Record<string, AppNavigationItem[]>>((result, item) => {
      (result[item.group] ??= []).push(item);
      return result;
    }, {}),
    [navigation],
  );

  const open = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2.25 }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
          <StorefrontOutlinedIcon />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>TemplateApp</Typography>
          <Typography variant="caption" color="text.secondary">Mini Store Admin</Typography>
        </Box>
      </Toolbar>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {Object.entries(groups).map(([group, items]) => (
          <List
            key={group}
            dense
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ bgcolor: 'transparent', lineHeight: '34px', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}
              >
                {group}
              </ListSubheader>
            }
          >
            {items.map(item => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => open(item.path)}
                sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 650 } } }} />
              </ListItemButton>
            ))}
          </List>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.softBg', color: 'primary.main', fontSize: 13, fontWeight: 800 }}>
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 750 }}>{user.displayName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
          </Box>
          <Chip label={user.role} size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
          <Button color="inherit" onClick={onLogout}>Sign out</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="Primary navigation">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRightColor: 'divider' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${drawerWidth}px)` }, pt: 8, px: { xs: 2, sm: 3 }, pb: 5 }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
