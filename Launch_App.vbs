Set WshShell = CreateObject("WScript.Shell")
' Start the Node.js server silently
WshShell.Run "cmd /c node server.js", 0, False

' Wait 2 seconds for server to start
WScript.Sleep 2000

' Open the app in the default browser
' (Ideally, the user will "Install" it from here once)
WshShell.Run "http://localhost:3000", 1, False
