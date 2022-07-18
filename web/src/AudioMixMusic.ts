import { LocalStream } from 'trtc-js-sdk';
import { logInfo } from './common/TXUntils';
import AudioMixerPlugin from 'rtc-audio-mixer';
export default class AudioMixMusic {
  private localStream: LocalStream;
  private lowMix: any;
  private already;
  constructor(localStream) {
    this.localStream = localStream;
    this.lowMix = null;
    this.already = [];
  }
  createMusic(url) {
    this.lowMix = AudioMixerPlugin.createAudioSource({
      url: url,
      volume: 0.2,
      loop: true,
    });
    this.lowMix.on('play', (event) => {
      logInfo('event: play' + event);
    });
    this.lowMix.on('end', (event) => {
      logInfo('event: end' + event);
    });
    this.lowMix.on('error', (event) => {
      logInfo('event: error' + event);
    });
  }

  addLowMix() {
    if (this.lowMix) {
      this.already.push(this.lowMix);
      logInfo('already mix' + this.already);
      const origin = this.localStream.getAudioTrack();
      const lowAudioTrack = AudioMixerPlugin.mix({
        targetTrack: origin,
        sourceList: this.already,
      });
      this.localStream.replaceTrack(lowAudioTrack);
      this.updateAlready();
    }
  }

  leaveRoom() {
    this.lowMixStop();
    this.lowMix = null;
  }

  lowMixStart() {
    this.lowMix && this.lowMix.play();
  }
  lowMixPause() {
    this.lowMix && this.lowMix.pause();
  }
  lowMixStop() {
    this.lowMix && this.lowMix.stop();
  }
  lowMixResume() {
    this.lowMix && this.lowMix.resume();
    this.lowMix && this.lowMix.play();
  }
  updateAlready() {
    logInfo('already mixed audio: ' + (this.already || []).length);
  }
}
