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
      </el-form>
    </div>
    <div class="option-btn">
      <el-button type="primary" @click="startRecord" :disabled="btnDis">开始录制{{startBtnStatus}}</el-button>
      <el-button :loading="loading" @click="saveRecord" :disabled="!btnDis">保存视频</el-button>
    </div>

  </div>
</template>

<script setup>
import {onMounted, ref, watch, reactive, computed} from 'vue'
import {ElButton, ElForm, ElFormItem, ElSelect, ElOption,ElNotification } from "element-plus";
import {useStatusStore} from "../store";
import {initWindow, saveBtn, recodingStatus, } from './record'
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
})

watch(store, () => {
  videoRef.value.srcObject = store.url
  videoRef.value.play()
})

const changeSource = (val) => {
  initWindow(val)
}

const startRecord = async () => {
  initWindow(formObject.source)
  btnDis.value = true
}

const loading = ref(false)
const saveRecord = async () => {
  loading.value = true
  const res = await window.electron.saveDialog()
  if (res){
    saveBtn(formObject.fromat,res, (res) => {
      btnDis.value = false
      loading.value = false

      ElNotification({
        title: '保存文件',
        message: res.msg,
      })
    })
  }else {
    loading.value = false
  }
}
const RecordStatus = () => {
  const res = recodingStatus()
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
const startBtnStatus = computed(() => {
  return  store.status != 0
})

onMounted(() => {
  getSource()
})
</script>
<style lang="scss">
.main {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  padding: 10px;
  color: white;

  .video-con {
    margin: 0 auto;
    max-width: 700px;

    #id {
      display: block;
    }
  }
}

.el-select {
  --el-select-width: 220px;
}

.form-box {
  margin-top: 12px;

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