(Get-Content .\d4dj\import\index.html) `
    -replace '<base href="/" />', '<base href="/d4dj/import/" />' `
    -replace '_framework', 'framework' |
    Out-File .\d4dj\import\index.html

Rename-Item .\d4dj\import\_framework "framework"
Rename-Item .\d4dj\import\framework\_bin "bin"
(Get-Content .\d4dj\import\framework\blazor.webassembly.js) `
    -replace '_framework', 'framework' `
    -replace '_bin', 'bin' |
    Out-File .\d4dj\import\framework\blazor.webassembly.js