const TodayBingImage = require('./modules/today-bing-image');

console.log('开始时间：%s(%s)', new Date().toLocaleString(), new Date().getTimezoneOffset())
// TodayBingImage.saveJSON(7, 0, 'https://cn.bing.com');
TodayBingImage.saveJSON2model('https://cn.bing.com');
console.log('结束时间：%s', new Date().toISOString())
