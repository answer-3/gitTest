const axios = require('axios')
const fs = require('fs');
const path = require('path');

let getFilePath = (date) => {
    let filePath = './data/' + date.substring(0, 4) + '/' + date.substring(4, 6);
    fs.mkdirSync(filePath, {recursive: true});
    return filePath + '/image.json';
}

let getFileContent = (filePath) => {
    let content;
    try {
        content = fs.readFileSync(filePath, {encoding: 'utf-8'});
        content = JSON.parse(content);
    } catch (e) {
        content = [];
    }
    return content;
}

let downloadImage = (url, filePath) => {
    if (url && filePath) {
        if (!url.startsWith('http')) {
            url = 'https://cn.bing.com' + url;
        }
        url = url.substring(0, url.indexOf('.jpg&'));
        url = url.substring(0, url.lastIndexOf('_')) + "_UHD.jpg";
        let fileName = filePath.replace('image.json', '') + url.substring(url.indexOf('th?id=') + 6);
        try {
            fs.openSync(fileName);
        } catch (e) {
            axios.get(url, {responseType: 'stream'}).then(response => {
                response.data.pipe(fs.createWriteStream(path.resolve(fileName)));
            })
        }
    }
}

let writMarkDown = (images, filePath) => {
    let content = '## 必应今日图片';
    images.forEach((imageData) => {
        content += `

---
### ${imageData.FullDateString}：${imageData.ImageContent.Headline}
#### ${imageData.ImageContent.Title}（${imageData.ImageContent.Copyright}）
![${imageData.ImageContent.Headline}](https://cn.bing.com${imageData.ImageContent.Image.Wallpaper} "${imageData.ImageContent.Headline}")
${imageData.ImageContent.Description}

${imageData.ImageContent.QuickFact.MainText}`;
    })
    fs.writeFileSync(filePath, content, null);
}

let getDateStr = (imageData) => {
    if (!imageData.enddate) {
        let date = imageData.FullDateString.replace('月', '').split(' ');
        imageData.enddate = date[0] + (date[1] > 9 ? date[1] : '0' + date[1]) + (date[2] > 9 ? date[2] : '0' + date[2]);
    }
    return imageData.enddate;
}

let saveFileContent = (content) => {
    if (content && Array.isArray(content) && content.length > 0) {
        let fileMap = new Map;
        content.forEach(o => {
            let date = getDateStr(o);
            let filePath = getFilePath(date);
            let monthJSON = fileMap.get(filePath);
            if (!monthJSON) {
                monthJSON = getFileContent(filePath);
                fileMap.set(filePath, monthJSON);
            }
            monthJSON.push(o);
        });
        fileMap.forEach((v, filePath) => {
            let keySet = new Set();
            let jsonStr = '[\r\n';
            v.sort((a, b) => {
                return getDateStr(a) > getDateStr(b) ? 1 : -1;
            }).forEach(o => {
                if (!keySet.has(getDateStr(o))) {
                    jsonStr += JSON.stringify(o) + ',\r\n';
                    keySet.add(getDateStr(o));
                    downloadImage(o.url || o.ImageContent.Image.Wallpaper, filePath);
                }
            });
            jsonStr = (jsonStr + ']').replace('},\r\n]', '}\r\n]');
            fs.writeFileSync(filePath, jsonStr, null);
            writMarkDown(JSON.parse(jsonStr), filePath.replace('image.json', 'README.md'));
        })
    }
}

exports.loadBingImage = () => {
    axios.get('https://cn.bing.com/hp/api/model')
        .then((response) => {
            let images = response.data.MediaContents;
            saveFileContent(images);
            writMarkDown(images, './README.md');
        })
}
