import { exec } from 'child_process';
import os from 'os';

const isWindows = os.platform() === 'win32';
const killCommand = isWindows ? 'taskkill /F /IM node.exe' : 'pkill node';

// Kill existing Node processes
exec(killCommand, (error) => {
  if (error) {
    console.log('No existing Node processes to kill');
  } else {
    console.log('Killed existing Node processes');
  }

  // Start the development server
  const npm = isWindows ? 'npm.cmd' : 'npm';
  const devProcess = exec(`${npm} run dev`);

  devProcess.stdout.on('data', (data) => {
    console.log(data);
  });

  devProcess.stderr.on('data', (data) => {
    console.error(data);
  });
});
