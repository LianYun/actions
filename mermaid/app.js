import fs from 'fs'
import express from 'express'
import puppeteer from 'puppeteer'
import { renderMermaid } from "@mermaid-js/mermaid-cli"
import { decode } from 'js-base64'
import { v4 as uuidv4 } from 'uuid'
import oss from 'ali-oss'

const app = express()
var puppeteerConfig = {}
const browser = await puppeteer.launch(puppeteerConfig)

// const client = new oss({
//     region: 'yourregion', // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
//     accessKeyId: process.env.OSS_ACCESS_KEY_ID, // 确保已设置环境变量OSS_ACCESS_KEY_ID。
//     accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET, // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
//     bucket: 'yourbucketname', // 示例：'my-bucket-name'，填写存储空间名称。
// })
const port = 8080

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/mermaid/draw/', (req, res) => {
    console.log(req.body)
    var definition = decode(req.body['definition'])
    return draw_to_png(definition).then(upload_to_oss).then(filename => res.json({ filename: filename }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

async function draw_to_png(definition) {
    var outputFormat = "png"
    var opt = {}
    const { data } = await renderMermaid(browser, definition, outputFormat, opt)
    return data
}

async function upload_to_oss(png_data) {
    var filename = uuidv4() + '.png'
    await fs.promises.writeFile(filename, png_data)
    // var result = await client.put(filename, new Buffer.from(png_data))
    // console.log(result)
    return filename
}