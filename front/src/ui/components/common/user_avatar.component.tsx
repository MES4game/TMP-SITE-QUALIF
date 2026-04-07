import { type ReactNode, useEffect, useState } from "react";
import { Avatar, type AvatarOwnProps, type SvgIconOwnProps } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function stringToColor(string: string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

interface UserAvatarCompProps {
    avatar?: string;
    pseudo?: string;
    avatar_props?: AvatarOwnProps;
    account_props?: SvgIconOwnProps;
}

export default function UserAvatarComp(props: UserAvatarCompProps): ReactNode {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        console.log("Loaded: UserAvatarComp");

        fetch(props.avatar ?? '', { method: 'HEAD' })
            .then((res) => {
                setIsActive(res.ok);
            })
            .catch(() => {
                setIsActive(false);
            });
    }, []);

    useEffect(() => {
        console.log("Rendered: UserAvatarComp");
    });

    return (
        props.pseudo !== undefined || isActive
            ? <Avatar
                {...props.avatar_props}
                sx={{ ...props.avatar_props?.sx, ...((!isActive && props.pseudo) ? { bgcolor: stringToColor(props.pseudo) } : {}) }}
                src={props.avatar}
                {...((!isActive && props.pseudo) ? { children: props.pseudo.slice(0, 2).toUpperCase() } : {})}
            />
            : <AccountCircleIcon {...props.account_props} />
    );
}
