$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
if (Test-Path -LiteralPath $dist) { Remove-Item -LiteralPath $dist -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dist | Out-Null
Copy-Item -LiteralPath (Join-Path $root "styles.css") -Destination $dist
Copy-Item -LiteralPath (Join-Path $root "app.js") -Destination $dist
Copy-Item -LiteralPath (Join-Path $root "content") -Destination $dist -Recurse
Copy-Item -LiteralPath (Join-Path $root "assets") -Destination $dist -Recurse
Copy-Item -LiteralPath (Join-Path $root "src") -Destination $dist -Recurse
New-Item -ItemType Directory -Force -Path (Join-Path $dist ".openai") | Out-Null
Copy-Item -LiteralPath (Join-Path $root ".openai\hosting.json") -Destination (Join-Path $dist ".openai\hosting.json")

# index.html 模板统一使用绝对路径书写；构建时改写为相对路径，
# 根页面用 ./，子路由页面用 ../，使站点可部署在任意子路径下
$template = Get-Content -LiteralPath (Join-Path $root "index.html") -Raw -Encoding UTF8
$rootHtml = $template -replace '(href|src)="/', '$1="'
Set-Content -LiteralPath (Join-Path $dist "index.html") -Value $rootHtml -NoNewline -Encoding UTF8

$routes = @("guides", "rag", "toumanfen", "ml-dl-nlp")
foreach ($route in $routes) {
  $routeDir = Join-Path $dist $route
  New-Item -ItemType Directory -Force -Path $routeDir | Out-Null
  $routeHtml = $template -replace '(href|src)="/', '$1="../'
  Set-Content -LiteralPath (Join-Path $routeDir "index.html") -Value $routeHtml -NoNewline -Encoding UTF8
}

# RAG 栏目：完整课件站（mkdocs 静态站，内部全是相对链接）铺到 dist/rag/，
# 覆盖上面写入的 SPA 模板页，访问 /rag/ 直接呈现课件首页
$courseware = Join-Path $root "courseware"
if (Test-Path -LiteralPath $courseware) {
  Copy-Item -Path (Join-Path $courseware "*") -Destination (Join-Path $dist "rag") -Recurse -Force
}

