import TXLiteAVSDK_Professional
import Flutter


public class TRTCCloudVideoPlatformViewFactory : NSObject,FlutterPlatformViewFactory{

	public static let SIGN = "trtcCloudChannelView";
	private var message : FlutterBinaryMessenger;
	
	init(message : FlutterBinaryMessenger) {
		self.message = message;
	}
	
	public func create(withFrame frame: CGRect, viewIdentifier viewId: Int64, arguments args: Any?) -> FlutterPlatformView {
		
        let view = TRTCCloudVideoPlatformView(frame,self.message,viewId);
		
//		// 绑定方法监听
//		FlutterMethodChannel(
//			name: "\(TRTCCloudVideoPlatformViewFactory.SIGN)_\(viewId)",
//			binaryMessenger: message
//		).setMethodCallHandler(view.handle);
		
		return view;
	}
}

public class TRTCCloudVideoPlatformView : NSObject,FlutterPlatformView{
	private var remoteView : UIView;
	private var frame : CGRect;
    private let channel: FlutterMethodChannel?;
	init(_ frame : CGRect,_ messager: FlutterBinaryMessenger,_ viewId: Int64) {
		self.frame = frame;
		self.remoteView = UIView();
        self.channel = FlutterMethodChannel(name: "trtcCloudChannelView_\(viewId)", binaryMessenger: messager);
        super.init();
        self.channel?.setMethodCallHandler(handle);
	}
	
	public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
		switch call.method {
		case "startRemoteView":
			self.startRemoteView(call: call, result: result);
			break;
		case "startLocalPreview":
			self.startLocalPreview(call: call, result: result);
			break;
        case "updateLocalView":
            self.updateLocalView(call: call, result: result);
            break;
		case "updateRemoteView":
            self.updateRemoteView(call: call, result: result);
            break;
		default:
			result(FlutterMethodNotImplemented);
		}
	}
	
	public func view() -> UIView {
		return remoteView;
	}
	
	deinit {
        if channel != nil {
            channel?.setMethodCallHandler(nil);
        }
	}
	
	public func startRemoteView(call: FlutterMethodCall, result: @escaping FlutterResult) {
		if let userId = CommonUtils.getParamByKey(call: call, result: result, param: "userId") as? String, 
      	let streamType = CommonUtils.getParamByKey(call: call, result: result, param: "streamType") as? Int {
			TRTCCloud.sharedInstance().startRemoteView(userId, streamType: TRTCVideoStreamType(rawValue: streamType)!, view: self.remoteView);
			result(nil);
		}
	}
	
	public func startLocalPreview(call: FlutterMethodCall, result: @escaping FlutterResult) {
		if let frontCamera = CommonUtils.getParamByKey(call: call, result: result, param: "frontCamera") as? Bool{
			TRTCCloud.sharedInstance().startLocalPreview(frontCamera, view: self.remoteView);
			result(nil);
		}
	}

    public func updateLocalView(call: FlutterMethodCall, result: @escaping FlutterResult) {
        TRTCCloud.sharedInstance().updateLocalView(self.remoteView);
        result(nil);
    }

    public func updateRemoteView(call: FlutterMethodCall, result: @escaping FlutterResult) {
		if let userId = CommonUtils.getParamByKey(call: call, result: result, param: "userId") as? String, 
			let streamType = CommonUtils.getParamByKey(call: call, result: result, param: "streamType") as? Int {
            TRTCCloud.sharedInstance().updateRemoteView(self.remoteView, streamType: TRTCVideoStreamType(rawValue: streamType)!, forUser: userId);
			result(nil);
		}
    }
}
