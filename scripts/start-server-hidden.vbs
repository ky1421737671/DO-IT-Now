Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
rootDir = fso.GetParentFolderName(scriptDir)

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = rootDir
shell.Run "cmd.exe /c node scripts\serve-dist.mjs", 0, False
