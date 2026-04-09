import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { resetPassword } from '~/api/user.api';
import { PROFIL_PAGE } from '~/shared/config/const.config';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const ResetPasswordContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function ResetPassword(): React.ReactNode {
    // Retrieve the token from the URL (e.g., route is /reset-password/:token)
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    // UI States
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [globalError, setGlobalError] = React.useState('');
    const [successMsg, setSuccessMsg] = React.useState('');

    // Validation States
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [confirmError, setConfirmError] = React.useState(false);
    const [confirmErrorMessage, setConfirmErrorMessage] = React.useState('');

    const validateInputs = () => {
        const password = document.getElementById('password') as HTMLInputElement;
        const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;

        let isValid = true;

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (confirmPassword.value !== password.value) {
            setConfirmError(true);
            setConfirmErrorMessage('Passwords do not match.');
            isValid = false;
        } else {
            setConfirmError(false);
            setConfirmErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setGlobalError('');
        setSuccessMsg('');

        if (!validateInputs() || !token) {
            if (!token) setGlobalError("Invalid or missing reset token.");
            return;
        }

        const data = new FormData(event.currentTarget);
        const newPassword = data.get('password') as string;

        setIsSubmitting(true);

        try {
            await resetPassword(token, newPassword);
            setSuccessMsg("Your password has been successfully reset. You can now log in.");

            // Redirect the user to the sign in page after a brief delay
            setTimeout(() => {
                navigate(PROFIL_PAGE?.url ?? '/'); // Adjust this route to match your app's routing setup
            }, 3000);

        } catch (error: any) {
            console.error("Reset password failed:", error);
            setGlobalError(error.message || "Failed to reset password. The link might be expired or invalid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ResetPasswordContainer direction="column" justifyContent="space-between" width="stretch">
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Reset Password
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Enter your new password below. Make sure it's at least 6 characters long.
                </Typography>

                {globalError && <Alert severity="error">{globalError}</Alert>}
                {successMsg && <Alert severity="success">{successMsg}</Alert>}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="password">New Password</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            name="password"
                            placeholder="••••••"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? 'error' : 'primary'}
                            disabled={isSubmitting || !!successMsg}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                        <TextField
                            error={confirmError}
                            helperText={confirmErrorMessage}
                            name="confirmPassword"
                            placeholder="••••••"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            required
                            fullWidth
                            variant="outlined"
                            color={confirmError ? 'error' : 'primary'}
                            disabled={isSubmitting || !!successMsg}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        onClick={validateInputs}
                        disabled={isSubmitting || !!successMsg || !token}
                        sx={{ mt: 1 }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                    </Button>
                </Box>
            </Card>
        </ResetPasswordContainer>
    );
}
