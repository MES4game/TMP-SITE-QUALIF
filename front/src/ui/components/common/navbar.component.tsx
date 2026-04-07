import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { alpha, styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import ColorModeIconDropdown from '~/ui/themes/color_mode_icon_dropdown.theme';
import { HOME_PAGE, PROFIL_PAGE, MENU_PAGES } from '~/shared/config/const.config';
import SitemarkIcon from '~/assets/images/sitemark-icon.svg?react';
import { useGeneralContext } from '~/shared/contexts/general.context';
import { useReRender } from '~/shared/utils/hook.util';
import UserAvatarComp from './user_avatar.component';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    backdropFilter: 'blur(24px)',
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.divider,
    backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
        : alpha(theme.palette.background.default, 0.4),
    boxShadow: (theme.vars || theme).shadows[1],
    padding: '8px 12px',
}));

export default function NavbarComp(): React.ReactNode {
    const { user, user_avatar } = useGeneralContext();
    const reRender = useReRender();
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    React.useEffect(() => {
        console.log("Loaded: NavbarComp");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(user.subscribe(reRender));
        unsubscribers.push(user_avatar.subscribe(reRender));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    React.useEffect(() => {
        console.log("Rendered: NavbarComp");
    });

    return (
        <AppBar
            position="sticky"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                pt: '15px',
            }}
        >
            <Container maxWidth="lg">
                <StyledToolbar variant='dense' disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
                        <IconButton onClick={() => { navigate(HOME_PAGE?.url ?? '/'); }} sx={{ p: 0, border: 'none', '&, &:hover': { backgroundColor: 'transparent' } }} disableRipple>
                            <SvgIcon fontSize='large'>
                                <SitemarkIcon />
                            </SvgIcon>
                        </IconButton>
                        <Typography
                            color="primary"
                            variant="h6"
                            noWrap
                            component={Link}
                            to={HOME_PAGE?.url ?? '/'}
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            CIA - PoPS
                        </Typography>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {MENU_PAGES.map((page) => (
                                <Button key={page.menu_index} variant="text" color="info" size="small" sx={{ minWidth: 0 }} onClick={() => { navigate(page.url); }}>
                                    <Typography sx={{ textAlign: 'center' }}>{page.title}</Typography>
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        <IconButton color='primary' onClick={() => { navigate(PROFIL_PAGE?.url ?? '/'); }} sx={{ p: 0, border: 'none', mr: 1, '&, &:hover': { backgroundColor: 'transparent' } }} disableRipple>
                            <UserAvatarComp avatar={user_avatar.current} pseudo={user.current?.pseudo} account_props={{ fontSize: 'large' }} />
                        </IconButton>
                        <ColorModeIconDropdown color='info' />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
                        <ColorModeIconDropdown size="medium" />
                        <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor="top"
                            open={open}
                            onClose={toggleDrawer(false)}
                        >
                            <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <IconButton color='primary' onClick={() => { navigate(PROFIL_PAGE?.url ?? '/'); }} sx={{ p: 0, border: 'none', mr: 1, '&, &:hover': { backgroundColor: 'transparent' } }} disableRipple>
                                        <UserAvatarComp avatar={user_avatar.current} pseudo={user.current?.pseudo} account_props={{ fontSize: 'large' }} />
                                    </IconButton>
                                    <IconButton onClick={toggleDrawer(false)}>
                                        <CloseRoundedIcon />
                                    </IconButton>
                                </Box>
                                {MENU_PAGES.map((page) => (
                                    <MenuItem key={page.menu_index} onClick={() => { navigate(page.url); }}>
                                        <Typography sx={{ textAlign: 'center' }}>{page.title}</Typography>
                                    </MenuItem>
                                ))}
                            </Box>
                        </Drawer>
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    );
}
