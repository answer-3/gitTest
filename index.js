const axios = require('axios')
const fs = require('fs');

let loadImageJSON = async () => {
    axios.get('https://cn.bing.com/HPImageArchive.aspx?format=js&n=1&idx=0').then((response) => {
        let images = response.data.images;
        console.log(images);
        images.forEach(o => {
            // let filePath = './json/' + o.enddate.substring(0, 4) + '/' + o.enddate.substring(4, 6);
            // fs.mkdirSync(filePath, {recursive: true});
            // filePath += '/' + o.enddate.substring(6, 8) + '.json';
            // let content = fs.readFileSync(filePath,{encoding:'utf-8'});
            // console.log(JSON.parse(content) );
            // fs.writeFile(filePath, JSON.stringify(o), callback => {
            // });
            let filePath = './json/' + o.enddate.substring(0, 4);
            fs.mkdirSync(filePath, {recursive: true});
            filePath += '/' + o.enddate.substring(4, 6) + '.json';
            let content;
            try {
                content = fs.readFileSync(filePath, {encoding: 'utf-8'});
            } catch (e) {
            }
            if (!content) {
                content = '{}';
            }
            let jsonData = JSON.parse(content)
            jsonData[o.enddate] = o;
            fs.writeFileSync(filePath, JSON.stringify(jsonData), () => {
            });
        })
    })
}
loadImageJSON();
exports.loadImageJSON = loadImageJSON;
