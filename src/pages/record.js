import {useStatusStore} from "../store";

let mediaRecorder;
let tempFile = ''
let storeInstance = null
export const initWindow = async (sourceId) => {
    const store = useStatusStore()
    storeInstance = store
    const {code, path} = await window.electron.createTempFile();

    if (code === 200) {
        tempFile = path
        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720,
                },
            },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        store.setUrl(stream)
        const options = {mimeType: 'video/webm; codecs=vp9'};
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(500);
    }
};

export const saveBtn = async (format,filePath,callback) => {
    mediaRecorder.stop();
    const res = await window.electron.saveData({format,filePath})
    if (res){
        callback(res)
    }
};
export const recodingStatus = () => {
    return mediaRecorder.state
}

function handleDataAvailable(event) {
    console.log('push data')
    blobToBuffer(event.data).then(e => {
            window.electron.blobData({buffer: e})
        })
}

function blobToBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}
