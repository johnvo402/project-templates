param(
    [Parameter(Mandatory = $true)]
    [string] $ProjectRoot
)

$resolvedRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$repositoryFiles = Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File |
    Where-Object { $_.Name -in @('EfRepository.cs', 'EfReadRepository.cs') }

if ($repositoryFiles.Count -ne 2) {
    throw "Expected exactly two generated EF repository files under '$resolvedRoot'; found $($repositoryFiles.Count)."
}

$expectedDeclarations = @{
    'EfRepository.cs' = 'internal\s+sealed\s+class\s+EfRepository<TEntity>\s*\('
    'EfReadRepository.cs' = 'internal\s+sealed\s+class\s+EfReadRepository<TEntity>\s*\('
}

foreach ($repositoryFile in $repositoryFiles) {
    $source = Get-Content -LiteralPath $repositoryFile.FullName -Raw
    $expectedDeclaration = $expectedDeclarations[$repositoryFile.Name]

    if ($source -notmatch $expectedDeclaration) {
        throw "'$($repositoryFile.FullName)' does not declare its TEntity generic type parameter."
    }

    if ($source -match 'internal\s+sealed\s+class\s+Ef(?:Read)?Repository\s*\(') {
        throw "'$($repositoryFile.FullName)' contains the malformed non-generic repository declaration."
    }
}

Write-Host "Generated repository declarations are generic in '$resolvedRoot'."
