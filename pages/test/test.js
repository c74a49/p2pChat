// page/test.js
const app = getApp();
const anonymous = 'anonymous';
const anyBody = 'anyBody';
const none = 'none'
const myself = '我自己';
const me = '我';
let sha = require('../../utils/sha.js');
let encrypt = require('../../utils/encrypt.js');
const privateKey = sha.sha1('privateKey');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: '',
  },
  getPrivateKey() {
    var key
    try {
      var value = wx.getStorageSync(privateKey)
      //console.log(value.length);
      if (value.length > 100)
        key = value
      else {
        key = encrypt.genKey();
        wx.setStorageSync(privateKey, key)
      }
    } catch (e) {
      key = encrypt.genKey();
      wx.setStorageSync(privateKey, key)
    }
    return key;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var myPrivateKey = this.getPrivateKey();
    var myPublicKey = encrypt.getPublicKey(myPrivateKey);
    //相对于消息发送方 XXX
    let hdst = options.hdst;  //目标公钥hash
    let dMsg = options.dMsg;  //目标公钥加密的密文
    let src = options.src;    //来源公钥（用于回复消息）
    let sMsg = options.sMsg;  //来源公钥加密的密文(用于来源自己查看消息)
    //XXX

    var text = '发起会话';
    var Dst = none;
    var Src = anyBody; 
    console.log(src);
    if (src && src.length > 0) { //有来源
      var hsrc = sha.sha1(src);
      //console.log(myPublicKey);
      Src = hsrc.substr(0, 8);
      if (hdst && hdst.length > 0) { //有目的
        Dst = hdst.substr(0, 8);
        if (src == myPublicKey) {
          //消息是我发给别人的
          text = encrypt.deCrypt(sMsg, myPrivateKey);
          Src = myself;
        }
        else if (sha.sha1(myPublicKey) == hdst) {
          //消息是给我的
          text = encrypt.deCrypt(dMsg, myPrivateKey);
          Dst = me;
        }
        else {
          text = '********';
        }
      }
      else {//没有目的，公钥交换第二阶段
        Dst = anyBody;
        text = '大家好，我是: ' + hsrc.substr(0, 8);
      }
    }
    else { //没有来源也没有目的，初次进入时,公钥交换第一阶段
      //text = '!!!本次消息仅用于广播公钥，不传输任何信息!!!';
      text = '!!!第一次发送对话框时不作为信息发送!!!'
      }
    this.setData({
      text: text,
      dst: Dst,
      src:Src,
    });
    this.publicKey = src; //回复时的公钥
    this.myNick = anonymous;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.getUserInfo({
                success: function (res) {
                  var userInfo = res.userInfo
                  var nickName = userInfo.nickName
                  var avatarUrl = userInfo.avatarUrl
                  var gender = userInfo.gender //性别 0：未知、1：男、2：女
                  var province = userInfo.province
                  var city = userInfo.city
                  var country = userInfo.country
                  this.myNick = nickName
                }
              })
            }
          })
        }
      }
    })
  },
  //input事件
  inputMoney: function (e) {
    this.setData({
      msg: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var pAlice = encrypt.getPublicKey(this.getPrivateKey());

    var pBob = this.publicKey;
    var bMsg = '';
    var aMsg = '';
    var hAlice = sha.sha1(pAlice);
    var hBob = '';
    //console.log(dst);
    let msg = this.data.msg;
    msg = (msg && (msg.length > 0)) ? msg : ' ';
    aMsg += encrypt.enCrypt(this.data.msg, pAlice);
    if (pBob && pBob.length > 0) {
      bMsg += encrypt.enCrypt(this.data.msg, pBob);
      hBob += sha.sha1(pBob);
    }
    return {
      title: 'To: ' + ((hBob.length > 0) ? hBob.substr(0, 8) : anyBody),
      imageUrl: '/res/header.jpg',
      path: '/pages/test/test?' + 'src=' + pAlice + '&sMsg=' + aMsg + '&hdst=' + hBob + '&dMsg=' + bMsg,
      success: function (res) {
        // 转发成功
        wx.navigateBack({
          delta: 1
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }

})