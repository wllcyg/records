<template>
  <div class="main">
    <div class="video-con">
      <video id="video" style="width: 100%" ref="videoRef"></video>
    </div>
    <div class="form-box">
      <el-form :disabled="btnDis" :model="formObject" label-position="right" inline>
        <el-form-item label="录制源">
          <el-select placeholder="请选择视频源" v-model="formObject.source" @change="changeSource">
            <el-option
                v-for="item in sourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="存储格式">
          <el-select placeholder="请选择存储格式" v-model="formObject.fromat">
            <el-option
                v-for="item in formatOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label='存储位置'>
          <div class="selected-path" @click="selectPath(btnDis)" :class="{disabledDataText:btnDis}" >
            <div v-if="formObject.path">{{formObject.path}}</div>
            <div v-else>请选择存储位置</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="option-btn">
      <el-button type="primary" @click="startRecord"  :disabled="btnDis">开始录制</el-button>
      <el-button :loading="loading" @click="saveRecord" :disabled="!btnDis">保存视频</el-button>
    </div>
    <div class="progress-box" v-if="processValue">
      <el-progress :text-inside="true" :stroke-width="18" :percentage="processValue" />
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch, reactive, onUnmounted} from 'vue'
import {ElButton, ElForm, ElFormItem, ElSelect, ElOption, ElNotification,ElProgress} from "element-plus";
import {useStatusStore} from "../store";
import {initWindow, saveBtn, recodingStatus,} from './record'
//开始录制
const videoRef = ref(null)
const store = useStatusStore()
const formatOptions = ref([
  {label: '.mp4', value: '.mp4'},
  {label: '.webm', value: '.webm'},
  {label: '.apng', value: '.apng'},
])
const btnDis = ref(false)
const formObject = reactive({
  source: '',
  fromat: '.mp4',
  path: ''
})

watch(store, () => {
  videoRef.value.srcObject = store.url
  videoRef.value.play()
})

const changeSource = (val) => {
  initWindow(val)
}

const startRecord = async () => {
  if (formObject.path === '') {
    ElNotification({
      title: '保存文件',
      message: '请选择保存文件路径后开始录制'
    })
    return false
  }
  processValue.value = 0
  initWindow(formObject.source)
  btnDis.value = true
}

const loading = ref(false)
const saveRecord = async () => {
   loading.value = true
    saveBtn(formObject.fromat, formObject.path, (res) => {
      btnDis.value = false
      loading.value = false
      processValue.value = 100
      ElNotification({
        title: '保存文件',
        message: res.msg,
      })
    })
}

const sourceOptions = ref([])
const getSource = async () => {
  const res = await window.electron.getSources()

  if (res) {
    sourceOptions.value = res.filter(item => {
      return item.display_id
    }).map(e => {
      return {
        label: e.name,
        value: e.id
      }
    })
    if (sourceOptions.value.length > 0) {
      let first = sourceOptions.value[0].value
      formObject.source = first
    }
  }
}
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}
const selectFile = async (flag) =>{
  if (flag) return false
  const res = await window.electron.saveDialog()
  if (res) {
    formObject.path = res
  }else {
    ElNotification({
      title: '文件路径',
      message: '路径未选择'
    })
  }
}
// 将时间标记转换为秒数
function timemarkToSeconds(timemark) {
  const parts = timemark.split(':');
  const seconds = parseFloat(parts[2]);
  const minutes = parseInt(parts[1], 10) * 60;
  const hours = parseInt(parts[0], 10) * 3600;
  return (hours + minutes + seconds)*1000;
}
const selectPath = debounce(selectFile, 500)
const processValue = ref(0)
const setProcess = async () => {
  if (!loading.value) return false
  const {timemark} = await window.electron.getProcesses()
  if (timemark){
    let timer = parseInt((timemarkToSeconds(timemark) / store.duration) * 100)
    console.log(timer,'timertimertimertimertimer',timemark)
    if (timer){
      // 只保留整数位
      processValue.value = timer
    }else {
      processValue.value = 0
    }
  }
}
const timer = ref(null)

onMounted(() => {
  timer.value = setInterval(() => {
    setProcess()
  }, 500)
  getSource()
})
onUnmounted(() => {
  clearInterval(timer.value)
})
</script>
<style lang="scss">
.main {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  padding: 10px;

  .video-con {
    margin: 0 auto;
    max-width: 700px;

    #id {
      display: block;
    }
  }
  .selected-path{
    cursor: pointer;
  }
}
.disabledDataText {
  pointer-events: none;
  opacity: 0.5;
  user-select: none;
}
.el-select {
  --el-select-width: 220px;
}

.form-box {
  margin-top: 12px;

}
.progress-box{
  padding: 0 20px;
}
.option-btn {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  height: 60px;

  & :nth-child(3) {
    margin-left: 0;
  }
}

html {
  /* 禁用html的滚动条，由于用的无框架窗口，默认就会有一个滚动条，因此去掉 */
  overflow: hidden;
}

body {
  margin: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>