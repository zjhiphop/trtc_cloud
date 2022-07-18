// import { logError } from './common/TXUntils';

import { logError, noSupportFunction, getFlutterArgs } from './common/TXUntils';
import TRTC from 'trtc-js-sdk';
export default class DeviceManage {
  private _currentDevice: Map<Number, string> = new Map();
  constructor() {}
  // 桌面端设备操作接口
  public async getDevicesList(_args): Promise<string> {
    const type = getFlutterArgs(_args, 'type');
    var devicesls = [];
    if (type === 0) devicesls = await TRTC.getMicrophones();
    else if (type === 1) devicesls = await TRTC.getSpeakers();
    else if (type === 2) devicesls = await TRTC.getCameras();
    return JSON.stringify(devicesls);
  }

  //
  public async setCurrentDevice(_localStream, _args): Promise<Number> {
    const type = getFlutterArgs(_args, 'type');
    const deviceId = getFlutterArgs(_args, 'deviceId');
    try {
      _localStream &&
        (await _localStream.switchDevice(
          type === 2 ? 'video' : 'audio',
          deviceId
        ));
      this._currentDevice[type] = deviceId;
    } catch (error) {
      logError('setCurrentDevice failed ' + error);
    }
    return 0;
  }
  public async getCurrentDevice(_args): Promise<string> {
    const type = getFlutterArgs(_args, 'type');
    var deviceId;
    if (this._currentDevice[type]) {
      deviceId = this._currentDevice[type];
    }
    var devicesls = [];
    if (type === 0) devicesls = await TRTC.getMicrophones();
    else if (type === 1) devicesls = await TRTC.getSpeakers();
    else if (type === 2) devicesls = await TRTC.getCameras();
    if (deviceId && deviceId !== '') {
      const obj = devicesls.find((item: any) => {
        // eslint-disable-next-line eqeqeq
        return item.deviceId == deviceId ? true : false;
      });
      if (obj) {
        return JSON.stringify(obj);
      }
    }
    return JSON.stringify(devicesls[0]);
  }

  public async setCurrentDeviceVolume(_args): Promise<Number> {
    noSupportFunction('setCurrentDeviceVolume');
    return 0;
  }

  public async getCurrentDeviceVolume(_args): Promise<Number> {
    noSupportFunction('getCurrentDeviceVolume');
    return 0;
  }
  public async setCurrentDeviceMute(_args): Promise<Number> {
    noSupportFunction('setCurrentDeviceMute');
    return 0;
  }
  public async getCurrentDeviceMute(_args): Promise<boolean> {
    noSupportFunction('getCurrentDeviceMute');
    return true;
  }
  public async startCameraDeviceTest(_args): Promise<Number> {
    noSupportFunction('startCameraDeviceTest');
    return 0;
  }
  public async stopCameraDeviceTest(_args): Promise<Number> {
    noSupportFunction('stopCameraDeviceTest');
    return 0;
  }
  public async startMicDeviceTest(_args): Promise<Number> {
    noSupportFunction('startMicDeviceTest');
    return 0;
  }
  public async stopMicDeviceTest(_args): Promise<Number> {
    noSupportFunction('stopMicDeviceTest');
    return 0;
  }
  public async startSpeakerDeviceTest(_args): Promise<Number> {
    noSupportFunction('startSpeakerDeviceTest');
    return 0;
  }
  public async stopSpeakerDeviceTest(_args): Promise<Number> {
    noSupportFunction('stopSpeakerDeviceTest');
    return 0;
  }

  // 移动端设备操作接口
  //   (BOOL) 	-isFrontCamera
  // (NSInteger) 	-switchCamera:
  // (BOOL) 	-isCameraZoomSupported
  // (CGFloat) 	-getCameraZoomMaxRatio
  // (NSInteger) 	-setCameraZoomRatio:
  // (BOOL) 	-isAutoFocusEnabled
  // (NSInteger) 	-enableCameraAutoFocus:
  // (NSInteger) 	-setCameraFocusPosition:
  // (BOOL) 	-isCameraTorchSupported
  // (NSInteger) 	-enableCameraTorch:
  // (NSInteger) 	-setAudioRoute:
  // (NSInteger) 	-setSystemVolumeType:
}
