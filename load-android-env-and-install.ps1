# 加载 andriod_env.env 并安装 APK 到 Android 模拟器
$ErrorActionPreference = 'Stop'
$envFile = 'andriod_env.env'
if (!(Test-Path $envFile)) { Write-Error "andriod_env.env 不存在"; exit 1 }

function Get-Val($key) {
  $line = Select-String -Path $envFile -Pattern ("^" + [regex]::Escape($key) + "=") | Select-Object -First 1
  if ($null -eq $line) { return $null }
  return $line.Line.Split('=')[1]
}

$env:GRADLE_HOME = Get-Val 'GRADLE_HOME'
$env:ANDROID_SDK_ROOT = Get-Val 'ANDROID_SDK_ROOT'
$env:ANDROID_HOME = $env:ANDROID_SDK_ROOT
$pathAppend = Get-Val 'PATH_APPEND'
if ($pathAppend) { $env:PATH = $pathAppend + ';' + $env:PATH }

$apk = "D:\gitProjects\alphaCon\MobileAppUnified\android\app\build\outputs\apk\release\app-release.apk"
if (!(Test-Path $apk)) { Write-Error "APK 未找到: $apk"; exit 1 }

$adb = Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe"
$emu = Join-Path $env:ANDROID_SDK_ROOT "emulator\emulator.exe"
if (!(Test-Path $adb)) { Write-Error "未找到 adb: $adb"; exit 1 }
& $adb start-server

# 检测设备，如无则启动首个 AVD
$devicesReady = (& $adb devices) -match "device`$"
if (-not $devicesReady) {
  if (!(Test-Path $emu)) { Write-Error "未找到 emulator: $emu"; exit 1 }
  $avds = & $emu -list-avds
  if (-not $avds) { Write-Error "未检测到任何 AVD，请在 Android Studio 创建模拟器"; exit 1 }
  $first = ($avds | Select-Object -First 1)
  Write-Host "启动模拟器: $first"
  Start-Process -FilePath $emu -ArgumentList ("-avd $first") -WindowStyle Normal
  # 等待模拟器就绪
  $maxWait = 24; $i = 0
  do { Start-Sleep -Seconds 5; $devicesReady = (& $adb devices) -match "device`$"; $i++ } while (-not $devicesReady -and $i -lt $maxWait)
}
if (-not $devicesReady) { Write-Error "设备未就绪，请手动启动 AVD 后再试"; exit 1 }

Write-Host "安装 APK 到设备..."
# 如果安装失败可尝试先卸载旧包：& $adb uninstall com.mobileappunified  （请按实际包名修改）
& $adb install -r $apk