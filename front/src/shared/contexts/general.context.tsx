import { type ReactNode, createContext, useContext, useEffect } from "react";
import { SmartRef } from "~/shared/models/hook.model";
import { useSmartRef } from "~/shared/utils/hook.util";
import { type User } from "~/shared/models/user.model";
import { getAvatarById, getSelf } from "~/api/user.api";
import type { Language, Problem, SubmitStatus } from "~/shared/models/problem.model";
import { getAllLanguages, getAllProblems, getAllStatuses } from "~/api/problem.api";

interface IGeneralContext {
    token: SmartRef<string | undefined>;
    user: SmartRef<User | undefined>;
    user_avatar: SmartRef<string | undefined>;
    problems: SmartRef<Problem[] | undefined>;
    languages: SmartRef<Language[] | undefined>;
    statuses: SmartRef<SubmitStatus[] | undefined>;
}

const GeneralContext = createContext<IGeneralContext | undefined>(undefined);

export interface GeneralContextProviderProps {
    readonly children: ReactNode;
}

export function GeneralContextProvider(props: GeneralContextProviderProps): ReactNode {
    const context_value: IGeneralContext = {
        token: useSmartRef<string | undefined>(undefined),
        user: useSmartRef<User | undefined>(undefined),
        user_avatar: useSmartRef<string | undefined>(undefined),
        problems: useSmartRef<Problem[] | undefined>(undefined),
        languages: useSmartRef<Language[] | undefined>(undefined),
        statuses: useSmartRef<SubmitStatus[] | undefined>(undefined),
    };

    useEffect(() => {
        console.log("Loaded: GeneralContextProvider");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(context_value.token.subscribe((_, curr) => { if (curr !== undefined) sessionStorage.setItem("token", curr); }));

        unsubscribers.push(context_value.token.subscribe((_, curr) => {
            if (curr === undefined) context_value.user.current = undefined
            else {
                getSelf(curr)
                    .then((value) => { context_value.user.current = value; })
                    .catch(console.error);
            }
        }, true));

        unsubscribers.push(context_value.user.subscribe((_, curr) => {
            if (context_value.user_avatar.current) {
                URL.revokeObjectURL(context_value.user_avatar.current);
            }

            if (curr === undefined) context_value.user_avatar.current = undefined
            else {
                getAvatarById(curr.id)
                    .then((value) => { context_value.user_avatar.current = URL.createObjectURL(value); })
                    .catch((err) => {
                        console.error(err);
                        context_value.user_avatar.current = undefined;
                    });
            }
        }, true));

        context_value.token.current = sessionStorage.getItem("token") || undefined;

        getAllProblems()
            .then((problems) => { context_value.problems.current = problems; })
            .catch((err) => {
                console.error(err);
                context_value.problems.current = undefined;
            });

        getAllLanguages()
            .then((languages) => { context_value.languages.current = languages; })
            .catch((err) => {
                console.error(err);
                context_value.languages.current = undefined;
            });

        getAllStatuses()
            .then((statuses) => { context_value.statuses.current = statuses; })
            .catch((err) => {
                console.error(err);
                context_value.statuses.current = undefined;
            });

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    useEffect(() => {
        console.log("Rendered: GeneralContextProvider");
    });

    return (
        <GeneralContext.Provider value={context_value}>
            {props.children}
        </GeneralContext.Provider>
    );
};

export function useGeneralContext(): IGeneralContext {
    const context = useContext(GeneralContext);

    if (!context) throw new Error("useGeneralContext must be used within a GeneralContextProvider");

    return context;
}
