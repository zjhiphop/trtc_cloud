import 'dart:async';
import 'dart:convert';
import 'dart:html';
import 'dart:js_util';
import 'package:flutter/foundation.dart';
import 'Simulation_js.dart' if (dart.library.html) 'package:js/js.dart';
import 'package:flutter/services.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';
import './trtc_cloud_js.dart';
import 'dart:ui' as ui;
import 'beauty_manager_js.dart';
import 'trtc_cloud_listener_web.dart';

const trtcCloudChannelView = 'trtcCloudChannelView';

/// @nodoc
class TencentTRTCCloudWeb {
  static late MethodChannel _channel;
  static TrtcWrapper? _trtcCloudWrapper;
  static late BeautyManagerWrapper _beautyManagerWrapper;
  static void registerWith(Registrar registrar) {
    _channel = MethodChannel(
      'trtcCloudChannel',
      const StandardMethodCodec(),
      registrar,
    );

    final pluginInstance = TencentTRTCCloudWeb();
    _channel.setMethodCallHandler(pluginInstance.handleMethodCall);

    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory(trtcCloudChannelView,
        (int viewId) {
      var divId = 'HTMLID_$trtcCloudChannelView' + viewId.toString();
      var element = DivElement()..setAttribute("id", divId);
      MethodChannel(trtcCloudChannelView + '_$viewId',
              const StandardMethodCodec(), registrar)
          .setMethodCallHandler((call) =>
              pluginInstance.handleViewMethodCall(call, element, divId));
      return element;
    });
  }

  Future<dynamic> handleViewMethodCall(
      MethodCall call, Element element, String divId) async {
    var args = '';
    if (call.arguments != null) {
      args = jsonEncode(call.arguments);
      // 不能用map，在release模式下有问题
      //Map<String, dynamic>.from(call.arguments);
    }
    print(
        "============>>> method: ${call.method} , arguments :  ${call.arguments}");
    switch (call.method) {
      case 'startLocalPreview':
        _trtcCloudWrapper!.startLocalPreview(element, divId, args);
        break;
      case 'updateLocalView':
        _trtcCloudWrapper!.updateLocalView(element, divId, args);
        break;
      case 'updateRemoteView':
        _trtcCloudWrapper!.updateRemoteView(element, divId, args);
        break;
      case 'startRemoteView':
        _trtcCloudWrapper!.startRemoteView(element, divId, args);
        break;
      default:
        throw PlatformException(
          code: 'Unimplemented',
          details:
              'trtcCloudChannelView for web doesn\'t implement \'${call.method}\'',
        );
    }
  }

  void initSharedInstance() {
    _trtcCloudWrapper = new TrtcWrapper();
    _beautyManagerWrapper = new BeautyManagerWrapper();
    TRTCCloudListenerWeb _webCallback = new TRTCCloudListenerWeb();
    if (kIsWeb && _trtcCloudWrapper != null) {
      _trtcCloudWrapper!.setEventHandler(
        allowInterop(
          (String evenType, dynamic data) {
            _webCallback.handleJsCallBack(evenType, data);
          },
        ),
      );
    }
    _trtcCloudWrapper!.sharedInstance();
  }

  Future<dynamic> handleMethodCall(MethodCall call) async {
    print(
        "============>>>  method: ${call.method} , arguments :  ${call.arguments}");

    if (_trtcCloudWrapper == null && call.method != 'sharedInstance') {
      print('_trtcCloudWrapper is null');
      return Future.value(true);
    }
    var args = '';
    if (call.arguments != null) {
      args = jsonEncode(call.arguments);
      // 不能用map，在release模式下有问题
      //Map<String, dynamic>.from(call.arguments);
    }
    switch (call.method) {
      case "sharedInstance":
        initSharedInstance();
        return Future.value(true);
      case "destroySharedInstance":
        _trtcCloudWrapper!.destroySharedInstance();
        return Future.value(true);
      case "enterRoom":
        _trtcCloudWrapper!.enterRoom(args);
        return Future.value(true);
      case "exitRoom":
        _trtcCloudWrapper!.exitRoom();
        return Future.value(true);
      case "switchRoom":
        _trtcCloudWrapper!.switchRoom(args);
        return Future.value(true);
      case "connectOtherRoom":
        _trtcCloudWrapper!.connectOtherRoom(args);
        return Future.value(true);
      case "disconnectOtherRoom":
        _trtcCloudWrapper!.disconnectOtherRoom(args);
        return Future.value(true);
      case "switchRole":
        _trtcCloudWrapper!.switchRoom(args);
        return Future.value(true);
      case "setDefaultStreamRecvMode":
        _trtcCloudWrapper!.setDefaultStreamRecvMode(args);
        return Future.value(true);
      case "stopLocalPreview":
        _trtcCloudWrapper!.stopLocalPreview(args);
        return Future.value(true);
      case "muteRemoteAudio":
        _trtcCloudWrapper!.muteRemoteAudio(args);
        return Future.value(true);
      case "muteAllRemoteAudio":
        _trtcCloudWrapper!.muteAllRemoteAudio(args);
        return Future.value(true);
      case "setRemoteAudioVolume":
        _trtcCloudWrapper!.setRemoteAudioVolume(args);
        return Future.value(true);
      case "setAudioCaptureVolume":
        _trtcCloudWrapper!.setAudioCaptureVolume(args);
        return Future.value(true);
      case "getAudioCaptureVolume":
        return Future.value(_trtcCloudWrapper!.getAudioCaptureVolume(args));
      case "setAudioPlayoutVolume":
        _trtcCloudWrapper!.setAudioPlayoutVolume(args);
        return Future.value(true);
      case "getAudioPlayoutVolume":
        return Future.value(_trtcCloudWrapper!.getAudioPlayoutVolume(args));
      case "stopRemoteView":
        _trtcCloudWrapper!.stopRemoteView(args);
        return Future.value(true);
      case "startLocalAudio":
        _trtcCloudWrapper!.startLocalAudio(args);
        return Future.value(true);
      case "stopLocalAudio":
        _trtcCloudWrapper!.stopLocalAudio(args);
        return Future.value(true);
      case "setLocalRenderParams":
        _trtcCloudWrapper!.setLocalRenderParams(args);
        return Future.value(true);
      case "setRemoteRenderParams":
        return Future.value(true);
      case "stopAllRemoteView":
        _trtcCloudWrapper!.stopAllRemoteView(args);
        return Future.value(true);
      case "muteRemoteVideoStream":
        _trtcCloudWrapper!.muteRemoteVideoStream(args);
        return Future.value(true);
      case "muteAllRemoteVideoStreams":
        _trtcCloudWrapper!.muteAllRemoteVideoStreams(args);
        return Future.value(true);
      case "setVideoEncoderParam":
        _trtcCloudWrapper!.setVideoEncoderParam(args);
        return Future.value(true);
      case "startPublishing":
        _trtcCloudWrapper!.startPublishing(args);
        return Future.value(true);
      case "stopPublishing":
        _trtcCloudWrapper!.stopPublishing(args);
        return Future.value(true);
      case "startPublishCDNStream":
        _trtcCloudWrapper!.startPublishCDNStream(args);
        return Future.value(true);
      case "stopPublishCDNStream":
        _trtcCloudWrapper!.stopPublishCDNStream(args);
        return Future.value(true);
      case "setMixTranscodingConfig":
        _trtcCloudWrapper!.setMixTranscodingConfig(args);
        return Future.value(true);
      case "setNetworkQosParam":
        return Future.value(true);
      case "setVideoEncoderRotation":
        return Future.value(true);
      case "setVideoMuteImage":
        return Future.value(1);
      case "setVideoEncoderMirror":
        return Future.value(true);
      case "setGSensorMode":
        return Future.value(true);
      case "enableEncSmallVideoStream":
        return Future.value(_trtcCloudWrapper!.enableEncSmallVideoStream(args));
      case "setRemoteVideoStreamType":
        return Future.value(_trtcCloudWrapper!.setRemoteVideoStreamType(args));
      case "snapshotVideo":
        return Future.value(true);
      case "muteLocalAudio":
        _trtcCloudWrapper!.muteLocalAudio(args);
        return Future.value(true);
      case "muteLocalVideo":
        _trtcCloudWrapper!.muteLocalVideo(args);
        return Future.value(true);
      case "enableAudioVolumeEvaluation":
        return Future.value(
            _trtcCloudWrapper!.enableAudioVolumeEvaluation(args));
      case "startAudioRecording":
        return Future.value(true);
      case "stopAudioRecording":
        return Future.value(true);
      case "startLocalRecording":
        return Future.value(true);
      case "stopLocalRecording":
        return Future.value(true);
      case "enableAudioEarMonitoring":
        // cloudManager!.enableAudioEarMonitoring(call: call, result: result);
        break;
      case "switchCamera":
        _trtcCloudWrapper!.switchCamera(args);
        return Future.value(1);
      case "isFrontCamera":
        return Future.value(true);
      case "getCameraZoomMaxRatio":
        return Future.value(true);
      case "setCameraZoomRatio":
        return Future.value(true);
      case "enableCameraAutoFocus":
        return Future.value(true);
      case "enableCameraTorch":
        return Future.value(true);
      case "setCameraFocusPosition":
        return Future.value(true);
      case "isAutoFocusEnabled":
        return Future.value(true);
      case "setSystemVolumeType":
        return Future.value(true);
      case "setAudioRoute":
        _trtcCloudWrapper!.setAudioRoute(args);
        return Future.value(true);
      case "getBeautyManager":
        _trtcCloudWrapper!.getBeautyManager();
        return Future.value(true);
      case "getDeviceManager":
        _trtcCloudWrapper!.getDeviceManager();
        return Future.value(true);
      case "getAudioEffectManager":
        _trtcCloudWrapper!.getAudioEffectManager();
        return Future.value(true);
      case "setWatermark":
        _trtcCloudWrapper!.setWatermark(args);
        return Future.value(true);
      case "startScreenCaptureInApp":
        return Future.value(true);
      case "startScreenCaptureByReplaykit":
        return Future.value(true);
      case "startScreenCapture":
        _trtcCloudWrapper!.startScreenCapture(args);
        return Future.value(true);
      case "stopScreenCapture":
        _trtcCloudWrapper!.stopScreenCapture(args);
        return Future.value(true);
      case "pauseScreenCapture":
        _trtcCloudWrapper!.pauseScreenCapture(args);
        return Future.value(true);
      case "resumeScreenCapture":
        _trtcCloudWrapper!.resumeScreenCapture(args);
        return Future.value(true);
      // case "sendCustomVideoData":
      // 	cloudManager!.sendCustomVideoData(call: call, result: result);
      // 	break;
      case "sendCustomCmdMsg":
        return Future.value(true);
      case "sendSEIMsg":
        return Future.value(true);
      case "startSpeedTest":
        return Future.value(true);
      case "stopSpeedTest":
        return Future.value(true);
      case "setLocalVideoRenderListener":
        return Future.value(true);
      case "setRemoteVideoRenderListener":
        return Future.value(true);
      case "unregisterTexture":
        return Future.value(true);
      case "getSDKVersion":
        return Future.value(_trtcCloudWrapper!.getSDKVersion());
      case "setLogCompressEnabled":
        _trtcCloudWrapper!.setLogCompressEnabled(args);
        return Future.value(true);
      case "setLogDirPath":
        _trtcCloudWrapper!.setLogDirPath(args);
        return Future.value(true);
      case "setLogLevel":
        _trtcCloudWrapper!.setLogLevel(args);
        return Future.value(true);
      case "callExperimentalAPI":
        _trtcCloudWrapper!.callExperimentalAPI(args);
        return Future.value(true);
      case "setConsoleEnabled":
        _trtcCloudWrapper!.setConsoleEnabled(args);
        return Future.value(true);
      case "showDebugView":
        _trtcCloudWrapper!.showDebugView(args);
        return Future.value(true);
      case "setBeautyStyle":
        _beautyManagerWrapper.setBeautyStyle(args);
        return Future.value(true);
      case "setBeautyLevel":
        _beautyManagerWrapper.setBeautyLevel(args);
        return Future.value(true);
      case "setWhitenessLevel":
        _beautyManagerWrapper.setWhitenessLevel(args);
        return Future.value(true);
      case "enableSharpnessEnhancement":
        return Future.value(true);
      case "setRuddyLevel":
        _beautyManagerWrapper.setRuddyLevel(args);
        return Future.value(true);
      case "setFilter":
        _beautyManagerWrapper.setFilter(args);
        return Future.value(true);
      case "setFilterStrength":
        _beautyManagerWrapper.setFilterStrength(args);
        return Future.value(true);
      case "setEyeScaleLevel":
        _beautyManagerWrapper.setEyeScaleLevel(args);
        return Future.value(true);
      case "setFaceSlimLevel":
        _beautyManagerWrapper.setFaceSlimLevel(args);
        return Future.value(true);
      case "setFaceVLevel":
        _beautyManagerWrapper.setFaceVLevel(args);
        return Future.value(true);
      case "setChinLevel":
        _beautyManagerWrapper.setChinLevel(args);
        return Future.value(true);
      case "setFaceShortLevel":
        _beautyManagerWrapper.setFaceShortLevel(args);
        return Future.value(true);
      case "setNoseSlimLevel":
        _beautyManagerWrapper.setNoseSlimLevel(args);
        return Future.value(true);
      case "setEyeLightenLevel":
        _beautyManagerWrapper.setEyeLightenLevel(args);
        return Future.value(true);
      case "setToothWhitenLevel":
        _beautyManagerWrapper.setToothWhitenLevel(args);
        return Future.value(true);
      case "setWrinkleRemoveLevel":
        _beautyManagerWrapper.setWrinkleRemoveLevel(args);
        return Future.value(true);
      case "setPounchRemoveLevel":
        _beautyManagerWrapper.setPounchRemoveLevel(args);
        return Future.value(true);
      case "setSmileLinesRemoveLevel":
        _beautyManagerWrapper.setSmileLinesRemoveLevel(args);
        return Future.value(true);
      case "setForeheadLevel":
        _beautyManagerWrapper.setForeheadLevel(args);
        return Future.value(true);
      case "setEyeDistanceLevel":
        _beautyManagerWrapper.setEyeDistanceLevel(args);
        return Future.value(true);
      case "setEyeAngleLevel":
        _beautyManagerWrapper.setEyeAngleLevel(args);
        return Future.value(true);
      case "setMouthShapeLevel":
        _beautyManagerWrapper.setMouthShapeLevel(args);
        return Future.value(true);
      case "setNoseWingLevel":
        _beautyManagerWrapper.setNoseWingLevel(args);
        return Future.value(true);
      case "setNosePositionLevel":
        _beautyManagerWrapper.setNosePositionLevel(args);
        return Future.value(true);
      case "setLipsThicknessLevel":
        _beautyManagerWrapper.setLipsThicknessLevel(args);
        return Future.value(true);
      case "setFaceBeautyLevel":
        _beautyManagerWrapper.setFaceBeautyLevel(args);
        return Future.value(true);
      case "setMotionTmpl":
        _beautyManagerWrapper.setMotionTmpl(args);
        return Future.value(true);
      case "setMotionMute":
        _beautyManagerWrapper.setMotionMute(args);
        return Future.value(true);
      case "setVoiceEarMonitorVolume":
        return Future.value(true);
      case "setVoiceReverbType":
        return Future.value(true);
      case "setVoiceChangerType":
        return Future.value(true);
      case "setVoiceCaptureVolume":
        return Future.value(true);
      case "setMusicObserver":
        // self.setMusicObserver(call: call, result: result);
        break;
      case "startPlayMusic":
        _trtcCloudWrapper!.startPlayMusic(args);
        return Future.value(true);
      case "stopPlayMusic":
        _trtcCloudWrapper!.stopPlayMusic(args);
        return Future.value(true);
      case "pausePlayMusic":
        _trtcCloudWrapper!.pausePlayMusic(args);
        return Future.value(true);
      case "resumePlayMusic":
        _trtcCloudWrapper!.resumePlayMusic(args);
        return Future.value(true);
      case "setMusicPublishVolume":
        return Future.value(true);
      case "setMusicPlayoutVolume":
        return Future.value(true);
      case "setAllMusicVolume":
        return Future.value(true);
      case "setMusicPitch":
        return Future.value(true);
      case "setMusicSpeedRate":
        return Future.value(true);
      case "getMusicCurrentPosInMS":
        return Future.value(true);
      case "seekMusicToPosInMS":
        return Future.value(true);
      case "getMusicDurationInMS":
        return Future.value(true);
      case "getDevicesList":
        return promiseToFuture(_trtcCloudWrapper!.getDevicesList(args));
      case "setCurrentDevice":
        return promiseToFuture(_trtcCloudWrapper!.setCurrentDevice(args));
      case "getCurrentDevice":
        return promiseToFuture(_trtcCloudWrapper!.getCurrentDevice(args));
      case "setCurrentDeviceVolume":
        return promiseToFuture(_trtcCloudWrapper!.setCurrentDeviceVolume(args));
      case "getCurrentDeviceVolume":
        return promiseToFuture(_trtcCloudWrapper!.getCurrentDeviceVolume(args));
      case "setCurrentDeviceMute":
        return promiseToFuture(_trtcCloudWrapper!.setCurrentDeviceMute(args));
      case "getCurrentDeviceMute":
        return promiseToFuture(_trtcCloudWrapper!.getCurrentDeviceMute(args));
      case "startCameraDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.startCameraDeviceTest(args));
      case "stopCameraDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.stopCameraDeviceTest(args));
      case "startMicDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.startMicDeviceTest(args));
      case "stopMicDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.stopMicDeviceTest(args));
      case "startSpeakerDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.startSpeakerDeviceTest(args));
      case "stopSpeakerDeviceTest":
        return promiseToFuture(_trtcCloudWrapper!.stopSpeakerDeviceTest(args));
      default:
        throw PlatformException(
          code: 'Unimplemented',
          details: 'trtc_plugin for web doesn\'t implement \'${call.method}\'',
        );
    }
  }
}
