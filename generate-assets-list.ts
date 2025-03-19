async function getFilesInDirectory(dir: string, excludeDirs: string[]): Promise<string[]> {
  const files: string[] = []

  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`

    if (entry.isFile) {
      files.push(entry.name)
    } else if (entry.isDirectory) {
      if (!excludeDirs.includes(entry.name)) {
        const subFiles = await getFilesInDirectory(fullPath, excludeDirs)
        files.push(...subFiles.map((file) => `${entry.name}/${file}`))
      }
    }
  }

  return files
}

async function generateAssetsJson() {
  const assetsDir = "./src/assets"
  const outputJsonFile = "./src/assets-list.json"
  const outputTsFile = "./src/assets-list.ts"
  const excludeDirs = ["fonts", "data"]

  try {
    const files = await getFilesInDirectory(assetsDir, excludeDirs)

    await Deno.writeTextFile(outputJsonFile, JSON.stringify(files, null, 2))
    console.log(`✅ The file list has been generated ${outputJsonFile}`)

    const enumContent = generateEnumContent(files)
    await Deno.writeTextFile(outputTsFile, enumContent)
    console.log(`✅ TypeScript enum file has been generated to ${outputTsFile}`)
  } catch (error) {
    console.error(`❌ Failed to generate file list: ${error.message}`)
  }
}

function generateEnumContent(files: string[]): string {
  let enumContent = ""
  enumContent += "export type Assets ="
  files.forEach((name, index) => {
    enumContent += ` | "${name.split(".")[0]}"`
  })

  return enumContent
}

generateAssetsJson()
