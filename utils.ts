import { Buffer } from 'buffer';
import RNFS from 'react-native-fs';

export const readFloat32 = (data, offset: number) => {
  const bytes = data
    .slice(offset, offset + 8)
    .match(/.{1,2}/g)
    .map(b => parseInt(b, 16));
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  bytes.forEach((byte, index) => view.setUint8(index, byte));
  return view.getFloat32(0, true);
};

export const base64ToHex = base64String => {
  const buffer = Buffer.from(base64String, 'base64');
  return buffer.toString('hex');
};

export const deleteAccelDataFile = async (filename: string) => {
  const path = RNFS.DocumentDirectoryPath + `/${filename}`;

  try {
    await RNFS.unlink(path);
    console.log('File deleted');
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};

export const writeAccelDataToFile = async (data, file) => {
  const path = RNFS.DocumentDirectoryPath + file;
  let stringData = `Time: ${data.time}\n`;

  data.accelerometerData.forEach(accel => {
    stringData += `X: ${accel.x.toFixed(3)}, Y: ${accel.y.toFixed(3)}, Z: ${accel.z.toFixed(3)}\n`;
  });

  stringData += '---\n';

  try {
    await RNFS.appendFile(path, stringData, 'utf8');
    console.log('Data written to file successfully');
  } catch (error) {
    console.error('Failed to write accel data to file:', error);
  }
};

export const readDataFromFile = async (file: string) => {
  const path = RNFS.DocumentDirectoryPath + file;

  try {
    const fileContents = await RNFS.readFile(path, 'utf8');
    const data = fileContents
      .trim()
      .split('---\n')
      .map(packet => {
        const lines = packet.split('\n').filter(line => line);
        const timestampLine = lines.shift();
        const timestamp = timestampLine.split(' ')[1];

        const accelerometerData = lines
          .map(line => {
            const parts = line.split(', ').map(measurement => {
              const split = measurement.split(': ');
              return split.length === 2 ? parseFloat(split[1]) : null;
            });
            if (parts.length === 3 && parts.every(part => part !== null)) {
              const [x, y, z] = parts;
              return { x, y, z };
            }
            return null;
          })
          .filter(accel => accel !== null);

        return { timestamp, accelerometerData };
      });

    return data;
  } catch (error) {
    console.error('Failed to read data from file:', error);
    return [];
  }
};
