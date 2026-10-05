$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
$VerbosePreference = 'SilentlyContinue'
$InformationPreference = 'SilentlyContinue'
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$stage = 'STDIN'
try {
    # stdin only. Never echo input or exception details.
    $requestText = [Console]::In.ReadToEnd()
    if ([Text.Encoding]::UTF8.GetByteCount($requestText) -gt 65536) { throw 'input limit' }
    $stage = 'INPUT_PARSE'
    # PowerShell 7.5+ otherwise converts ISO timestamp header strings to DateTime.
    # Keep the timestamp byte-for-byte identical to the value signed in Node.
    $request = ConvertFrom-Json -InputObject $requestText -AsHashtable -DateKind String
    $stage = 'INPUT_VALIDATE'
    if ($request.url -isnot [string] -or $request.method -notin @('GET', 'POST') -or $request.body -isnot [string]) { throw 'request shape' }
    $uri = [Uri]::new($request.url)
    $allowedPath = '^/build/api/v1/dex/(market/rwa/(tokens|price|underlying-profile|underlying-market)|aggregator/(quote|swap)|pre-transaction/simulate)$'
    if ($uri.Scheme -ne 'https' -or $uri.Host -ne 'web3.binance.com' -or $uri.Port -ne 443 -or $uri.UserInfo -or $uri.Fragment -or $uri.AbsolutePath -notmatch $allowedPath) { throw 'endpoint denied' }
    # Verify .NET will send the exact encoded path/query that Node signed. Do not rebuild query params.
    if ($request.url -cne ('https://web3.binance.com' + $uri.PathAndQuery)) { throw 'wire encoding changed' }
    if ($request.method -eq 'GET' -and $request.body) { throw 'GET body denied' }
    $stage = 'REQUEST_HEADERS'
    $headerNames = @('x-oc-apikey', 'x-oc-timestamp', 'x-oc-sign', 'x-oc-nonce', 'content-type')
    $headers = @{}
    foreach ($entry in $request.headers.GetEnumerator()) {
        if ($entry.Key.ToLowerInvariant() -notin $headerNames -or $entry.Value -isnot [string]) { throw 'header denied' }
        $headers[$entry.Key] = $entry.Value
    }
    $arguments = @{ Uri = $request.url; Method = $request.method; Headers = $headers; TimeoutSec = 8; MaximumRedirection = 0; SkipHttpErrorCheck = $true; ErrorAction = 'Stop' }
    if ($request.method -eq 'POST') { $arguments.Body = [Text.Encoding]::UTF8.GetBytes($request.body) }
    # Use the installed Windows PowerShell/.NET network stack; keep its normal TLS and network policy.
    $stage = 'HTTP_REQUEST'
    $response = Invoke-WebRequest @arguments
    $stage = 'RESPONSE_BODY'
    $body = if ($response.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($response.Content) } else { [string]$response.Content }
    if ([Text.Encoding]::UTF8.GetByteCount($body) -gt 1048576) { throw 'response limit' }
    $stage = 'RESPONSE_HEADERS'
    $responseHeaders = @{}
    foreach ($name in @('Content-Type', 'Retry-After', 'Content-Length')) {
        if ($response.Headers.ContainsKey($name)) { $responseHeaders[$name.ToLowerInvariant()] = [string]::Join(', ', $response.Headers[$name]) }
    }
    $stage = 'RESPONSE_SERIALIZE'
    $output = @{ status = [int]$response.StatusCode; headers = $responseHeaders; body = $body } | ConvertTo-Json -Depth 4 -Compress
    if ([Text.Encoding]::UTF8.GetByteCount($output) -gt 1048576) { throw 'protocol response limit' }
    [Console]::Out.Write($output)
    exit 0
} catch {
    # Generic stderr cannot leak credentials, signed query details or underlying exception messages.
    [Console]::Error.Write('WINDOWS_NATIVE_TRANSPORT_FAILED_' + $stage)
    exit 1
}
