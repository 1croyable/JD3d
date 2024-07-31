const COS = require('cos-nodejs-sdk-v5');
const cos = new COS({
    SecretId: 'AKIDyq9c3rXKEHA0lRNjCQcp5ToAd2SxY7oa',
    SecretKey: '2AQoKyzzuiffgq2OxUq9IDweR7vu1Lk3',
});

const dbConfig1 = {
    host: 'localhost',
    user: 'root',
    password: '1qa@WS-3ed$RF',
    database: 'routejoyeuse'
};

function getAuto(key) {
    return new Promise((resolve, reject) => {
        const Authorization = COS.getAuthorization({
            SecretId: 'AKIDyq9c3rXKEHA0lRNjCQcp5ToAd2SxY7oa',
            SecretKey: '2AQoKyzzuiffgq2OxUq9IDweR7vu1Lk3',
            Method: 'get',
            Key: key,
            Expires: 60,
            Query: {},
            Headers: {},
        });
        if(Authorization){
            resolve(Authorization)
        } else {
            reject('error')
        }
    })
}

module.exports = {
    cos, dbConfig1, getAuto
}