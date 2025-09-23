import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../components/default/Default.vue"),
    redirect: "/",
    children: [
      {
        path: "/",
        component: () => import("../views/home/home.vue"),
        name: "Home",
        meta: {
          title: "首页",
        },
      },
      {
        path: "/required",
        component: () => import("../views/home/Index2.vue"),
        name: "Required",
        meta: {
          title: "饰品军需",
        },
      },
      {
        path: "/openBox/:id",
        component: () => import("../views/openBox/index.vue"),
        name: "openBox",
        props: true,
        meta: {
          title: "饰品军需",
        },
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
              title: "装备升级",
            },
          },
          {
            path: "/upgrade/open",
            component: () =>
              import("../views/upgrade/components/open/index.vue"),
            name: "upgradeOpen",
            meta: {
              title: "装备升级",
            },
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
          title: "个人中心",
        },
      },
      {
        path: "/userMobile",
        component: () => import("../views/user/MobileIndex.vue"),
        name: "UserMobile",
        meta: {
          title: "个人中心",
        },
      },
      {
        path: "/roll",
        component: () => import("../views/roll/Index.vue"),
        name: "Roll",
        meta: {
          title: "Roll房福利",
        },
      },
      {
        path: "/roll/:id",
        component: () => import("../views/roll/Room.vue"),
        name: "RollRoom",
        meta: {
          title: "Roll房福利",
        },
      },
      {
        path: "/battle",
        component: () => import("../views/battle/Index1.vue"),
        name: "Battle",
        meta: {
          title: "对战大厅",
        },
      },
      {
        path: "/battle/:id",
        component: () => import("../views/battle/Room.vue"),
        name: "BattleRoom",
        meta: {
          title: "对战房间",
        },
      },
      {
        path: "/champion",
        component: () => import("../views/champion/Index.vue"),
        name: "Champion",
        meta: {
          title: "夺冠之路",
        },
      },
      {
        path: "/detail",
        component: () => import("../views/champion/Detail.vue"),
        name: "Detail",
        meta: {
          title: "比赛详情",
        },
        redirect: "/match-sign-up",
      },
      {
        path: "/match-sign-up",
        component: () => import("../views/champion/SignUp.vue"),
        name: "SignUp",
        meta: {
          title: "报名",
        },
      },
      {
        path: "/match-against",
        component: () => import("../views/champion/Against.vue"),
        name: "Against",
        meta: {
          title: "对阵",
        },
      },
      {
        path: "/match-against-detail",
        component: () => import("../views/champion/AgainstDetail.vue"),
        name: "AgainstDetail",
        meta: {
          title: "对阵详情",
        },
      },
      {
        path: "/match-against-fight",
        component: () => import("../views/champion/Fight.vue"),
        name: "AgainstFight",
        meta: {
          title: "队伍对阵",
        },
      },
      {
        path: "/match-cheer",
        component: () => import("../views/champion/Cheer.vue"),
        name: "Cheer",
        meta: {
          title: "助威记录",
        },
      },
      {
        path: "/match-history",
        component: () => import("../views/champion/History.vue"),
        name: "History",
        meta: {
          title: "往期记录",
        },
      },
      {
        path: "/match-history-detail",
        component: () => import("../views/champion/HistoryDetail.vue"),
        name: "HistoryDetail",
        meta: {
          title: "往期记录详情",
        },
      },
      {
        path: "/smelt",
        component: () => import("../views/smelt/Index.vue"),
        name: "Smelt",
        meta: {
          title: "饰品熔炼",
        },
      },
      {
        path: "/center",
        component: () => import("../views/center/Index.vue"),
        name: "Center",
        meta: {
          title: "福利中心",
        },
      },
      {
        path: "/login",
        component: () => import("../views/login/Index.vue"),
        name: "Login",
        meta: {
          title: "登录",
        },
      },
      {
        path: "/register",
        component: () => import("../views/login/Index.vue"),
        name: "Register",
        meta: {
          title: "注册",
        },
      },
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
    document.title = `CF开箱网 - ${to.meta.title}`;
  }
  next();
});
export default router;
