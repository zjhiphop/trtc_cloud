import { Client, LocalStream, RemoteStream } from 'trtc-js-sdk';
import AudioMixMusic from './AudioMixMusic';
import {
  logError,
  logSuccess,
  noSupportFunction,
  getVideoResolution,
  logInfo,
  getFlutterArgs,
} from './common/TXUntils';
import DeviceManage from './DeviceManage';
import ListenerType from './ListenerType';
import ShareScreenManage from './ShareScreenManage';

import TRTC from 'trtc-js-sdk';
declare global {
  interface Window {
    InitLocalStreamCallBack: Function;
    DestoryLocalStreamCallBack: Function;
    LocalBeautyStream: any;
  }
}
export default class TrtcWrapper {
  private handler?: (event: string, data: string) => {};
  private _client?: Client;
  private _shareScreenManage?: ShareScreenManage;
  private _isHadJoined?: boolean;
  private _joinCallList: Map<String, Function> = new Map();
  private _localStream?: LocalStream;
  private _localPreviewId?: String;
  private _remoteStream: Map<String, RemoteStream> = new Map();
  private _remoteHtml: Map<String, HTMLDivElement> = new Map();
  private _userId?: String;
  private _sdkAppId?: String;
  private _roomId: string = '0';
  private _strRoomId?: String;
  private _muteInitLocalAudio: boolean = false;
  private _muteInitLocalVideo: boolean = false;
  private _deviceManage: DeviceManage;
  private _audioMixMusic: AudioMixMusic;
  constructor() {
    logSuccess('TrtcWrapper new come');
    this._deviceManage = new DeviceManage();
    this._muteInitLocalAudio = false;
    this._muteInitLocalVideo = false;
    this._isHadJoined = false;
    this._joinCallList.clear();
  }
  public getSDKVersion(): string {
    return TRTC.VERSION;
  }

  /// 房间start
  public async enterRoom(param: any) {
    logSuccess('begin enterRoom');
    const userId = getFlutterArgs(param, 'userId');
    const sdkAppId = getFlutterArgs(param, 'sdkAppId');
    const userSig = getFlutterArgs(param, 'userSig');
    const roomId = getFlutterArgs(param, 'roomId');
    const strRoomId = getFlutterArgs(param, 'strRoomId');
    const role = getFlutterArgs(param, 'role');
    const streamId = getFlutterArgs(param, 'streamId');
    const userDefineRecordId = getFlutterArgs(param, 'userDefineRecordId');
    const privateMapKey = getFlutterArgs(param, 'privateMapKey');
    // const businessInfo = _getFlutterArgs(param, 'businessInfo');
    // const scene = _getFlutterArgs(param, 'scene');
    this._userId = userId;
    this._sdkAppId = sdkAppId;
    this._roomId = roomId;
    this._strRoomId = strRoomId;
    const clientOpt: any = {
      sdkAppId,
      userId,
      userSig,
      mode: 'rtc',
      autoSubscribe: true,
      frameWorkType: 7, // 罗盘上报
      useStringRoomId: strRoomId && strRoomId !== '' ? true : false,
    };
    if (streamId !== '') {
      clientOpt.streamId = streamId;
    }
    if (userDefineRecordId !== '') {
      clientOpt.userDefineRecordId = userDefineRecordId;
    }
    await this._initClient(clientOpt, strRoomId, roomId, role, privateMapKey);
  }
  public async exitRoom() {
    await this.stopScreenCapture({});
    this._localStream && (await this._client.unpublish(this._localStream));
    this._localStream && (await this._localStream.stop());
    this._localStream && (await this._localStream.close());
    logSuccess('localStream stop & close success');
    this._client && (await this._client.leave());
    window.DestoryLocalStreamCallBack();
    this._client && this._client.off('*');
    this._remoteStream.clear();
    this._remoteHtml.forEach((item) => {
      item.remove();
    });
    this._remoteHtml.clear();
    this._muteInitLocalAudio = false;
    this._muteInitLocalVideo = false;
    this._isHadJoined = false;
    this._joinCallList.clear();
    this._localStream = null;
    this._client = null;
    logSuccess('exitRoom success');
  }
  // 切换角色
  public async switchRole(_args) {
    const role = getFlutterArgs(_args, 'role');
    if (role === 21) await this._client.switchRole('anchor');
    else if (role === 20) await this._client.switchRole('audience');
    else logError(`switchRole role ${role} not supper `);
  }
  public async switchRoom(_args) {
    noSupportFunction('switchRoom');
  }
  // 请求跨房通话
  public async connectOtherRoom(_args) {
    noSupportFunction('connectOtherRoom');
  }
  // 退出跨房通话
  public async disconnectOtherRoom(_args) {
    noSupportFunction('disconnectOtherRoom');
  }
  // 设置订阅模式（需要在进入房前设置才能生效）
  public async setDefaultStreamRecvMode(_args) {
    noSupportFunction('setDefaultStreamRecvMode');
  }
  // 创建子房间示例（用于多房间并发观看）
  public async createSubCloud(_args) {
    noSupportFunction('createSubCloud');
  }
  public async destroySubCloud(_args) {
    noSupportFunction('destroySubCloud');
  }
  /// 房间 end

  /// 本地start
  // 开启本地音频的采集和发布
  public async startLocalAudio() {
    this._muteInitLocalAudio = true;
    await this._createNPublishLocalStream();
    if (!this._localStream.hasAudio()) {
      const audioStream = TRTC.createStream({ audio: true, video: false });
      await audioStream.initialize();
      const audioTrack = audioStream.getAudioTrack();
      this._localStream && (await this._localStream.addTrack(audioTrack));
    }
    this._localStream && this._localStream.unmuteAudio();
  }

  // 停止本地音频的采集和发布
  public async stopLocalAudio(_args) {
    this._localStream && this._localStream.muteAudio();
  }

  // 暂停/恢复发布本地的音频流
  public async muteLocalAudio(_args) {
    if (!this._localStream) return;
    const mute = getFlutterArgs(_args, 'mute');
    if (mute) await this._localStream.muteAudio();
    else await this._localStream.unmuteAudio();
  }

  // 暂停/恢复发布本地的视频流
  public async muteLocalVideo(_args) {
    if (!this._localStream) return;
    const mute = getFlutterArgs(_args, 'mute');
    if (mute) await this._localStream.muteVideo();
    else await this._localStream.unmuteVideo();
  }

  // 停止摄像头预览
  public async stopLocalPreview(_args) {
    if (!this._localStream) return;
    // 本地的只会关闭视频，音频不会一起关闭。而远端的流stop就会音视频流都关闭
    await this._localStream.stop();
    await this._localStream.muteVideo();
  }

  // 开启本地摄像头的预览画面
  public async startLocalPreview(_element, viewId, _args) {
    this._muteInitLocalVideo = true;
    await this._createNPublishLocalStream();
    if (!this._localStream.hasVideo()) {
      // 创建一个stream, 获取videoTrack添加到 原来的stream里面去
      const videoStream = TRTC.createStream({ audio: false, video: true });
      await videoStream.initialize();
      const videoTrack = videoStream.getVideoTrack();
      await this._localStream.addTrack(videoTrack);
      this._muteInitLocalVideo &&
        window.InitLocalStreamCallBack(this._localStream);
    }
    await this._localStream.unmuteVideo();
    await this._localStream.play(viewId, {
      objectFit: 'cover',
      muted: true,
    });
    this._localPreviewId = viewId;
    await this._localStream.resume();
  }

  // 设定本地音频的采集音量
  public async setAudioCaptureVolume(_args) {
    noSupportFunction('setAudioCaptureVolume');
  }

  // 获取本地音频的采集音量
  public getAudioCaptureVolume(_args): Number {
    const level = this._localStream.getAudioLevel();
    return level * 100;
  }

  // 设定SDK音频的播放音量
  public async setAudioPlayoutVolume(_args) {
    const volume = getFlutterArgs(_args, 'volume');
    if (this._localStream) {
      this._localStream.setAudioVolume(volume / 100);
    }
  }

  // 获取SDK音频的播放音量
  public getAudioPlayoutVolume(_args): Number {
    if (this._localStream) {
      return this._localStream.getAudioLevel() * 100;
    }
    return 0;
  }

  // 设置音频路由
  public async setAudioRoute(_args) {
    noSupportFunction('setAudioRoute');
  }
  public async switchCamera(_args) {
    noSupportFunction('switchCamera');
  }

  // 设置本地画面的渲染参数
  public async setLocalRenderParams(_args) {
    noSupportFunction('setLocalRenderParams');
  }
  //设置视频编码器的编码参数
  public async setVideoEncoderParam(_args) {
    const config = JSON.parse(_args);
    const videoResolution = getVideoResolution(config.videoResolution).split(
      '*'
    );
    let height = videoResolution[0];
    let width = videoResolution[1];
    this._localStream.setVideoProfile({
      width: width, // 视频宽度
      height: height, // 视频高度
      frameRate: config.videoFps, // 帧率
      bitrate: config.videoBitrate, // 比特率 kbps
    });
  }
  // 开启大小画面双路编码模式. 请在enterroom之后，开启摄像头之前调用
  public enableEncSmallVideoStream(_args): Number {
    if (!this._client) return -1;
    const enable = getFlutterArgs(_args, 'enable');
    enable
      ? this._client.enableSmallStream()
      : this._client.disableSmallStream();
    return 0;
  }
  // 切换指定远端用户的大小画面
  public setRemoteVideoStreamType(_args): Number {
    // {userId: 345, streamType: 1}
    const userId = getFlutterArgs(_args, 'userId');
    const streamType = getFlutterArgs(_args, 'streamType');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      this._client &&
        this._client.setRemoteVideoStreamType(
          userRemoteStream,
          streamType === 1 ? 'small' : 'big'
        );
    }
    return 0;
  }
  // 启用音量大小提示
  public enableAudioVolumeEvaluation(_args): Number {
    const intervalMs = getFlutterArgs(_args, 'intervalMs');
    this._client && this._client.enableAudioVolumeEvaluation(intervalMs);
    return 0;
  }
  /// 本地end

  /// 远端 start
  // 订阅远端用户的视频流，并绑定视频渲染控件
  public async startRemoteView(_element, _viewId, _args) {
    const userId = getFlutterArgs(_args, 'userId');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      await userRemoteStream.unmuteVideo();
      const oDiv = this._remoteHtml.get(userId);
      if (oDiv) {
        try {
          logInfo(`startRemoteView ${_viewId} removeChild ${userId} view`);
          document.body &&
            document.body.removeChild &&
            document.body.removeChild(oDiv);
        } catch (ex) {
          logInfo(
            `startRemoteView removeChild failed, It does not affect the use of ${ex}`
          );
        }
        var pDom = document.getElementById(_viewId);
        if (pDom) pDom.appendChild(oDiv);
        else {
          _element.appendChild(oDiv);
          console.error(_element);
          logError(`startRemoteView ${_viewId} not find `);
        }
        oDiv.style.visibility = 'visible';
        logInfo(`startRemoteView ${_viewId} appendChild ${userId} view`);
        await userRemoteStream.resume();
      } else {
        logError(`startRemoteView ${_viewId} oDiv not find ${userId} view`);
      }
    }
  }

  // 停止订阅远端用户的视频流，并释放渲染控件
  public async stopRemoteView(_args) {
    const userId = getFlutterArgs(_args, 'userId');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      await userRemoteStream.muteVideo();
      const oDiv = this._remoteHtml.get(userId);
      if (oDiv) oDiv.style.visibility = 'hidden';
    }
  }

  // 停止订阅所有远端用户的视频流，并释放全部渲染资源
  public async stopAllRemoteView(_args) {
    if (this._remoteStream) {
      this._remoteStream.forEach(async (item, key) => {
        const userRemoteStream = item;
        await userRemoteStream.muteVideo();
        const oDiv = this._remoteHtml.get(key);
        if (oDiv) oDiv.style.visibility = 'hidden';
      });
    }
  }

  // 暂停/恢复订阅远端用户的视频流
  public async muteRemoteVideoStream(_args) {
    const mute = getFlutterArgs(_args, 'mute');
    const userId = getFlutterArgs(_args, 'userId');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      mute
        ? await userRemoteStream.muteVideo()
        : await userRemoteStream.unmuteVideo();
      if (!mute) userRemoteStream.resume();
    }
  }

  // 暂停/恢复订阅所有远端用户的视频流
  public async muteAllRemoteVideoStreams(_args) {
    const mute = getFlutterArgs(_args, 'mute');
    if (this._remoteStream) {
      this._remoteStream.forEach(async (item) => {
        const userRemoteStream = item;
        mute
          ? await userRemoteStream.muteVideo()
          : await userRemoteStream.unmuteVideo();
        if (!mute) userRemoteStream.resume();
      });
    }
  }

  // 暂停/恢复播放远端的音频流
  public async muteRemoteAudio(_args) {
    const userId = getFlutterArgs(_args, 'userId');
    const mute = getFlutterArgs(_args, 'mute');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      mute
        ? await userRemoteStream.muteAudio()
        : await userRemoteStream.unmuteAudio();
      if (!mute) userRemoteStream.resume();
    }
  }

  // 暂停/恢复播放所有远端用户的音频流
  public async muteAllRemoteAudio(_args) {
    const mute = getFlutterArgs(_args, 'mute');
    if (this._remoteStream) {
      this._remoteStream.forEach(async (item) => {
        const userRemoteStream = item;
        mute
          ? await userRemoteStream.muteAudio()
          : await userRemoteStream.unmuteAudio();
        if (!mute) userRemoteStream.resume();
      });
    }
  }

  // 设定某一个远端用户的声音播放音量
  public async setRemoteAudioVolume(_args) {
    const userId = getFlutterArgs(_args, 'userId');
    const volume = getFlutterArgs(_args, 'volume');
    if (this._remoteStream && this._remoteStream.has(userId)) {
      const userRemoteStream = this._remoteStream.get(userId);
      userRemoteStream.setAudioVolume(volume / 100);
    }
  }
  /// 远端end

  /// 录音相关start
  public async startAudioRecording(_args) {}
  public async stopAudioRecording(_args) {}
  public async startLocalRecording(_args) {}
  public async stopLocalRecording(_args) {}
  /// 录音相关end

  // 暂时不实现
  public async updateLocalView(_element, _viewId, _args) {
    noSupportFunction('updateLocalView');
  }
  public async updateRemoteView(_element, _viewId, _args) {
    noSupportFunction('updateLocalView');
  }

  /// 日志start
  // 	设置 Log 输出级别
  public async setLogLevel(_args) {
    const level = getFlutterArgs(_args, 'level');
    TRTC.Logger.setLogLevel(level);
  }
  // 	启用/禁用控制台日志打印
  public async setConsoleEnabled(_args) {
    const enabled = getFlutterArgs(_args, 'enabled');
    enabled ? TRTC.Logger.enableUploadLog() : TRTC.Logger.disableUploadLog();
  }
  // 	启用/禁用日志的本地压缩
  public async setLogCompressEnabled(_args) {}
  // 设置本地日志的保存路径
  public async setLogDirPath(_args) {}
  // 	设置日志回调
  public async setLogDelegate(_args) {}
  // 	显示仪表盘
  public async showDebugView(_args) {}
  // 	设置仪表盘的边距
  public async setDebugViewMargin(_args) {}
  // 调用实验性接口
  public async callExperimentalAPI(_args) {}
  /// 日志end

  /// CDN 相关接口函数 start
  // 开始向腾讯云直播 CDN 上发布音视频流
  public async startPublishing(_args) {
    if (!this._client) return;
    // {streamId: clavie_stream_001, streamType: 0}
    try {
      await this._client.startPublishCDNStream({
        streamId: getFlutterArgs(_args, 'streamId'),
      });
      logSuccess('startPublishing Success');
    } catch (error) {
      logError(error);
    }
  }

  // 停止向腾讯云直播 CDN 上发布音视频流
  public async stopPublishing(_args) {
    if (!this._client) return;
    await this._client.stopPublishCDNStream();
  }

  // 开始向非腾讯云 CDN 上发布音视频流
  public async startPublishCDNStream(_args) {
    if (!this._client) return;
    try {
      await this._client.startPublishCDNStream({
        appId: getFlutterArgs(_args, 'appId'),
        bizId: getFlutterArgs(_args, 'bizId'),
        url: getFlutterArgs(_args, 'url'),
      });
      logSuccess('startPublishCDNStream Success');
    } catch (error) {
      logError(error);
    }
  }

  // 停止向非腾讯云 CDN 上发布音视频流
  public async stopPublishCDNStream(_args) {
    if (!this._client) return;
    await this._client.stopPublishCDNStream();
  }

  // 设置云端混流的排版布局和转码参数
  public async setMixTranscodingConfig(_args) {
    if (!this._client) return;
    try {
      await this._client.startMixTranscode(
        JSON.parse(
          _args
            .replace('"backgroundImage":null', '"backgroundImage":""')
            .replace('"streamId":null', '"streamId":""')
        )
      );
      logSuccess('startMixTranscode Success');
    } catch (error) {
      logError(error);
    }
  }
  /// CDN 相关接口函数 end

  /// 屏幕分享相关接口start
  // 开始桌面端屏幕分享
  public async startScreenCapture(_args) {
    this._shareScreenManage = new ShareScreenManage(
      this._emitEvent,
      this._roomId,
      this._strRoomId,
      this._sdkAppId
    );
    this._shareScreenManage.startScreenCapture(_args);
  }
  // 停止屏幕分享
  public async stopScreenCapture(_args) {
    this._shareScreenManage && this._shareScreenManage.stopScreenCapture(_args);
  }
  // 暂停屏幕分享
  public async pauseScreenCapture(_args) {
    this._shareScreenManage &&
      this._shareScreenManage.pauseScreenCapture(_args);
  }
  // 恢复屏幕分享
  public async resumeScreenCapture(_args) {
    this._shareScreenManage &&
      this._shareScreenManage.resumeScreenCapture(_args);
  }
  /// 屏幕分享相关接口end

  // setNetworkQosParam	设置网络质量控制的相关参数
  // setLocalRenderParams	设置本地画面的渲染参数
  // setRemoteRenderParams	设置远端画面的渲染模式
  // setVideoEncoderRotation	设置视频编码器输出的画面方向
  // setVideoEncoderMirror	设置编码器输出的画面镜像模式
  // setGSensorMode	设置重力感应的适配模式
  // snapshotVideo	视频画面截图

  /// 设备管理start
  public async getDevicesList(_args) {
    return this._deviceManage.getDevicesList(_args);
  }
  public async setCurrentDevice(_args) {
    return this._deviceManage.setCurrentDevice(this._localStream, _args);
  }
  public async getCurrentDevice(_args) {
    return this._deviceManage.getCurrentDevice(_args);
  }
  public async setCurrentDeviceVolume(_args) {
    return this._deviceManage.setCurrentDeviceVolume(_args);
  }
  public async getCurrentDeviceVolume(_args) {
    return this._deviceManage.getCurrentDeviceVolume(_args);
  }
  public async setCurrentDeviceMute(_args) {
    return this._deviceManage.setCurrentDeviceMute(_args);
  }
  public async getCurrentDeviceMute(_args) {
    return this._deviceManage.getCurrentDeviceMute(_args);
  }
  public async startCameraDeviceTest(_args) {
    return this._deviceManage.startCameraDeviceTest(_args);
  }
  public async stopCameraDeviceTest(_args) {
    return this._deviceManage.stopCameraDeviceTest(_args);
  }
  public async startMicDeviceTest(_args) {
    return this._deviceManage.startMicDeviceTest(_args);
  }
  public async stopMicDeviceTest(_args) {
    return this._deviceManage.stopMicDeviceTest(_args);
  }
  public async startSpeakerDeviceTest(_args) {
    return this._deviceManage.startSpeakerDeviceTest(_args);
  }
  public async stopSpeakerDeviceTest(_args) {
    return this._deviceManage.stopSpeakerDeviceTest(_args);
  }
  /// 设备管理end
  // 开启水印
  public async setWatermark(_args) {
    noSupportFunction('setWatermark');
  }

  /// 背景音乐相关start
  public async startPlayMusic(_args) {
    const path = JSON.parse(getFlutterArgs(_args, 'musicParam')).path;
    // const path = './media/daoxiang.mp3';
    this._audioMixMusic.createMusic(path);
    this._audioMixMusic.addLowMix();
    this._audioMixMusic.lowMixStart();
  }
  public async stopPlayMusic() {
    this._audioMixMusic.lowMixStop();
  }
  public async resumePlayMusic(_args) {
    this._audioMixMusic.lowMixResume();
  }
  public async pausePlayMusic(_args) {
    this._audioMixMusic.lowMixPause();
  }
  /// 背景音乐相关end

  public setEventHandler(handler: (event: string) => {}) {
    this.handler = handler;
  }
  public async sharedInstance() {}
  public async destroySharedInstance() {
    if (this._client) {
      await this.exitRoom();
      logSuccess('destroySharedInstance success');
    }
  }
  public getDeviceManager() {}
  public getBeautyManager() {}
  public getAudioEffectManager() {}
  private async _createNPublishLocalStream() {
    if (this._localStream) {
      return;
    }
    logSuccess(`begin create ${this._userId} Stream`);
    this._localStream = TRTC.createStream({
      userId: this._userId,
      audio: this._muteInitLocalAudio,
      video: this._muteInitLocalVideo,
      // facingMode:'user',//environment
    });
    var promise = new Promise<void>(async (resolve, reject) => {
      try {
        logSuccess('begin LocalStream initialize');
        await this._localStream.initialize();
        this._muteInitLocalVideo &&
          window.InitLocalStreamCallBack(this._localStream);
        this._audioMixMusic = new AudioMixMusic(this._localStream);
        logSuccess('LocalStream initialize success');
      } catch (error) {
        logError('failed initialize localStream ' + error);
      }
      try {
        const publishFun = async () => {
          if (window.LocalBeautyStream) {
            await this._client.publish(window.LocalBeautyStream);
          } else {
            await this._client.publish(this._localStream);
          }
        };
        if (this._isHadJoined) {
          publishFun();
        } else {
          this._joinCallList.set('publish', publishFun);
        }
        logSuccess('success initialize localStream & publish success');
        resolve();
      } catch (publishError) {
        logError('failed publish localStream ' + publishError);
        reject();
      }
    });
    return promise;
  }
  private _emitEvent(methodName: ListenerType, data: any) {
    if (data instanceof Array || typeof data === 'object') {
      data = JSON.stringify(data);
    }
    this.handler?.call(this, methodName.toString(), data);
  }
  private _addListener() {
    if (!this._client) return;
    this._client.on('error', (error) => {
      this._emitEvent(ListenerType.onError, {
        errCode: error.getCode(),
        errMsg: error.getMessage(),
      });
    });
    this._client.on('client-banned', (error) => {
      this._emitEvent(ListenerType.onWarning, {
        errCode: error.getCode(),
        errMsg: '同名用户登录或者是被账户管理员主动踢出房间',
      });
    });
    this._client.on('network-quality', (event) => {
      this._emitEvent(ListenerType.onNetworkQuality, event);
    });
    this._client.on('peer-join', (event) => {
      const userId = event.userId;
      this._emitEvent(ListenerType.onRemoteUserEnterRoom, userId);
    });
    this._client.on('peer-leave', (event) => {
      const userId = event.userId;
      this._emitEvent(ListenerType.onRemoteUserLeaveRoom, {
        userId,
        reason: 0,
      });
    });
    this._client.on('stream-added', (event) => {
      const remoteStream = event.stream;
      const remoteUserId = remoteStream.getUserId();
      this._remoteStream.set(remoteUserId, remoteStream);
      if (this._remoteHtml.has(remoteUserId)) {
        logInfo(`user ${remoteUserId} div had exist`);
      } else {
        var oDiv: HTMLDivElement = document.createElement('div');
        oDiv.id = 'stream-added-stream_' + remoteUserId;
        oDiv.style.visibility = 'hidden';
        oDiv.style.height = '100%';
        oDiv.style.width = '100%';
        // document.body.appendChild(oDiv);
        logInfo(`stream-added ${remoteUserId}`);
        this._remoteHtml.set(remoteUserId, oDiv);
      }
      remoteStream.play(this._remoteHtml.get(remoteUserId), {
        objectFit: 'cover',
        muted: false,
      });
      remoteStream.resume();
    });
    this._client.on('stream-removed', (event) => {
      const remoteStream = event.stream;
      const remoteUserId = remoteStream.getUserId();
      this._remoteStream.delete(remoteUserId);
      logInfo(`user ${remoteUserId} stream-removed`);
      this._emitEvent(ListenerType.onUserVideoAvailable, {
        userId: remoteUserId,
        available: false,
      });
      this._emitEvent(ListenerType.onUserAudioAvailable, {
        userId: remoteUserId,
        available: false,
      });
      remoteStream.stop();
    });
    this._client.on('mute-audio', (event) => {
      const userId = event.userId;
      this._emitEvent(ListenerType.onUserAudioAvailable, {
        userId,
        available: false,
      });
    });
    this._client.on('mute-video', (event) => {
      const userId = event.userId;
      this._emitEvent(ListenerType.onUserVideoAvailable, {
        userId,
        available: false,
      });
    });
    this._client.on('unmute-audio', (event) => {
      const userId = event.userId;
      this._emitEvent(ListenerType.onUserAudioAvailable, {
        userId,
        available: true,
      });
    });
    this._client.on('unmute-video', (event: { userId: any }) => {
      const userId = event.userId;
      logInfo(`user ${userId} unmute-video`);
      this._emitEvent(ListenerType.onUserVideoAvailable, {
        userId,
        available: true,
      });
    });
    this._client.on('stream-subscribed', (event) => {
      const remoteStream = event.stream;
      const remoteUserId = remoteStream.getUserId();
      this._emitEvent(ListenerType.onUserSubStreamAvailable, {
        userId: remoteUserId,
        available: true,
      });
    });
    this._client.on('audio-volume', (event) => {
      var volumeList: any = [];
      var totalVolume = 0;
      event.result.forEach(({ userId, audioVolume }) => {
        volumeList.push({
          userId: userId,
          volume: audioVolume,
        });
        totalVolume += audioVolume;
      });
      this._emitEvent(ListenerType.onUserVoiceVolume, {
        userVolumes: volumeList,
        totalVolume: totalVolume,
      });
    });
  }

  private async _initClient(clientOpt, strRoomId, roomId, role, privateMapKey) {
    this._client = TRTC.createClient(clientOpt);
    var promise = new Promise<void>((resolve, reject) => {
      logSuccess('begin join room');
      this._client
        .join({
          roomId:
            strRoomId && strRoomId !== '' ? strRoomId : parseInt(roomId, 10),
          role,
          privateMapKey,
        })
        .then(() => {
          logSuccess('join room success');
          this._addListener();
          resolve();
          this._isHadJoined = true;
          // 在登录后执行缓存的函数
          if (this._joinCallList.size > 0) {
            let mapping = this._joinCallList;
            mapping.forEach((value, key) => {
              logInfo(`after join room call ${key} func`);
              value();
            });
            this._joinCallList.clear();
          }
        })
        .catch((error) => {
          logError('Join room failed: ' + error);
          reject();
        });
    });
    return promise;
  }
}
