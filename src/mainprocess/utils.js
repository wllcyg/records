import { ipcMain, dialog } from 'electron';
const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { path:ffmpegPath } = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
export function CreateTempFile() {
    const fileName = `${Math.random().toString(16).slice(2)}.webm`;
    const filePath = path.join(__dirname, fileName);
    return  new Promise((resolve, reject) => {
        fs.writeFile(filePath, '', (err) => {
            if (err) {
                reject({
                    msg: err,
                    code: 500
                });
            }
            resolve({
                path: filePath,
                fileName: fileName,
                code:200
            });
        })
    })
}

export default function fileOperation () {
    let writeStream = undefined;
    let pathStr = undefined;
    let fileName = undefined;
    let process = 0
    ipcMain.handle('create-temp-file',  async (_,value) =>{
        console.log('create file')
        const res = await CreateTempFile();
        if (res.code === 200){
            pathStr = res.path
            fileName = res.fileName
            writeStream = fs.createWriteStream(res.path);
        }
        return Promise.resolve(res)
    });
    ipcMain.handle('blob-to-file', (_,value) =>{
        if (writeStream){
            writeStream.write(Buffer.from(value.buffer));
        }
    });
    ipcMain.handle('save-data',  (_,formatValue) =>{
        const {format,filePath} = formatValue
        const outPutPath = filePath+`\\`+`${fileName}${format}`;
        const maxThread = os.cpus().length;
        console.log(maxThread)
        return new Promise((resolve, reject) => {
            ffmpeg(pathStr)

                .output(outPutPath)
                .outputOptions([`-threads ${maxThread}`])
                .on('start',() => {

                })
                .on('progress',(_progress) => {
                    console.log(_progress,'_progress')
                    process = _progress
                })
                .on('end', () => {
                    writeStream.end()
                    process = {
                        timemark:'00:00:00.00'
                    }
                    fs.unlink(pathStr,() => {

                    })
                    resolve({
                        code:200,
                        msg:'转换成功!'
                    })
                })
                .on('error', (err) => {
                    console.log(err)
                    reject({
                        code:0,
                        msg:'转换失败!'
                    })
                })
                .run();
        })
    });
    ipcMain.handle('save-dialog',   async (_,value) =>{
        const res = await dialog.showOpenDialog({
            title:'保存视频文件路径',
            properties: ['openDirectory']
        })
        if (res.canceled){
            return null
        }else {
            return res.filePaths[0];
        }
    })
    // 发送保存进度
    ipcMain.handle('get-processes', () => {
        return process;
    })

}