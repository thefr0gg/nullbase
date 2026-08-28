# Anti-spam verification: identity binding + rate limits (local dev API)
$ErrorActionPreference = "Continue"
$base = "http://localhost:8787/v1"

function New-GuidId { [guid]::NewGuid().ToString() }

# 1. Same visitor re-like -> deduped (liked:false)
$v1 = New-GuidId
$r1 = Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Headers @{ "X-Visitor-Id" = $v1 } -Body '{"page":"/anti-spam-test"}'
$r2 = Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Headers @{ "X-Visitor-Id" = $v1 } -Body '{"page":"/anti-spam-test"}'
Write-Host ("1 dedupe: 1st liked=" + $r1.liked + " 2nd liked=" + $r2.liked + " count=" + $r2.count)

# 2. Visitor rate limit: 11 likes from ONE visitor across different pages -> 10 ok, 11th -> 429
$v2 = New-GuidId
$lastStatus = $null
for ($i = 1; $i -le 11; $i++) {
  try {
    Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Headers @{ "X-Visitor-Id" = $v2 } -Body ('{"page":"/rl-visitor-' + $i + '"}') | Out-Null
    $lastStatus = 200
  }
  catch {
    $resp = $_.Exception.Response
    $lastStatus = $resp.StatusCode.value__
    break
  }
}
Write-Host ("2 visitor cap (expect 429 on 11th): last=" + $lastStatus)

# 3. IP rate limit: distinct visitors, same network -> 429 once ip cap (25/day) hit
$ip429 = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Headers @{ "X-Visitor-Id" = (New-GuidId) } -Body ('{"page":"/rl-ip-' + $i + '"}') | Out-Null
  }
  catch {
    $resp = $_.Exception.Response
    if ($resp.StatusCode.value__ -eq 429) {
      $ip429 = $true
      break
    }
  }
}
Write-Host ("3 ip cap hit: " + $ip429)

# 4. Feedback per-visitor hourly limit: same visitor -> 2 ok, 3rd -> 429
$v3 = New-GuidId
$h = @{ "X-Visitor-Id" = $v3; "Origin" = "http://localhost:3000" }
$f1 = $null
$f2 = $null
$f3 = $null
try { $f1 = (Invoke-RestMethod "$base/feedback" -Method Post -ContentType "application/json" -Headers $h -Body '{"page":"/x","rating":5,"comment":"a"}').id } catch { $f1 = "ERR" }
try { $f2 = (Invoke-RestMethod "$base/feedback" -Method Post -ContentType "application/json" -Headers $h -Body '{"page":"/y","rating":4,"comment":"b"}').id } catch { $f2 = "ERR" }
try { $f3 = (Invoke-RestMethod "$base/feedback" -Method Post -ContentType "application/json" -Headers $h -Body '{"page":"/z","rating":3,"comment":"c"}').id } catch { $f3 = $_.Exception.Response.StatusCode.value__ }
Write-Host ("4 feedback visitor cap: 1st=$f1 2nd=$f2 3rd=$f3 (expect ids then 429)")

# 5. 429 carries Retry-After
try {
  Invoke-RestMethod "$base/feedback" -Method Post -ContentType "application/json" -Headers $h -Body '{"page":"/x","comment":"d"}' | Out-Null
}
catch {
  $resp = $_.Exception.Response
  Write-Host ("5 429 retry-after: " + $resp.Headers["Retry-After"] + " (status " + $resp.StatusCode.value__ + ")")
}

# 6. Invalid visitor id treated as absent (still works, hashed from ip+ua)
try {
  $r6 = Invoke-RestMethod "$base/likes" -Method Post -ContentType "application/json" -Headers @{ "X-Visitor-Id" = "not-a-uuid" } -Body '{"page":"/anti-spam-no-header"}'
  Write-Host ("6 invalid visitor id handled: liked=" + $r6.liked + " count=" + $r6.count)
}
catch {
  Write-Host ("6 invalid visitor id failed: " + $_.Exception.Message)
}