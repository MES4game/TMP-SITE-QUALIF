import { type ReactNode, createContext, useContext, useEffect } from "react";
import { SmartRef } from "~/shared/models/hook.model";
import { useSmartRef } from "~/shared/utils/hook.util";
import { type User } from "~/shared/models/user.model";
import { getAvatarById, getSelf } from "~/api/user.api";
import type { Language, Problem } from "~/shared/models/problem.model";
import { getAllLanguages, getAllProblems } from "~/api/problem.api";

interface IGeneralContext {
    token: SmartRef<string | undefined>;
    user: SmartRef<User | undefined>;
    user_avatar: SmartRef<string | undefined>;
    problems: SmartRef<Problem[] | undefined>;
    languages: SmartRef<Language[] | undefined>;
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
                context_value.problems.current = [
                    { id: 1, color: "red", short_title: "A", title: "Sample Problem 1", description: "This is a sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 2, color: "green", short_title: "B", title: "Sample Problem 2", description: "This is another sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 3, color: "blue", short_title: "C", title: "Sample Problem 3", description: "This is yet another sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 4, color: "orange", short_title: "D", title: "Sample Problem 4", description: "This is a fourth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 5, color: "purple", short_title: "E", title: "Sample Problem 5", description: "This is a fifth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 6, color: "cyan", short_title: "F", title: "Sample Problem 6", description: "This is a sixth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 7, color: "magenta", short_title: "G", title: "Sample Problem 7", description: "This is a seventh sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 8, color: "yellow", short_title: "H", title: "Sample Problem 8", description: "This is an eighth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 9, color: "gray", short_title: "I", title: "Sample Problem 9", description: "This is a ninth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 10, color: "brown", short_title: "J", title: "Sample Problem 10", description: "This is a tenth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 11, color: "pink", short_title: "K", title: "Sample Problem 11", description: "This is an eleventh sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 12, color: "lime", short_title: "L", title: "Sample Problem 12", description: "This is a twelfth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                    { id: 13, color: "teal", short_title: "M", title: "Sample Problem 13", description: "This is a thirteenth sample problem for testing.", time_limit: 1000, memory_limit: 256 },
                ];
            });

        getAllLanguages()
            .then((languages) => { context_value.languages.current = languages; })
            .catch((err) => {
                console.error(err);
                context_value.languages.current = [
                    { key: "c", label: "C" },
                    { key: "cpp", label: "C++" },
                    { key: "python", label: "Python" },
                    { key: "java", label: "Java" },
                    { key: "kotlin", label: "Kotlin" },
                ];
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
