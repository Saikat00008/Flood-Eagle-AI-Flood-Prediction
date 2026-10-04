Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir

' Fast launcher: if Flood Eagle is already running, open it immediately.
If IsFloodEagleReady() Then
  sh.Run "http://localhost:8080", 1, False
  WScript.Quit
End If

' First start only: install dependencies if they are missing.
If Not fso.FolderExists(dir & "\node_modules") Then
  MsgBox "First start only: Flood Eagle needs to install its files. This can take a few minutes. After that, opening Flood Eagle will be much faster.", 64, "Flood Eagle"
  sh.Run "cmd /c cd /d """ & dir & """ && npm install --no-audit --no-fund --prefer-offline", 1, True
End If

' Start Vite directly instead of npm run dev to reduce startup overhead.
sh.Run "cmd /c cd /d """ & dir & """ && node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 8080", 0, False

' Wait only until the local server is ready, checking frequently.
For i = 1 To 150
  If IsFloodEagleReady() Then
    sh.Run "http://localhost:8080", 1, False
    WScript.Quit
  End If
  WScript.Sleep 100
Next

' Fallback: let the browser show the normal connection message if startup failed.
sh.Run "http://localhost:8080", 1, False

Function IsFloodEagleReady()
  IsFloodEagleReady = False
  On Error Resume Next
  Set http = CreateObject("MSXML2.ServerXMLHTTP")
  http.setTimeouts 150, 150, 150, 150
  http.Open "GET", "http://127.0.0.1:8080", False
  http.Send
  If Err.Number = 0 Then
    If http.Status >= 200 And http.Status < 500 Then IsFloodEagleReady = True
  End If
  Err.Clear
  On Error GoTo 0
End Function
