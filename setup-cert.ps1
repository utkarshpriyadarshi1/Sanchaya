# setup-cert.ps1
# Automates Windows self-signed code signing certificate setup for Tauri packaging.

$ErrorActionPreference = "Stop"

# 1. Create certs directory if not exists
$certsDir = Join-Path $PSScriptRoot "certs"
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
    Write-Host "Created certs directory: $certsDir"
}

# 2. Check if certificate already exists in My store
Write-Host "Searching for existing e-Patra Code Signing certificate..."
$cert = Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object { $_.Subject -eq "CN=e-Patra Code Signing" } | Select-Object -First 1

if ($null -eq $cert) {
    Write-Host "No existing certificate found. Generating a new self-signed Code Signing certificate..."
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=e-Patra Code Signing" -KeyUsage DigitalSignature -FriendlyName "e-Patra Developer Cert" -CertStoreLocation "Cert:\CurrentUser\My"
    Write-Host "Successfully generated certificate with Thumbprint: $($cert.Thumbprint)"
} else {
    Write-Host "Found existing certificate with Thumbprint: $($cert.Thumbprint)"
}

# 3. Add to Trusted Root Certification Authorities to establish local trust
# Note: Commented out to prevent hanging on Windows GUI security prompts in non-interactive/headless environments.
# To establish local trust, users can manually import certs\developer.pfx into the Trusted Root Certification Authorities store.

# 4. Export certificate to certs\developer.pfx
$pfxPath = Join-Path $certsDir "developer.pfx"
$password = ConvertTo-SecureString "patra123" -AsPlainText -Force
Write-Host "Exporting certificate to $pfxPath..."
if (Test-Path $pfxPath) {
    Remove-Item $pfxPath -Force
}
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null
Write-Host "Successfully exported certificate PFX."

# 5. Update tauri.conf.json
$tauriConfPath = Join-Path $PSScriptRoot "frontend\src-tauri\tauri.conf.json"
if (Test-Path $tauriConfPath) {
    Write-Host "Updating tauri.conf.json with the certificate thumbprint..."
    $tauriConf = Get-Content -Raw -Path $tauriConfPath | ConvertFrom-Json
    
    if ($null -ne $tauriConf.tauri -and $null -ne $tauriConf.tauri.bundle) {
        if ($null -eq $tauriConf.tauri.bundle.windows) {
            $tauriConf.tauri.bundle | Add-Member -MemberType NoteProperty -Name "windows" -Value @{}
        }
        
        $tauriConf.tauri.bundle.windows.certificateThumbprint = $cert.Thumbprint
        $tauriConf.tauri.bundle.windows.digestAlgorithm = "sha256"
        $tauriConf.tauri.bundle.windows.timestampUrl = "http://timestamp.digicert.com"
        
        $jsonString = $tauriConf | ConvertTo-Json -Depth 100
        # ConvertTo-Json might escape characters or format slightly differently, let's write it cleanly
        [System.IO.File]::WriteAllText($tauriConfPath, $jsonString)
        Write-Host "Successfully updated tauri.conf.json with windows code signing properties."
    } else {
        Write-Error "Could not locate tauri.bundle node in tauri.conf.json"
    }
} else {
    Write-Warning "tauri.conf.json not found at $tauriConfPath. Skipping JSON auto-update."
}

Write-Host "e-Patra certificate configuration completed successfully!"
