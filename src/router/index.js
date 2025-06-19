import {createRouter, createWebHashHistory} from "vue-router";

const routes = [
    {
        path: "/",
        component: () => import("../components/default/Default.vue"),
        redirect: "/",
        children: [
            {
                path: "/",
                component: () => import("../views/home/Index2.vue"),
                name: "Home",
                meta: {
                    title:'饰品军需'
                }
            },
            {
                path: "/openBox/:id",
                component: () => import("../views/openBox/index.vue"),
                name: "openBox",
                props: true,
                meta:{
                    title:'饰品军需'
                }
            },
            {
                path: "",
                component: () => import("../views/upgrade/index.vue"),
                children: [
                    {
                        path: "/upgrade",
                        component: () =>
                            import("../views/upgrade/components/shopping/index.vue"),
                        name: "upgradeShopping",
                        meta: {
                            title:'装备升级'
                        }

                    },
                    {
                        path: "/upgrade/open",
                        component: () =>
                            import("../views/upgrade/components/open/index.vue"),
                        name: "upgradeOpen",
                        meta:{
                            title:'装备升级'
                        }
                    },
                ],
            },
            {
                path: "/user",
                redirect: "/user/base",
            },
            {
                path: "/user/:type",
                component: () => import("../views/user/Index.vue"),
                name: "User",
                meta: {
                    title:'个人中心'
                }
            },
            {
                path: "/userMobile",
                component: () => import("../views/user/MobileIndex.vue"),
                name: 'UserMobile',
                meta: {
                    title:'个人中心'
                }
            },
            {
                path: "/roll",
                component: () => import("../views/roll/Index.vue"),
                name: "Roll",
                meta: {
                    title:'Roll房福利'
                }

            },
            {
                path: "/roll/:id",
                component: () => import("../views/roll/Room.vue"),
                name: "RollRoom",
                meta: {
                    title:'Roll房福利'
                }
            },
            {
                path: "/smelt",
                component: () => import("../views/smelt/Index.vue"),
                name: "Smelt",
                meta: {
                    title:'饰品熔炼'
                }
            },
            {
                path: "/center",
                component: () => import("../views/center/Index.vue"),
                name: "Center",
                meta:{
                    title:'福利中心'
                }
            },
            {
                path: "/login",
                component: () => import("../views/login/Index.vue"),
                name: "Login",
                meta: {
                    title:'登录'
                }
            },
            {
                path: "/register",
                component: () => import("../views/login/Index.vue"),
                name: "Register",
                meta: {
                    title:'注册'
                }
            }
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/",
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    console.log(to);
    console.log(from);
    if (to.meta.title) {
        document.title =`CF开箱网 - ${to.meta.title}`;
    }
    next();
});
export default router;
