const axios = require("axios");
const User = require('../models/User');
const Pool = require('../models/Pool');
const Pair = require('../models/Pair');

const _update = async(element, i) => {
  const pair = await Pair.findOne({id:element.id});
  if(!pair) {
    const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/solana/${element.id}`);
    if( data.pairs ) {
      await new Pair({id: data.pairs[0].pairAddress, created: data.pairs[0].pairCreatedAt}).save();
      console.log(i, {id: data.pairs[0].pairAddress, created: data.pairs[0].pairCreatedAt})
    }
  } else {
    // console.log(i, "already")
  }
}

const update = async() => {
  console.log("start-------------------------")
  try {
    const response = await axios.get('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
    const { official, unOfficial } = response.data;
    const data = [...official, ...unOfficial];

    console.log(data.length)
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      Pair.findOne({id:element.id}).then(pair => {
        if(!pair) {
          count ++;
          // if ( count > 200 ) break
          axios.get(`https://api.dexscreener.com/latest/dex/pairs/solana/${element.id}`).then(async({data}) => {
            let resp = { id: element.id, created: 0 }
            if ( data.pairs ) {
              resp = {id: data.pairs[0].pairAddress, created: data.pairs[0].pairCreatedAt};
            }
            new Pair(resp).save();
            console.log(i, resp);
          })
        }
      })
    }

  } catch ( err) {
    console.log(err);
  }
}

module.exports = {
  update
}