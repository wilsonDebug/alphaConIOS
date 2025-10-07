# Android/Gradle 环境变量配置（PowerShell）
# 使用：
#   1) 在项目根目录执行：. .\android-env.ps1
#   2) 验证：gradle -v

# 临时生效（当前 PowerShell 会话）
$env:GRADLE_HOME = 'D:\tools\gradle\gradle-8.7'
$env:PATH = "$env:GRADLE_HOME\bin;$env:PATH"

# 可选：持久化为当前用户环境变量（取消注释执行一次）
# 注意：setx 修改 PATH 时不建议直接覆盖已有 PATH，谨慎使用！
# setx GRADLE_HOME "D:\tools\gradle\gradle-8.7"
# setx PATH "$env:GRADLE_HOME\bin;$env:PATH"

# 输出当前配置以便确认
Write-Host "GRADLE_HOME = $env:GRADLE_HOME"
Write-Host "PATH 前缀 = $env:GRADLE_HOME\bin"