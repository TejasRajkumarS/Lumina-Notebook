export function createWavBlob(base64Data: string): Blob {
  const binaryString = atob(base64Data);
  const pcmData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmData[i] = binaryString.charCodeAt(i);
  }

  const pcmLength = pcmData.length;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmLength, true); // file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // format chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // size of fmt chunk
  view.setUint16(20, 1, true); // compression code (1 = PCM)
  view.setUint16(22, 1, true); // channels (1 = Mono)
  view.setUint32(24, 24000, true); // sample rate
  view.setUint32(28, 24000 * 2, true); // byte rate (SampleRate * Channels * BitsPerSample / 8)
  view.setUint16(32, 2, true); // block align (Channels * BitsPerSample / 8)
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmLength, true); // size of data chunk

  return new Blob([header, pcmData], { type: 'audio/wav' });
}
