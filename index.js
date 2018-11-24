var mosca = require('mosca')
var msgpack = require('msgpack')
var request = require('request')
// var debounce = require('lodash.debounce')
var _ = require('lodash');
// var _ = require('lodash/core');

var moscaSettings = {
  port: 1883,
  persistence: mosca.persistence.Memory
};

var server = new mosca.Server(moscaSettings, function() {
  console.log('Mosca server is up and running')
});

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

const watches = [
  '123b6a1b8b6d',
  '123b6a1b8c0a'
]

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('\n### published:')
  const obj = msgpack.unpack(Buffer.from(packet.payload))
  if (obj.devices && obj.devices.length) {
    obj.devices.forEach(buf => {
      if (buf.length !== 38) return

      const macAddressBuf = buf.slice(1, 7)
      const macAddress = macAddressBuf.toString('hex')

      const rssiBuf = buf.slice(7, 8)
      const rssi = parseInt(rssiBuf.toString('hex'), 16) - 256

      if (watches.includes(macAddress.toLowerCase())) {
        console.log(macAddress, rssi)

        if (rssi > -50) {
          // open door
          // go to http://172.16.1.30/H
          // npm request (唔洗用 promise, 用 debounce 限制)
          // 唔可以直接 call，因為個程式運行得太快，直接 call 會不斷開門，死得啦
          // 總之要計時, 5秒內只准許開門一次
          // https://lodash.com/docs/4.17.11#debounce

          var opendoor = function() {request('http://172.16.1.30/H')}
          
          var gg = _.debounce(opendoor, 5000)
          
          gg()
        }
      }
    })
  }
})

server.on('ready', setup)

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
}
