import { type ReactNode, type LazyExoticComponent, lazy } from "react";


interface PageData {
    title: string;
    url: string;
    component: LazyExoticComponent<() => ReactNode>;
    menu_index?: number;
}

export const PAGES: PageData[] = [
    {
        title: 'Not Found',
        url: '*',
        component: lazy(() => { return import('~/ui/pages/not_found.page'); }),
    },
    {
        title: 'Home',
        url: '/',
        component: lazy(() => { return import('~/ui/pages/home.page'); }),
        menu_index: 0,
    },
    {
        title: 'Problems',
        url: '/problem',
        component: lazy(() => { return import('~/ui/pages/problem/problem.page'); }),
        menu_index: 1,
    },
    {
        title: 'Scoreboard',
        url: '/scoreboard',
        component: lazy(() => { return import('~/ui/pages/scoreboard/scoreboard.page'); }),
        menu_index: 2,
    },
    {
        title: 'Docs',
        url: '/docs',
        component: lazy(() => { return import('~/ui/pages/docs/docs.page'); }),
        menu_index: 3,
    },
    {
        title: 'Profil',
        url: '/profil',
        component: lazy(() => { return import('~/ui/pages/profil/profil.page'); }),
        menu_index: -1,
    },
    {
        title: 'Problem',
        url: '/problem/:id',
        component: lazy(() => { return import('~/ui/pages/problem/[id]/[id].page'); }),
    },
    {
        title: 'Reset Password',
        url: '/reset-password/:token',
        component: lazy(() => { return import('~/ui/pages/reset-password/reset-password.page'); }),
    },
    {
        title: 'Verify Email',
        url: '/verify-email/:token',
        component: lazy(() => { return import('~/ui/pages/verify-email/verify-email.page'); }),
    }
];

export const HOME_PAGE = PAGES.find(page => page.menu_index === 0);
export const PROFIL_PAGE = PAGES.find(page => page.menu_index === -1);
export const MENU_PAGES = PAGES.filter(page => page.menu_index !== undefined && page.menu_index > 0).sort((a, b) => (a.menu_index! - b.menu_index!));
