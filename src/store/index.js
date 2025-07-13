import { defineStore } from 'pinia';

export const useStore = defineStore('myStore', { // 第一个参数是 id
    state: () => ({
        userInfo: {},
        isPC: false,
        needLogin:false,
        battleRoomData: {}
    }),
    getters: {
        getUserInfo(state) {
            return state.userInfo;
        },
        isLogin(state) {
            return state.userInfo && state.userInfo.userId;
        },
        getBattleRoomData(state) {
            return state.battleRoomData;
        }
    },
    actions: {
        setUserInfo(userInfo) {
            this.userInfo = userInfo;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        setIsPc(isPC) {
            this.isPC = isPC;
        },
        setBattleRoomData(battleRoomData) {
            this.battleRoomData = battleRoomData;
        },
        logout() {
            this.userInfo = {};
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            window.location.reload();
        },
        setNeedLogin(needLogin) {
            this.needLogin = needLogin;
        }

    },
});
