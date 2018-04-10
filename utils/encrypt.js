let jscrypt = require("jsencrypt.js");
const unitSize = 3;
const rsaDefaultSize = 1024;

function genPrivateKey()
{
  var enCrypt = new jscrypt.JSEncrypt(rsaDefaultSize);
  enCrypt.getKey();
  return enCrypt.getPrivateKey();
}
//utf-8编码长度计算[start, end)
function getCeilIdx(str, start, bytes)
{
  var sum = 0;
  for(var i = start; i < str.length; i++)
  {
    var uni = str.charCodeAt(i);
    var add = uni < (1<<7) ? 1 : (uni < (1<<11) ? 2 : 3);
    /*
    var add = 1;
    var start = 1;
    for (var j = 5; j > 0; j--){
      start = start << 6;
      if(uni > (start << j)) {
        add += 1;
      }
      else break;
    }*/
    sum += add;
    //console.log(add);
    if(sum > bytes) return i;
  }
  return str.length;
}

function enCode(msg, pubk){
  
  var enCrypt = new jscrypt.JSEncrypt();
  enCrypt.setPublicKey(pubk);
  var mtuLength = enCrypt.getMsgMtuLength();
  //mtuLength = Math.floor(mtuLength / unitSize);
  var groups = Math.ceil(msg.length / mtuLength); 
  var Msg = '';/*
  //console.log(groups.toString() + 'msgLength=' + msg.length.toString());
  for( var i = 0; i < groups; i++) {
    var offset = i * mtuLength;
    var sub = msg.substr (offset, mtuLength);
    console.log(enCrypt.encrypt(sub));
    Msg += enCrypt.encrypt(sub);
  }*/
  for (var offset = 0; offset < msg.length; ){
    var shift = getCeilIdx(msg, offset, mtuLength);
    var sub = msg.substring(offset, shift);
    Msg += enCrypt.encrypt(sub);
    offset = shift;
  }
  return Msg;
}
function deCode(Msg, prik) {

  //for(var i = 0, str.length)
  var deCrypt = new jscrypt.JSEncrypt();
  deCrypt.setPrivateKey(prik);
  var groupLength = deCrypt.getMsgGroupLength();
  var groups = Math.ceil(Msg.length / groupLength);
  var msg = '';
  for (var i = 0; i < groups; i++) {
    var offset = i * groupLength;
    var sub = Msg.substr (offset, groupLength);
    msg += deCrypt.decrypt(sub);
  }
  return msg;
}
function getPublicKey(prik) {

  //for(var i = 0, str.length)
  var enCrypt = new jscrypt.JSEncrypt();
  enCrypt.setPrivateKey(prik);
  return enCrypt.getPublicKey();
}
module.exports = {
  genKey: genPrivateKey,
  enCrypt: enCode,
  deCrypt: deCode,
  getPublicKey:getPublicKey,
}