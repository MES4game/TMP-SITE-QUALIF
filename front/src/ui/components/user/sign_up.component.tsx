import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useGeneralContext } from '~/shared/contexts/general.context';
import { useReRender } from '~/shared/utils/hook.util';
import { registerUser } from '~/api/user.api';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props: { changeMode: () => void }): React.ReactNode {
    const { token } = useGeneralContext();
    const reRender = useReRender();

    const [pseudoError, setPseudoError] = React.useState(false);
    const [pseudoErrorMessage, setPseudoErrorMessage] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [firstnameError, setFirstnameError] = React.useState(false);
    const [firstnameErrorMessage, setFirstnameErrorMessage] = React.useState('');
    const [lastnameError, setLastnameError] = React.useState(false);
    const [lastnameErrorMessage, setLastnameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

    const validateInputs = () => {
        const pseudo = document.getElementById('pseudo') as HTMLInputElement;
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const firstname = document.getElementById('firstname') as HTMLInputElement;
        const lastname = document.getElementById('lastname') as HTMLInputElement;

        let isValid = true;

        if (!pseudo.value || pseudo.value.length < 3 || pseudo.value.length > 45) {
            setPseudoError(true);
            setPseudoErrorMessage('Username must be at least 3 characters long.');
            isValid = false;
        } else {
            setPseudoError(false);
            setPseudoErrorMessage('');
        }

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value) || email.value.length > 250) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!firstname.value || firstname.value.length < 1 || firstname.value.length > 90) {
            setFirstnameError(true);
            setFirstnameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setFirstnameError(false);
            setFirstnameErrorMessage('');
        }

        if (!lastname.value || lastname.value.length < 1 || lastname.value.length > 90) {
            setLastnameError(true);
            setLastnameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setLastnameError(false);
            setLastnameErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        if (firstnameError || emailError || passwordError) {
            event.preventDefault();
            return;
        }

        const data = new FormData(event.currentTarget);

        registerUser(data.get('pseudo') as string, data.get('email') as string, data.get('firstname') as string, data.get('lastname') as string, data.get('password') as string)
            .then((_response) => {
                alert('Registration successful! Please, validate your email before log in.');
                props.changeMode();
            })
            .catch((error) => {
                console.error('Registration failed:', error);
                alert('Registration failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
            });

        event.preventDefault();
    };

    React.useEffect(() => {
        console.log("Loaded: SignUpComp");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(token.subscribe(reRender));

        return () => {
            unsubscribers.forEach((fn) => { fn(); });
        };
    }, []);

    return (
        <SignUpContainer direction="column" justifyContent="space-between" width="stretch">
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign up
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <FormControl>
                        <FormLabel htmlFor="firstname">Firstname</FormLabel>
                        <TextField
                            autoComplete="firstname"
                            name="firstname"
                            required
                            fullWidth
                            id="firstname"
                            placeholder="Jon"
                            error={firstnameError}
                            helperText={firstnameErrorMessage}
                            color={firstnameError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="lastname">Lastname</FormLabel>
                        <TextField
                            autoComplete="lastname"
                            name="lastname"
                            required
                            fullWidth
                            id="lastname"
                            placeholder="Smith"
                            error={lastnameError}
                            helperText={lastnameErrorMessage}
                            color={lastnameError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="pseudo">Pseudo</FormLabel>
                        <TextField
                            autoComplete="pseudo"
                            name="pseudo"
                            required
                            fullWidth
                            id="pseudo"
                            placeholder="Smith"
                            error={pseudoError}
                            helperText={pseudoErrorMessage}
                            color={pseudoError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            placeholder="your@email.com"
                            name="email"
                            autoComplete="email"
                            variant="outlined"
                            error={emailError}
                            helperText={emailErrorMessage}
                            color={passwordError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            required
                            fullWidth
                            name="password"
                            placeholder="••••••"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            variant="outlined"
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            color={passwordError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        onClick={validateInputs}
                    >
                        Sign up
                    </Button>
                </Box>
                <Divider>
                    <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                </Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Link
                            component="button"
                            type="button"
                            onClick={props.changeMode}
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </Box>
            </Card>
        </SignUpContainer>
    );
}