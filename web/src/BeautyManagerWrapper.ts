import RTCBeautyPlugin from 'rtc-beauty-plugin';
import {
  logError,
  logSuccess,
  noSupportFunction,
  getFlutterArgs,
} from './common/TXUntils';
// 美颜文档
// https://www.npmjs.com/package/rtc-beauty-plugin
export default class BeautyManagerWrapper {
  private rtcBeautyPlugin: RTCBeautyPlugin;
  private beautyValue: { beauty: Number; brightness: Number; ruddy: Number };
  constructor() {
    this.beautyValue = { beauty: 0, brightness: 0, ruddy: 0 };
    // 一个 RTCBeautyPlugin 实例只能用来处理一条本地音视频流。
    window.InitLocalStreamCallBack = (localStream) => {
      try {
        this.rtcBeautyPlugin = new RTCBeautyPlugin();
        const beautyStream =
          this.rtcBeautyPlugin.generateBeautyStream(localStream);
        window.LocalBeautyStream = beautyStream;
        logSuccess(' rtcBeautyPlugin.generateBeautyStream success');
      } catch (error) {
        logError(' rtcBeautyPlugin.generateBeautyStream faild');
      }
    };
    // 在推流结束之后，可以销毁美颜插件，避免内存占用和性能消耗。
    window.DestoryLocalStreamCallBack = () => {
      this.rtcBeautyPlugin && this.rtcBeautyPlugin.destroy();
      this.rtcBeautyPlugin = null;
      window.LocalBeautyStream = null;
    };
  }
  // 设置美颜、美白以及红润效果级别 beautyStyle	美颜风格.三种美颜风格：0 ：光滑 1：自然 2：朦胧
  public setBeautyStyle(_args) {
    // const beautyStyle = _getFlutterArgs(_args, 'beautyStyle');
    noSupportFunction('setBeautyStyle');
  }
  // beautyLevel	美颜级别，取值范围0 - 9； 0表示关闭，1 - 9值越大，效果越明显。
  public async setBeautyLevel(_args) {
    const beautyLevel = getFlutterArgs(_args, 'beautyLevel');
    this.beautyValue.beauty = beautyLevel / 10;
    // 美颜度( 0 - 1 ，默认为 0.5 )
    this.rtcBeautyPlugin &&
      this.rtcBeautyPlugin.setBeautyParam(this.beautyValue);
  }
  // whitenessLevel	美白级别，取值范围0 - 9； 0表示关闭，1 - 9值越大，效果越明显。
  public async setWhitenessLevel(_args) {
    const whitenessLevel = getFlutterArgs(_args, 'whitenessLevel');
    this.beautyValue.brightness = whitenessLevel / 10;
    this.rtcBeautyPlugin &&
      this.rtcBeautyPlugin.setBeautyParam(this.beautyValue);
  }
  // ruddyLevel	红润级别，取值范围0 - 9； 0表示关闭，1 - 9值越大，效果越明显。
  public async setRuddyLevel(_args) {
    const ruddyLevel = getFlutterArgs(_args, 'ruddyLevel');
    this.beautyValue.ruddy = ruddyLevel / 10;
    this.rtcBeautyPlugin &&
      this.rtcBeautyPlugin.setBeautyParam(this.beautyValue);
  }

  public async setFilter(_args) {
    noSupportFunction('setFilter');
  }

  public async setFilterStrength(_args) {
    noSupportFunction('setFilterStrength');
  }

  public async setEyeScaleLevel(_args) {
    noSupportFunction('setEyeScaleLevel');
  }

  public async setFaceSlimLevel(_args) {
    noSupportFunction('setFaceSlimLevel');
  }

  public async setFaceVLevel(_args) {
    noSupportFunction('setFaceVLevel');
  }

  public async setChinLevel(_args) {
    noSupportFunction('setChinLevel');
  }

  public async setFaceShortLevel(_args) {
    noSupportFunction('setFaceShortLevel');
  }

  public async setNoseSlimLevel(_args) {
    noSupportFunction('setNoseSlimLevel');
  }

  public async setEyeLightenLevel(_args) {
    noSupportFunction('setEyeLightenLevel');
  }

  public async setToothWhitenLevel(_args) {
    noSupportFunction('setToothWhitenLevel');
  }

  public async setWrinkleRemoveLevel(_args) {
    noSupportFunction('setWrinkleRemoveLevel');
  }

  public async setPounchRemoveLevel(_args) {
    noSupportFunction('setPounchRemoveLevel');
  }

  public async setSmileLinesRemoveLevel(_args) {
    noSupportFunction('setSmileLinesRemoveLevel');
  }

  public async setForeheadLevel(_args) {
    noSupportFunction('setForeheadLevel');
  }

  public async setEyeDistanceLevel(_args) {
    noSupportFunction('setEyeDistanceLevel');
  }

  public async setEyeAngleLevel(_args) {
    noSupportFunction('setEyeAngleLevel');
  }

  public async setMouthShapeLevel(_args) {
    noSupportFunction('setMouthShapeLevel');
  }

  public async setNoseWingLevel(_args) {
    noSupportFunction('setNoseWingLevel');
  }

  public async setNosePositionLevel(_args) {
    noSupportFunction('setNosePositionLevel');
  }

  public async setLipsThicknessLevel(_args) {
    noSupportFunction('setLipsThicknessLevel');
  }

  public async setFaceBeautyLevel(_args) {
    noSupportFunction('setFaceBeautyLevel');
  }
  public async setMotionTmpl(_args) {
    noSupportFunction('setMotionTmpl');
  }
  public async setMotionMute(_args) {
    noSupportFunction('setMotionMute');
  }
}
