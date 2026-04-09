import React, { type ReactNode, useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    TextField,
    Stack,
    Grid,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Badge,
    IconButton,
    Tooltip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useGeneralContext } from "~/shared/contexts/general.context";
import { updateUser, uploadAvatar, deleteAvatar, deleteAccount } from "~/api/user.api";
import UserAvatarComp from "../common/user_avatar.component";
import { useReRender } from "~/shared/utils/hook.util";

export default function ProfilComp(): ReactNode {
    const { user, token, user_avatar } = useGeneralContext();
    const reRender = useReRender();
    const currentUser = user.current;

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form & Upload States
    const [formData, setFormData] = useState({
        firstname: currentUser?.firstname || "",
        lastname: currentUser?.lastname || "",
        pseudo: currentUser?.pseudo || "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    useEffect(() => {

        console.log("Loaded: ProfilComp");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(token.subscribe(reRender));
        unsubscribers.push(user.subscribe(reRender));
        unsubscribers.push(user_avatar.subscribe(reRender));

        return () => {
            unsubscribers.forEach((fn) => { fn(); });
        };
    }, []);

    if (!currentUser) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);

            // Create a temporary local URL for immediate visual feedback
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteAvatar = async () => {
        // If there is only a local preview, just discard the local changes
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(undefined);
            setAvatarFile(null);
            return;
        }

        // If there is an existing avatar on the server, call the API
        if (user_avatar.current && token.current) {
            setIsLoading(true);
            try {
                await deleteAvatar(token.current);
                user_avatar.current = undefined; // Instantly update navbar/context
            } catch (error) {
                console.error("Failed to delete avatar", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!token.current) return;
        setIsLoading(true);
        try {
            // 1. Upload Avatar if a new one was selected
            if (avatarFile) {
                await uploadAvatar(token.current, avatarFile);
                // Update global context so the navbar avatar updates instantly
                user_avatar.current = avatarPreview;
            }

            // 2. Update text fields
            await updateUser(token.current, formData);
            user.current = { ...currentUser, ...formData };

            // 3. Reset edit state
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(undefined); // Context is now holding the URL
        } catch (error) {
            console.error("Failed to update user", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Revert form data
        setFormData({
            firstname: currentUser.firstname,
            lastname: currentUser.lastname,
            pseudo: currentUser.pseudo,
        });

        // Revert avatar preview
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(undefined);
        setAvatarFile(null);

        setIsEditing(false);
    };

    const handleLogout = () => {
        token.current = undefined;
    };

    const handleDeleteAccount = async () => {
        if (!token.current) return;
        setIsLoading(true);
        try {
            await deleteAccount(token.current);
            setDeleteDialogOpen(false);
            token.current = undefined;
        } catch (error) {
            console.error("Failed to delete account", error);
            setIsLoading(false);
        }
    };

    // The image displayed is either the local unsaved preview, or the official one from context
    const displayAvatar = avatarPreview || user_avatar.current;

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh' }}>
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 600, borderRadius: 2, boxShadow: 3 }}>

                {/* HEADER SECTION */}
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.default' }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            isEditing ? (
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 0.5, boxShadow: 2 }}
                                >
                                    <Tooltip title="Upload new image">
                                        <IconButton
                                            component="label"
                                            color="primary"
                                            sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <PhotoCameraIcon fontSize="small" />
                                            <input hidden accept="image/*" type="file" onChange={handleAvatarChange} disabled={isLoading} />
                                        </IconButton>
                                    </Tooltip>

                                    {displayAvatar && (
                                        <Tooltip title="Remove avatar">
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={handleDeleteAvatar}
                                                sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                                disabled={isLoading}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            ) : null
                        }
                    >
                        <UserAvatarComp
                            avatar={displayAvatar}
                            pseudo={currentUser.pseudo}
                            avatar_props={{ sx: { width: 100, height: 100, mb: 1, fontSize: '2.5rem', border: isEditing ? '2px dashed' : 'none', borderColor: 'primary.main' } }}
                        />
                    </Badge>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                        {currentUser.pseudo || "Anonymous User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {currentUser.email}
                    </Typography>
                </Box>

                <Divider />

                {/* DETAILS / EDIT SECTION */}
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Profile Details</Typography>
                            {!isEditing && (
                                <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} size="small">
                                    Edit
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || isLoading}
                                    variant={isEditing ? "outlined" : "filled"}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || isLoading}
                                    variant={isEditing ? "outlined" : "filled"}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Pseudo"
                                    name="pseudo"
                                    value={formData.pseudo}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || isLoading}
                                    variant={isEditing ? "outlined" : "filled"}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={currentUser.email}
                                    disabled // 🔒 Permanently read-only
                                    variant="filled" // Kept filled to visually indicate it cannot be modified
                                    helperText="Email address cannot be changed."
                                />
                            </Grid>
                        </Grid>

                        {/* Read-only stats */}
                        {!isEditing && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Account created: {new Date(currentUser.created_on).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Last connection: {new Date(currentUser.last_connection).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color={currentUser.verified_email ? "success.main" : "warning.main"} display="block" fontWeight="bold">
                                    {currentUser.verified_email ? "✓ Email Verified" : "⚠ Email Not Verified"}
                                </Typography>
                            </Box>
                        )}

                        {/* Save / Cancel Controls */}
                        {isEditing && (
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </CardContent>

                <Divider />

                {/* DANGER ZONE / ACTIONS */}
                <CardActions sx={{ p: 3, justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isLoading || isEditing}
                    >
                        Delete Account
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        disabled={isLoading || isEditing}
                    >
                        Log Out
                    </Button>
                </CardActions>
            </Card >

            {/* DELETE CONFIRMATION DIALOG */}
            < Dialog open={deleteDialogOpen} onClose={() => !isLoading && setDeleteDialogOpen(false)
            }>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained" autoFocus disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Yes, Delete Everything"}
                    </Button>
                </DialogActions>
            </Dialog >
        </Box >
    );
}