const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');

// Helper to check if a command exists in the system PATH
function commandExists(cmd) {
  const checkCmd = os.platform() === 'win32' ? 'where' : 'which';
  const result = spawnSync(checkCmd, [cmd], { shell: true });
  return result.status === 0;
}

// Helper to execute a command with inherited stdio
function runCommand(command, args, cwd) {
  console.log(`> Running: ${command} ${args.join(' ')} (in ${cwd})`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  return result.status === 0;
}

console.log('===================================================');
console.log('       e-Patra Cross-Platform Clean Workspace      ');
console.log('===================================================');

// 1. Resolve Maven command
let mavenCmd = 'mvn';
let mavenFound = true;
if (os.platform() === 'win32') {
  if (!commandExists('mvn')) {
    const homeDir = os.homedir();
    const potentialM2Wrapper = path.join(
      homeDir,
      '.m2',
      'wrapper',
      'dists',
      'apache-maven-3.9.6-bin',
      '3311e1d4',
      'apache-maven-3.9.6',
      'bin',
      'mvn.cmd'
    );
    if (fs.existsSync(potentialM2Wrapper)) {
      mavenCmd = potentialM2Wrapper;
    } else {
      mavenFound = false;
    }
  }
} else {
  if (!commandExists('mvn')) {
    const localMvnw = path.join(rootDir, 'backend', 'mvnw');
    if (fs.existsSync(localMvnw)) {
      mavenCmd = localMvnw;
    } else {
      mavenFound = false;
    }
  }
}

// 2. Clean Backend Target
if (mavenFound) {
  console.log('\nCleaning backend target directory...');
  runCommand(mavenCmd, ['-f', path.join('backend', 'pom.xml'), 'clean'], rootDir);
} else {
  console.warn('\n[WARNING] Maven command not found. Skipping backend clean...');
}

// 3. Clean Frontend Cargo Target
const cargoTomlDir = path.join(rootDir, 'frontend', 'src-tauri');
if (fs.existsSync(cargoTomlDir)) {
  console.log('\nCleaning frontend Cargo directory...');
  if (commandExists('cargo')) {
    runCommand('cargo', ['clean'], cargoTomlDir);
  } else {
    console.warn('[WARNING] Cargo not found. Skipping Cargo clean...');
  }
}

console.log('\n===================================================');
console.log('       [SUCCESS] Workspace clean completed!        ');
console.log('===================================================\n');
process.exit(0);
