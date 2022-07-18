import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Listener type enumeration
enum TRTCCloudListener {
  /// Error callback, which indicates that the SDK encountered an irrecoverable error and must be listened on. Corresponding UI reminders should be displayed based on the actual conditions
  ///
  /// param:
  ///
  /// errCode Error code
  ///
  /// errMsg Error message
  onError,

  /// Warning callback. This callback is used to alert you of some non-serious problems such as lag or recoverable decoding failure
  ///
  /// param:
  ///
  /// warningCode Warning code
  ///
  /// warningMsg Warning message
  onWarning,

  /// Callback for room entry
  ///
  /// After the `enterRoom()` API in `TRTCCloud` is called to enter a room, the `onEnterRoom(result)` callback will be received from the SDK.
  ///
  /// If room entry succeeded, `result` will be a positive number (`result` > 0), indicating the time in milliseconds (ms) used for entering the room.
  ///
  /// If room entry failed, `result` will be a negative number (`result` < 0), indicating the error code for room entry failure.
  ///
  /// param:
  ///
  /// If `result` is greater than 0, it will be the time used for room entry in ms; if `result` is smaller than 0, it will be room entry error code.
  onEnterRoom,

  /// Callback for room exit
  ///
  /// When the `exitRoom()` API in `TRTCCloud` is called, the logic related to room exit will be executed, such as releasing resources of audio/video devices and codecs. After resources are released, the SDK will use the `onExitRoom()` callback to notify you.
  ///
  /// If you need to call `enterRoom()` again or switch to another audio/video SDK, please wait until you receive the `onExitRoom()` callback; otherwise, exceptions such as occupied audio device may occur.
  ///
  /// param:
  ///
  /// reason Reason for exiting the room. 0: the user actively called `exitRoom` to exit the room; 1: the user was kicked out of the room by the server; 2: the room was dismissed.
  onExitRoom,

  /// Callback for role switch
  ///
  /// Calling the `switchRole()` API in `TRTCCloud` will switch between the anchor and audience roles, which will be accompanied by a line switch process. After the SDK switches the roles, the `onSwitchRole()` event callback will be returned.
  ///
  /// param:
  ///
  /// errCode Error code. 0 indicates a successful switch
  ///
  /// errMsg	Error message
  onSwitchRole,

  /// A user enters the current room
  ///
  /// For the sake of performance, the behaviors of this notification will be different in two different application scenarios:
  ///
  /// Call scenario (`TRTCCloudDef.TRTC_APP_SCENE_VIDEOCALL` or `TRTCCloudDef.TRTC_APP_SCENE_AUDIOCALL`): users in this scenario do not have different roles, and this notification will be triggered whenever a user enters the room.
  ///
  /// Live streaming scenario (`TRTCCloudDef.TRTC_APP_SCENE_LIVE` or `TRTCCloudDef.TRTC_APP_SCENE_VOICE_CHATROOM`): this scenario does not limit the number of audience users. If any user entering or exiting the room could trigger the callback, it would cause great performance loss. Therefore, this notification will be triggered only when an anchor rather than an audience user enters the room.
  ///
  /// param:
  ///
  /// userId User ID
  onRemoteUserEnterRoom,

  /// A user exits the current room
  ///
  /// Similar to `onRemoteUserEnterRoom`, the behaviors of this notification will be different in two different application scenarios:
  ///
  /// Call scenario (`TRTCCloudDef.TRTC_APP_SCENE_VIDEOCALL` or `TRTCCloudDef.TRTC_APP_SCENE_AUDIOCALL`): users in this scenario do not have different roles, and this notification will be triggered whenever a user exits the room.
  ///
  /// Live streaming scenario (`TRTCCloudDef.TRTC_APP_SCENE_LIVE` or ` `TRTCCloudDef.TRTC_APP_SCENE_VOICE_CHATROOM`): this notification will be triggered only when an anchor rather than an audience user exits the room.
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// reason Reason for exiting the room. 0: the user proactively exited the room; 1: the user exited the room due to timeout; 2: the user was kicked out of the room.
  onRemoteUserLeaveRoom,

  /// Callback for the result of requesting cross-room call (anchor competition)
  ///
  /// Calling the `connectOtherRoom()` API in `TRTCCloud` will establish a video call between two anchors in two different rooms, i.e., the "anchor competition" feature. The caller will receive the `onConnectOtherRoom()` callback to see whether the cross-room call is successful; and if so, all users in both rooms will receive the `onUserVideoAvailable()` callback for anchor competition.
  ///
  /// param:
  ///
  /// userId `userId` of the target anchor to compete with.
  ///
  /// errCode   Error code. `ERR_NULL` indicates a successful switch. For more information, please see [Error Codes](https://cloud.tencent.com/document/product/647/32257).
  ///
  /// errMsg   Error message
  onConnectOtherRoom,

  /// Callback for the result of ending cross-room call (anchor competition)
  onDisConnectOtherRoom,

  /// Callback for the result of room switching (switchRoom)
  ///
  /// param:
  ///
  /// errCode   Error code
  ///
  /// errMsg   Error message
  onSwitchRoom,

  /// Whether the remote user has a playable primary image (generally for camera)
  ///
  /// When the `onUserVideoAvailable(userId, true)` notification is received, it indicates that available video data frames of the specified image channel have arrived. At this time, the `startRemoteView(userid)` API needs to be called to load the image of the remote user. Then, the callback for rendering the first video frame, i.e., `onFirstVideoFrame(userid)`, will be received.
  ///
  /// When the `onUserVideoAvailable(userId, false)` notification is received, it indicates that the specified channel of remote image has been disabled, which may be because the user called `muteLocalVideo()` or `stopLocalPreview()`.
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// available Whether image is enabled
  onUserVideoAvailable,

  /// Whether the remote user has a playable substream image (generally for screen sharing)
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// available Whether screen sharing is enabled
  onUserSubStreamAvailable,

  /// Whether the remote user has playable audio data
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// available Whether audio is enabled
  onUserAudioAvailable,

  /// Rendering of the first frame of a local or remote user starts
  ///
  /// If `userId` is `null`, it indicates that the captured local camera image starts to be rendered, which needs to be triggered by calling `startLocalPreview` first. If `userId` is not `null`, it indicates that the first video frame of the remote user starts to be rendered, which needs to be triggered by calling `startRemoteView` first.
  ///
  /// This callback will be triggered only after `startLocalPreview()`, `startRemoteView()`, or `startRemoteSubStreamView()` is called.
  ///
  /// param:
  ///
  /// userId ID of the local or remote user. `userId == null` indicates the ID of the local user, while `userId != null` indicates the ID of a remote user.
  ///
  /// streamType Video stream type: camera or screen sharing.
  ///
  /// width Image width
  ///
  /// height Image height
  onFirstVideoFrame,

  /// Playback of the first audio frame of a remote user starts (local audio is not supported for notification currently)
  ///
  /// param:
  ///
  /// userId Remote user ID
  onFirstAudioFrame,

  /// The first local audio frame data has been sent
  ///
  /// The SDK will start capturing the camera and encode the captured image after successful call of `enterRoom()` and `startLocalPreview()`. This callback event will be returned after the SDK successfully sends the first video frame data to the cloud.
  ///
  /// param:
  ///
  /// streamType Video stream type: big image, small image, or substream image (screen sharing)
  onSendFirstLocalVideoFrame,

  /// The first local audio frame data has been sent
  ///
  /// The SDK will start capturing the mic and encoding the captured audio after successful call of `enterRoom()` and `startLocalAudio()`. This callback event will be returned after the SDK successfully sends the first audio frame data to the cloud.
  onSendFirstLocalAudioFrame,

  /// Network quality: this callback is triggered once every 2 seconds to collect statistics of the current network upstreaming and downstreaming quality
  ///
  /// `userId` is the local user ID, indicating the current local video quality
  ///
  /// param:
  ///
  /// localQuality Upstream network quality
  ///
  /// remoteQuality Downstream network quality
  onNetworkQuality,

  /// Callback for technical metric statistics
  ///
  /// If you are familiar with audio/video terms, you can use this callback to get all technical metrics of the SDK. If you are developing an audio/video project for the first time, you can focus only on the `onNetworkQuality` callback.
  ///
  /// Note: the callback is triggered once every 2 seconds
  ///
  /// param:
  ///
  /// statics Status data
  onStatistics,

  /// The connection between SDK and server is closed
  onConnectionLost,

  /// The SDK tries to connect to the server again
  onTryToReconnect,

  /// The connection between SDK and server has been restored
  onConnectionRecovery,

  /// Callback for server speed test. SDK tests the speed of multiple server IPs, and the test result of each IP is returned through this callback notification
  ///
  /// param:
  ///
  /// currentResult Current speed test result
  ///
  /// finishedCount Number of servers on which speed test has been performed
  ///
  /// totalCount Total number of servers on which speed test needs to be performed
  onSpeedTest,

  /// Camera is ready
  onCameraDidReady,

  /// Mic is ready
  onMicDidReady,

  /// Callback for volume, including the volume of each `userId` and total remote volume
  ///
  /// The `enableAudioVolumeEvaluation` API in `TRTCCloud` can be used to enable this callback or set its triggering interval. It should be noted that after `enableAudioVolumeEvaluation` is called to enable the volume callback, no matter whether there is a user speaking in the channel, the callback will be called at the set time interval. If there is no one speaking, `userVolumes` will be empty, and `totalVolume` will be `0`.
  ///
  /// Note: if `userId` is the local user ID, it indicates the volume of the local user. `userVolumes` only includes the volume information of users who are speaking (i.e., volume is not 0).
  ///
  /// param:
  ///
  /// userVolumes Volume of all members who are speaking in the room. Value range: 0–100.
  ///
  /// totalVolume Total volume of all remote members. Value range: 0–100.
  onUserVoiceVolume,

  /// Callback for receipt of custom message
  ///
  /// When a user in a room uses `sendCustomCmdMsg` to send a custom message, other users in the room can receive the message through the `onRecvCustomCmdMsg` API.
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// cmdID Command ID
  ///
  /// seq Message serial number
  ///
  /// message Message data
  onRecvCustomCmdMsg,

  /// Callback for loss of custom message
  ///
  /// TRTC uses the UDP channel; therefore, even if reliable transfer is set, it cannot guarantee that no message will be lost; instead, it can only reduce the message loss rate to a very small value and meet general reliability requirements. After reliable transfer is set on the sender, the SDK will use this callback to notify of the number of custom messages lost during transfer in the specified past time period (usually 5s).
  ///
  /// Note:
  ///
  /// Only when reliable transfer is set on the sender can the receiver receive the callback for message loss.
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// cmdID Data stream ID
  ///
  /// errCode Error code. The value is -1 on the current version
  ///
  /// missed Number of lost messages
  onMissCustomCmdMsg,

  /// Callback for receipt of SEI message
  ///
  /// When a user in a room uses `sendSEIMsg` to send data, other users in the room can receive the data through the `onRecvSEIMsg` API.
  ///
  /// param:
  ///
  /// userId User ID
  ///
  /// message Data
  onRecvSEIMsg,

  /// Callback for starting pushing to Tencent Cloud CSS CDN, which corresponds to the `startPublishing()` API in `TRTCCloud`
  ///
  /// param:
  ///
  /// errCode	0: success; other values: failure
  ///
  /// errMsg	Specific cause of error
  onStartPublishing,

  /// Callback for stopping pushing to Tencent Cloud CSS CDN, which corresponds to the `stopPublishing()` API in `TRTCCloud`
  ///
  /// param:
  ///
  /// errCode 0: success; other values: failure
  ///
  /// errMsg	Specific cause of error
  onStopPublishing,

  /// Callback for completion of starting relayed push to CDN
  ///
  /// This callback corresponds to the `startPublishCDNStream()` API in `TRTCCloud`
  ///
  /// Note: if `Start` callback is successful, the relayed push request has been successfully sent to Tencent Cloud. If the target CDN is exceptional, relayed push may fail.
  ///
  /// param:
  ///
  /// errCode 0: success; other values: failure
  ///
  /// errMsg Specific cause of error
  onStartPublishCDNStream,

  /// Callback for completion of stopping relayed push to CDN
  ///
  /// This callback corresponds to the `stopPublishCDNStream()` API in `TRTCCloud`
  ///
  /// param:
  ///
  /// errCode 0: success; other values: failure
  ///
  /// errMsg Specific cause of error
  onStopPublishCDNStream,

  /// Callback for setting On-Cloud MixTranscoding parameters, which corresponds to the `setMixTranscodingConfig()` API in `TRTCCloud`
  ///
  /// param:
  ///
  /// errCode 0: success; other values: failure
  ///
  /// errMsg Specific cause of error
  onSetMixTranscodingConfig,

  /// Background music playback start
  onMusicObserverStart,

  /// Background music playback progress
  onMusicObserverPlayProgress,

  /// Background music playback end
  onMusicObserverComplete,

  /// Callback for screencapturing completion
  ///
  /// Parameters
  ///
  /// `errCode` of 0: success; other values: failure
  onSnapshotComplete,

  /// This callback will be returned by the SDK when screen sharing is started
  onScreenCaptureStarted,

  /// This callback will be returned by the SDK when screen sharing is paused
  ///
  /// Parameters
  ///
  /// reason Reason. 0: the user paused proactively; 1: screen sharing was paused as the screen window became invisible
  ///
  /// Note: the value called back is only valid for iOS
  onScreenCapturePaused,

  /// This callback will be returned by the SDK when screen sharing is resumed
  ///
  /// Parameters
  ///
  /// reason Reason for resumption. 0: the user resumed proactively; 1: screen sharing was resumed as the screen window became visible
  ///
  /// Note: the value called back is only valid for iOS
  onScreenCaptureResumed,

  /// This callback will be returned by the SDK when screen sharing is stopped
  ///
  /// Parameters
  ///
  ///reason Reason for stop. 0: the user stopped proactively; 1: screen sharing stopped as the shared window was closed
  onScreenCaptureStoped,

  /// Callback for local device connection and disconnection
  ///
  /// Note: this callback only supports Windows and macOS platforms
  ///
  /// Parameters
  ///
  /// deviceId  Device ID
  ///
  /// type   Device type
  ///
  /// state   Event type
  onDeviceChange,

  /// Callback for mic test volume
  ///
  /// The mic test API `startMicDeviceTest` will trigger this callback
  ///
  /// Note: this callback only supports Windows and macOS platforms
  ///
  /// Parameters:
  ///
  /// volume   Volume value between 0 and 100
  onTestMicVolume,

  /// Callback for speaker test volume
  ///
  /// The speaker test API `startSpeakerDeviceTest` will trigger this callback
  ///
  /// Note: this callback only supports Windows and macOS platforms
  ///
  /// Parameters:
  ///
  /// volume   Volume value between 0 and 100
  onTestSpeakerVolume,
}

/// @nodoc
/// Listener object
class TRTCCloudListenerObj {
  Set<ListenerValue> listeners = Set();

  TRTCCloudListenerObj(MethodChannel channel) {
    channel.setMethodCallHandler((methodCall) async {
      var arguments;
      if (!kIsWeb && Platform.isWindows) {
        arguments = methodCall.arguments;
      } else {
        arguments = jsonDecode(methodCall.arguments);
      }
      switch (methodCall.method) {
        case 'onListener':
          String typeStr = arguments['type'];
          var params = arguments['params'];

          TRTCCloudListener? type;

          for (var item in TRTCCloudListener.values) {
            if (item.toString().replaceFirst("TRTCCloudListener.", "") ==
                typeStr) {
              type = item;
              break;
            }
          }
          if (type == null) {
            throw MissingPluginException();
          }
          for (var item in listeners) {
            item(type, params);
          }
          break;
        default:
          throw MissingPluginException();
      }
    });
  }
  void doCallBack(type, params) {
    for (var item in listeners) {
      item(type, params);
    }
  }

  void addListener(ListenerValue func) {
    listeners.add(func);
  }

  void removeListener(ListenerValue func) {
    listeners.remove(func);
  }
}

/// @nodoc
typedef ListenerValue<P> = void Function(TRTCCloudListener type, P? params);
