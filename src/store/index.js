import { defineStore } from 'pinia';

export const useStore = defineStore('myStore', { // 第一个参数是 id
    state: () => ({
        userInfo: {},
        isPC: false,
        needLogin:false,
        currRound: 1,
        currRoundFlag: {}
    }),
    getters: {
        getUserInfo(state) {
            return state.userInfo;
        },
        isLogin(state) {
            return state.userInfo && state.userInfo.userId;
        },
        getCurrRound(state) {
          return state.currRound;
        },
        getCurrRoundFlag(state) {
          return state.currRoundFlag;
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
        logout() {
            this.userInfo = {};
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            sessionStorage.removeItem('matchId');
            sessionStorage.removeItem('historyMatchId');
            sessionStorage.removeItem('againstType');
            sessionStorage.removeItem('stageGroupFightId');
            window.location.reload();
        },
        setNeedLogin(needLogin) {
            this.needLogin = needLogin;
        },
        setCurrRound(currRound) {
          this.currRound = currRound;
        },
        setCurrRoundFlag(id, flag) {
          this.currRoundFlag[id] = flag;
        },
        clearCurrRoundFlag() {
          this.currRoundFlag = {};
        }
    },
});
