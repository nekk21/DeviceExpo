import { Buffer } from 'buffer';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

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
  let stringData = `DrivingType: ${data.time}\n`;

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

export const shareFile = async fileName => {
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  try {
    const shareResponse = await Share.open({
      url: `file://${path}`,
      title: 'Share Accelerometer Data',
      message: 'Share Accelerometer Data To get data',
      type: 'text/csv', //plain
    });
    console.log('Share Response:', shareResponse);
  } catch (error) {
    console.log('Error:', error);
  }
};

//transform to text data
export const transformDataAndSaveToFile = async file => {
  try {
    const accelData = await readDataFromFile(`/${file}`);

    if (accelData.length) {
      const allX = accelData.flatMap(packet => packet.accelerometerData.map(accel => accel.x.toFixed(3))).join(',');

      const allY = accelData.flatMap(packet => packet.accelerometerData.map(accel => accel.y.toFixed(3))).join(',');

      const allZ = accelData.flatMap(packet => packet.accelerometerData.map(accel => accel.z.toFixed(3))).join(',');

      const dataToWrite = `allX ${allX}\nallY ${allY}\nallZ ${allZ}`;

      const modifiedFilePath = `${RNFS.DocumentDirectoryPath}/Modified${file}`;

      await RNFS.writeFile(modifiedFilePath, dataToWrite, 'utf8');
      console.log('Success', modifiedFilePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

export const convertDataToCSVAndSave = async (file: string) => {
  try {
    const accelData = await readDataFromFile(`/${file}`);

    const onlyName = file.split('.')[0];

    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += 'DrivingType,X,Y,Z\n';

    accelData.forEach(packet => {
      packet.accelerometerData.forEach(accel => {
        const row = `${packet.timestamp},${accel.x.toFixed(3)},${accel.y.toFixed(3)},${accel.z.toFixed(3)}`;
        csvContent += row + '\n';
      });
    });

    const filePath = `${RNFS.DocumentDirectoryPath}/${onlyName}.csv`;
    await RNFS.writeFile(filePath, csvContent, 'utf8');

    console.log('CSV created:', filePath);
  } catch (error) {
    console.error('CSV ERROR:', error);
  }
};
