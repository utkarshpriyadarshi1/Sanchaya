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
function runCommand(command, args, cwd, env = {}) {
  console.log(`\n> Running: ${command} ${args.join(' ')} (in ${cwd})`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env }
  });
  if (result.status !== 0) {
    console.error(`\n[ERROR] Command failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('===================================================');
console.log('       e-Patra Cross-Platform Build Runner         ');
console.log('===================================================');
console.log(`Platform: ${os.platform()} (${os.arch()})`);
console.log(`Workspace Root: ${rootDir}`);

// 1. Verify Prerequisites
console.log('\nChecking system prerequisites...');
const prerequisites = ['node', 'npm', 'cargo'];
let missingPrereqs = 0;
for (const req of prerequisites) {
  if (commandExists(req)) {
    console.log(`  - ${req}: Available`);
  } else {
    console.warn(`  - [WARNING] ${req} was not found in your PATH. Compilation might fail.`);
    missingPrereqs++;
  }
}

// 2. Resolve Maven command
let mavenCmd = 'mvn';
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
      console.warn('  - mvn: Not found in PATH or standard wrapper location.');
    }
  } else {
    console.log('  - mvn: Available');
  }
} else {
  if (!commandExists('mvn')) {
    const localMvnw = path.join(rootDir, 'backend', 'mvnw');
    if (fs.existsSync(localMvnw)) {
      mavenCmd = localMvnw;
    } else {
      console.warn('  - mvn: Not found in PATH or backend wrapper directory.');
    }
  } else {
    console.log('  - mvn: Available');
  }
}

// 3. Package Backend Service
console.log('\n[1/3] Packaging Backend Service (Spring Boot Jar)...');
runCommand(mavenCmd, ['-f', path.join('backend', 'pom.xml'), 'clean', 'package'], rootDir);

// 4. Bump Frontend Build Version
console.log('\n[2/3] Bumping Frontend Version...');
const frontendDir = path.join(rootDir, 'frontend');
if (fs.existsSync(path.join(frontendDir, 'bump-version.cjs'))) {
  runCommand('node', ['bump-version.cjs'], frontendDir);
} else {
  console.warn('[WARNING] bump-version.cjs not found in frontend directory. Skipping version bump.');
}

// 5. Build Tauri Standalone Application
console.log('\n[3/3] Compiling Frontend Client (Tauri Standalone App)...');

// Clean Rust build cache to avoid file locking issues on subsequent builds
const cargoTomlDir = path.join(frontendDir, 'src-tauri');
if (fs.existsSync(cargoTomlDir)) {
  console.log('Cleaning Rust cargo compile cache...');
  runCommand('cargo', ['clean'], cargoTomlDir);
}

// Ensure dependencies are installed in frontend
console.log('Installing frontend dependencies...');
runCommand('npm', ['install'], frontendDir);

// Build Tauri app (limiting parallel compilation threads to 2 and increasing compiler thread stack size to avoid crashes)
const extraEnv = { CARGO_BUILD_JOBS: '2', RUST_MIN_STACK: '16777216' };
console.log('Building Tauri release application...');
runCommand('npm', ['run', 'tauri', 'build'], frontendDir, extraEnv);

console.log('\n===================================================');
console.log('     [SUCCESS] Production build completed!         ');
console.log('===================================================');
console.log(`Backend Jar: backend/target/e-patra-1.0-SNAPSHOT.jar`);
console.log(`Frontend Standalone App: frontend/src-tauri/target/release/`);
console.log('===================================================\n');
process.exit(0);
