import { Client, Stream } from 'trtc-js-sdk';
import { logError, logSuccess, getFlutterArgs } from './common/TXUntils';
import ListenerType from './ListenerType';

import TRTC from 'trtc-js-sdk';
export default class ShareScreenManage {
  private _shareClient?: Client;
  private _shareStream?: Stream;
  private _sdkAppId?: String;
  private _roomId: string = '0';
  private _strRoomId?: String;
  private _emitEvent: Function;

  constructor(_eventCallback, _roomId, _strRoomId, _sdkAppId) {
    this._emitEvent = _eventCallback;
    this._roomId = _roomId;
    this._strRoomId = _strRoomId;
    this._sdkAppId = _sdkAppId;
  }
  public async startScreenCapture(_args) {
    const shareUserId = getFlutterArgs(_args, 'shareUserId');
    const shareUserSig = getFlutterArgs(_args, 'shareUserSig');
    this._shareClient = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: this._sdkAppId,
      userId: shareUserId,
      userSig: shareUserSig,
      frameWorkType: 7, // 罗盘上报
      useStringRoomId: this._strRoomId && this._strRoomId !== '' ? true : false,
    });
    const shareStream = TRTC.createStream({
      audio: false,
      screen: true,
      userId: shareUserId,
    });
    // 屏幕分享流监听屏幕分享停止事件
    shareStream.on('screen-sharing-stopped', () => {
      this.stopScreenCapture({});
    });
    this._shareStream = shareStream;
    try {
      await shareStream.initialize();
      logSuccess('shareStream initialize success');
    } catch (e) {
      logError('shareStream.initialize error: ' + e.name);
      // 当屏幕分享流初始化失败时, 提醒用户并停止后续进房发布流程
      switch (e.name) {
        case 'NotReadableError':
          // 提醒用户确保系统允许当前浏览器获取屏幕内容
          return;
        case 'NotAllowedError':
          if (e.message === 'Permission denied by system') {
            // 提醒用户确保系统允许当前浏览器获取屏幕内容
          } else {
            // 用户拒绝/取消屏幕分享
          }
          return;
        default:
          // 初始化屏幕分享流时遇到了未知错误，提醒用户重试
          return;
      }
    }
    try {
      await this._shareClient.join({
        roomId:
          this._strRoomId && this._strRoomId !== ''
            ? this._strRoomId
            : parseInt(this._roomId, 10),
      });
      logSuccess('ShareClient join room success');
      this._emitEvent(ListenerType.onScreenCaptureStarted, 0);
    } catch (e) {
      logError(e);
    }
    try {
      await this._shareClient.publish(this._shareStream);
      logSuccess('ShareClient publish success');
    } catch (e) {
      logError('ShareClient publish failed' + e);
    }
  }
  // 停止屏幕分享
  public async stopScreenCapture(_args) {
    if (!this._shareStream) return;
    try {
      // 屏幕分享客户端停止推流
      await this._shareClient.unpublish(this._shareStream);
      logSuccess('shareClient.unpublish success');
    } catch (error) {
      logError('shareClient.unpublish failed' + error);
    }
    try {
      // 关闭屏幕分享流
      this._shareStream.close();
      logSuccess('shareClient.close success');
    } catch (error) {
      logError('shareClient.close failed' + error);
    }
    // 屏幕分享客户端退房
    await this._shareClient.leave();
    this._emitEvent(ListenerType.onScreenCaptureStoped, 0);
    this._shareStream = null;
    this._shareClient = null;
  }
  // 暂停屏幕分享
  public async pauseScreenCapture(_args) {
    if (!this._shareStream) return;
    // 屏幕分享客户端停止推流
    await this._shareClient.unpublish(this._shareStream);
    this._emitEvent(ListenerType.onScreenCapturePaused, 0);
  }
  // 恢复屏幕分享
  public async resumeScreenCapture(_args) {
    if (!this._shareStream) return;
    // 屏幕分享客户端停止推流
    await this._shareClient.publish(this._shareStream);
    this._emitEvent(ListenerType.onScreenCaptureResumed, 0);
  }
}
