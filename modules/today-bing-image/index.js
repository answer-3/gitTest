const axios = require('axios')
const fs = require('fs');
const path = require('path');

let getFilePath = (parent, date) => {
    let filePath = './data/' + (parent || 'cache') + '/' + date.substring(0, 4) + '/' + date.substring(4, 6);
    fs.mkdirSync(filePath, {recursive: true});
    return filePath + '.json';
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
        let fileName = filePath.replace('.json', '/') + url.substring(url.indexOf('th?id=') + 6);
        try {
            fs.openSync(fileName);
        } catch (e) {
            axios.get(url, {responseType: 'stream'}).then(response => {
                response.data.pipe(fs.createWriteStream(path.resolve(fileName)));
            })
        }
    }
}

let saveFileContent = (content) => {
    if (content && Array.isArray(content) && content.length > 0) {
        let parent, dateKey, imageUrl;
        if (content[0].ImageContent) {
            parent = 'MediaContents';
            dateKey = 'Ssd';
            imageUrl = content[0].ImageContent.Image.Url;
        } else {
            parent = 'images';
            dateKey = 'fullstartdate';
            imageUrl = content[0].urlbase;
        }
        parent += '/' + (imageUrl.indexOf('_ZH-CN') > 0 ? 'ZH-CN' : 'EN-US');
        let fileMap = new Map;
        content.forEach(o => {
            let date = o[dateKey].substring(0, 8);
            let filePath = getFilePath(parent, date);
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
                    downloadImage(o.url || o.ImageContent.Image.Url, k);
                }
            });
            jsonStr += ']';
            fs.writeFileSync(k, jsonStr.replace('},\r\n]', '}\r\n]'), null);
        })
    }
}

exports.saveJSON = async (number, index, host) => {
    axios.get((host || 'https://cn.bing.com') + '/HPImageArchive.aspx?format=js&n=' + number + '&idx=' + index).then((response) => {
        let images = response.data.images;
        saveFileContent(images);
    })
}

exports.saveJSON2model = async (host) => {
    axios.get((host || 'https://cn.bing.com') + '/hp/api/model').then((response) => {
        let images = response.data.MediaContents;
        saveFileContent(images);
    })
}

