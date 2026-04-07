import { type ReactNode, useEffect, useState } from "react";
import { useGeneralContext } from "~/shared/contexts/general.context";
import { useReRender } from "~/shared/utils/hook.util";
import ProfilComp from "~/ui/components/user/profil.component";
import SignIn from "~/ui/components/user/sign_in.component";
import SignUp from "~/ui/components/user/sign_up.component";

export default function ProfilPage(): ReactNode {
    const { user } = useGeneralContext();
    const reRender = useReRender();
    const [signMode, setSignMode] = useState(true);  // true for sign in, false for sign up

    useEffect(() => {
        console.log("Loaded: ProfilPage");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(user.subscribe(reRender));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    useEffect(() => {
        console.log("Rendered: ProfilPage");
    });

    return (
        user.current !== undefined
            ? <ProfilComp />
            : (
                signMode
                    ? <SignIn changeMode={() => setSignMode(false)} />
                    : <SignUp changeMode={() => setSignMode(true)} />
            )
    );
}
