//
//  TencentVideoTextureRender.swift
//  tencent_trtc_cloud
//
//  Created by gavinwjwang on 2022/1/11.
//
import TXLiteAVSDK_Professional
import Foundation

class TencentVideoTextureRender:NSObject,FlutterTexture ,TRTCVideoRenderDelegate,TRTCVideoFrameDelegate {
  private var _textures: FlutterTextureRegistry?;
  private var buffer: CVPixelBuffer?;
  private var _userId: String?;
  private var _streamType:TRTCVideoStreamType?;
  public var textureID: Int64?;
    init(_ textureRegistry: FlutterTextureRegistry, userId:String, streamType:TRTCVideoStreamType){
    self._textures = textureRegistry;
    self._userId = userId;
    self._streamType = streamType;
    super.init();
    self.textureID = textureRegistry.register(self);
  }

  func copyPixelBuffer() -> Unmanaged<CVPixelBuffer>? {
    if let buffer = buffer {
      return Unmanaged.passRetained(buffer);
    }
    return nil;
  }
   public func onRenderVideoFrame( _ frame:TRTCVideoFrame,userId:String?,streamType:TRTCVideoStreamType){
      if streamType != self._streamType {
        // 当包括屏幕分享流和该用户视频流时，只显示一个流
          return;
      }
      if frame.pixelBuffer != nil {
          self.buffer = frame.pixelBuffer;
          if self.textureID != nil {
              self._textures?.textureFrameAvailable(self.textureID!);
          }
      }
  }
  func onProcessVideoFrame(_ srcFrame :TRTCVideoFrame, dstFrame:TRTCVideoFrame) -> UInt32{
      dstFrame.pixelBuffer = srcFrame.pixelBuffer;
      if dstFrame.pixelBuffer != nil {
          self.buffer = dstFrame.pixelBuffer;
          if self.textureID != nil {
              self._textures?.textureFrameAvailable(self.textureID!);
          }
      }
      return 0;
  }
}
