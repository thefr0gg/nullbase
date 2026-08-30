# Live API smoke test (local dev server on better-sqlite3)
$ErrorActionPreference = "Continue"
$base = "http://localhost:8787/v1"
$frontend = @{ Origin = "http://localhost:3000" }

# 1 health
Write-Host ("1 health: " + (Invoke-RestMethod "$base/health" -TimeoutSec 10 | ConvertTo-Json -Compress))

# 2 wrong password -> 401
try {
  Invoke-RestMethod "$base/admin/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@nullbase.wiki","password":"WRONG"}' -TimeoutSec 10 | Out-Null
  Write-Host "2 wrong pw: FAIL (no 401)"
} catch { Write-Host ("2 wrong pw -> " + $_.Exception.Response.StatusCode.value__) }

# 3 correct login -> access token + httpOnly refresh cookie
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$login = Invoke-RestMethod "$base/admin/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@nullbase.wiki","password":"test-password-123"}' -WebSession $session -TimeoutSec 10
Write-Host ("3 login: " + ($login.admin | ConvertTo-Json -Compress))
$auth = @{ Authorization = "Bearer $($login.accessToken)" }

# 4 /admin/me without and with token
try {
  Invoke-WebRequest "$base/admin/me" -TimeoutSec 10 | Out-Null
  Write-Host "4 me no-token: FAIL"
} catch { Write-Host ("4 me no-token -> " + $_.Exception.Response.StatusCode.value__) }
Write-Host ("4 me with-token: " + (Invoke-RestMethod "$base/admin/me" -Headers $auth -TimeoutSec 10 | ConvertTo-Json -Compress))

# 5 public feedback: valid + invalid
Write-Host ("5 feedback post: " + (Invoke-RestMethod "$base/feedback" -Method Post -ContentType "application/json" -Headers $frontend -Body '{"page":"/http","rating":4}' -TimeoutSec 10 | ConvertTo-Json -Compress))
try {
  Invoke-WebRequest "$base/feedback" -Method Post -ContentType "application/json" -Body '{"page":"/http"}' -TimeoutSec 10 | Out-Null
  Write-Host "5 feedback invalid: FAIL"
} catch { Write-Host ("5 feedback invalid -> " + $_.Exception.Response.StatusCode.value__) }

# 6 admin list
$list = Invoke-RestMethod "$base/admin/feedback" -Headers $auth -TimeoutSec 10
Write-Host ("6 admin list: " + $list.total + " total")

# 7 patch status
Invoke-RestMethod "$base/admin/feedback/1" -Method Patch -ContentType "application/json" -Headers $auth -Body '{"status":"resolved"}' -TimeoutSec 10 | Out-Null
Write-Host "7 patch: ok"

# 8-9 likes: count, first like, dedupe
Write-Host ("8 likes count: " + (Invoke-RestMethod "$base/likes?page=/http" -TimeoutSec 10 | ConvertTo-Json -Compress))
Write-Host ("9 like 1st: " + (Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Body '{"page":"/http"}' -TimeoutSec 10 | ConvertTo-Json -Compress))
Write-Host ("9 like 2nd: " + (Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Body '{"page":"/http"}' -TimeoutSec 10 | ConvertTo-Json -Compress))

# 10 CORS
$allowed = (Invoke-WebRequest "$base/health" -Headers $frontend -TimeoutSec 10).Headers["access-control-allow-origin"]
$blocked = (Invoke-WebRequest "$base/health" -Headers @{ Origin = "https://evil.example" } -TimeoutSec 10).Headers["access-control-allow-origin"]
Write-Host "10 cors allowed-origin header: $allowed"
Write-Host "10 cors blocked-origin header: [$blocked]"

# 11 admin likes list
Write-Host ("11 admin likes: " + (Invoke-RestMethod "$base/admin/likes" -Headers $auth -TimeoutSec 10 | ConvertTo-Json -Compress))

# 12 sessions: list (should include the current one), then refresh rotates it
$sessions = Invoke-RestMethod "$base/admin/sessions" -Headers $auth -WebSession $session -TimeoutSec 10
Write-Host ("12 sessions: " + $sessions.items.Count + " active")

# 13 refresh -> new access token, old refresh token rotated away
$refreshed = Invoke-RestMethod "$base/admin/refresh" -Method Post -WebSession $session -TimeoutSec 10
Write-Host ("13 refresh: got new accessToken -> " + [bool]$refreshed.accessToken)

# 14 logout -> refresh cookie revoked, a second refresh attempt 401s
Invoke-RestMethod "$base/admin/logout" -Method Post -WebSession $session -TimeoutSec 10 | Out-Null
try {
  Invoke-WebRequest "$base/admin/refresh" -Method Post -WebSession $session -TimeoutSec 10 | Out-Null
  Write-Host "14 logout: FAIL (refresh still works)"
} catch { Write-Host ("14 logout -> post-logout refresh: " + $_.Exception.Response.StatusCode.value__) }