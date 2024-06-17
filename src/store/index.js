import { defineStore } from 'pinia'



export const useStatusStore = defineStore('videoStatus', {
    state: () => {
        /**
         *
         * 0 录制
         * 1 停止
         * */
        return {
            status: 0,
            url:'',
            duration:0,
        }
    },
    actions: {
        setStatus(value) {
            console.log(value,'222222222')
            this.status = value
        },
        setUrl(value) {
            this.url = value
        },
        setDuration(value) {
            this.duration = value
        }
    }
})