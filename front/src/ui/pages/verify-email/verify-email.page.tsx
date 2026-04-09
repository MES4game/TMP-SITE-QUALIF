import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { verifyEmail } from '~/api/user.api';
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

const VerifyEmailContainer = styled(Stack)(({ theme }) => ({
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

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmail(): React.ReactNode {
    // Retrieve the token from the URL (e.g., route is /verify-email/:token)
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    // State to track the verification progress
    const [status, setStatus] = React.useState<VerificationStatus>('loading');
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
        // Prevent double execution in React StrictMode by keeping track if it's already running
        let isMounted = true;

        const attemptVerification = async () => {
            if (!token) {
                if (isMounted) {
                    setStatus('error');
                    setErrorMessage('No verification token found in the URL.');
                }
                return;
            }

            try {
                await verifyEmail(token);
                if (isMounted) {
                    setStatus('success');
                }
            } catch (error: any) {
                console.error("Email verification failed:", error);
                if (isMounted) {
                    setStatus('error');
                    setErrorMessage(error.message || "Failed to verify email. The link might be expired or invalid.");
                }
            }
        };

        attemptVerification();

        return () => {
            isMounted = false;
        };
    }, [token]);

    return (
        <VerifyEmailContainer direction="column" justifyContent="space-between" width="stretch">
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}
                >
                    Email Verification
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>

                    {/* LOADING STATE */}
                    {status === 'loading' && (
                        <>
                            <CircularProgress size={48} />
                            <Typography color="text.secondary" textAlign="center">
                                Please wait while we verify your email address...
                            </Typography>
                        </>
                    )}

                    {/* SUCCESS STATE */}
                    {status === 'success' && (
                        <>
                            <Alert severity="success" sx={{ width: '100%' }}>
                                Your email has been successfully verified! You have full access to your account.
                            </Alert>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => navigate(PROFIL_PAGE?.url ?? '/')} // Adjust route as needed
                            >
                                Continue to Sign In
                            </Button>
                        </>
                    )}

                    {/* ERROR STATE */}
                    {status === 'error' && (
                        <>
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {errorMessage}
                            </Alert>
                            <Button
                                variant="outlined"
                                color="inherit"
                                fullWidth
                                onClick={() => navigate(PROFIL_PAGE?.url ?? '/')} // Adjust route as needed
                            >
                                Back to Sign In
                            </Button>
                        </>
                    )}

                </Box>
            </Card>
        </VerifyEmailContainer>
    );
}
