const axios = require('axios')
const fs = require('fs');

let getFilePath = (date, type) => {
    let filePath = './json/' + (type || 'cache') + '/' + date.substring(0, 4);
    fs.mkdirSync(filePath, {recursive: true});
    filePath += '/' + date.substring(4, 6) + '.json';
    return filePath;
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

let saveFileContent = (content) => {
    if (content && Array.isArray(content) && content.length > 0) {
        let type = content[0].ImageContent ? 'model' : (content[0].urlbase.indexOf('_ZH-CN') > 0 ? 'ZH-CN' : 'EN-US');
        let dateKey = type == 'model' ? 'Ssd' : 'fullstartdate';
        let fileMap = new Map;
        content.forEach(o => {
            let date = o[dateKey].substring(0, 8);
            let filePath = getFilePath(date, type);
            let monthJSON = fileMap.get(filePath);
            if (!monthJSON) {
                monthJSON = getFileContent(filePath);
                fileMap.set(filePath, monthJSON);
            }
            monthJSON.push(o);
        });
        fileMap.forEach((v, k) => {
            let keySet = new Set();
            let jsonStr = '[\r\n';
            v.sort((a, b) => {
                return a[dateKey] > b[dateKey] ? 1 : -1;
            }).forEach(o => {
                if (!keySet.has(o[dateKey])) {
                    jsonStr += JSON.stringify(o) + ',\r\n';
                    keySet.add(o[dateKey]);
                }
            });
            jsonStr += ']';
            fs.writeFileSync(k, jsonStr, null);
        })
    }
}

exports.saveJSON = async (number, index) => {
    axios.get('https://cn.bing.com/HPImageArchive.aspx?format=js&n=' + number + '&idx=' + index).then((response) => {
        let images = response.data.images;
        saveFileContent(images);
    })
}

exports.saveJSON2model = async () => {
    axios.get('https://cn.bing.com/hp/api/model').then((response) => {
        let images = response.data.MediaContents;
        saveFileContent(images);
    })
}

