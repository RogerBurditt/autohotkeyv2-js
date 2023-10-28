#NoTrayIcon
A_MenuMaskKey := "vkE8"
#UseHook
SendMode "Event"
CoordMode("Pixel", "Screen")
CoordMode("Mouse", "Screen")

stdin := FileOpen("*", "r `n")
stdout := FileOpen("*", "w `n")

write(x) {
  global stdout
  stdout.Write(x)
  stdout.Read(0)
}

initVars := "
(
  {
    "width": "A_ScreenWidth",
    "height": "A_ScreenHeight"
  }
)"

write(initVars)

SetWorkingDir(RTrim(stdin.ReadLine(), "`n"))

Loop{
  x := RTrim(stdin.ReadLine(), "`n")
  data := StrSplit(x, ";")

  ;;/////////////////////////////////////////////////////////
  ;;// MOUSE INTERACTIONS
  ;;/////////////////////////////////////////////////////////
  ;; setMouseSpeed, mouseMove, click, clickPlay, getMousePos

  if (data[1] = "setMouseSpeed") {
    SetDefaultMouseSpeed(data[2])
    write("done")
  }

  else if (data[1] = "mouseMove") {
    MouseMove(data[2], data[3], data[4])
    write("done")
  }

  else if (data[1] = "mouseClickDrag") {
    MouseClickDrag(data[2], data[3], data[4], data[5], data[6], data[7])
    write("done")
  }

  else if (data[1] = "click") {
    SetMouseDelay(data[3])
    Click(data[2])
    write("done")
  } 
  
  else if (data[1] = "clickPlay") {
    SendPlay("{{}Click " data[2] "{}}")
    write("done")
  }

  else if (data[1] = "getMousePos") {
    MouseGetPos(&x, &y)
    write(x " " y)
  }

  ;;/////////////////////////////////////////////////////////
  ;;// KEYBOARD INTERACTIONS
  ;;/////////////////////////////////////////////////////////
  ;; setKeyDelay, send, sendInput, sendPlay

  else if (data[1] = "setKeyDelay") {
    SetKeyDelay(data[2], data[3], data[4])
    write("done")
  } 
  
  else if (data[1] = "send") {
    Send(data[2])
    write("done")
  } 
  
  else if (data[1] = "sendInput") {
    SendInput(data[2])
    write("done")
  } 
  
  else if (data[1] = "sendPlay") {
    SendPlay(data[2])
    write("done")
  }


  ;;/////////////////////////////////////////////////////////
  ;;// WINDOW INTERACTIONS
  ;;/////////////////////////////////////////////////////////
  ;; winGetClientPos, winExist, winActivate

  else if (data[1] = "winGetClientPos"){
    WinGetClientPos &x, &y, &w, &h, data[2]
    write("done")
  } 
  
  else if (data[1] = "winExist"){
    write(WinExist(data[2]))
  } 
  
  else if (data[1] = "winActivate"){
    if WinExist(data[2]){
        try write(WinActivate(data[2]))
        catch Any
        write("done")
    }
  }


  ;;/////////////////////////////////////////////////////////
  ;;// SCREEN INTERACTIONS
  ;;/////////////////////////////////////////////////////////
  ;; getPixelColor, pixelSearch, imageSearch

  else if (data[1] = "getPixelColor") {
    color := PixelGetColor(data[2], data[3], data[4]) ;V1toV2: Switched from BGR to RGB values
    write(color)
  }

  else if (data[1] = "pixelSearch") {
    ErrorLevel := !PixelSearch(&x, &y, data[2], data[3], data[4], data[5], data[6], [data[7], "Fast RGB"]) ;V1toV2: Switched from BGR to RGB values
    write(x " " y)
  }

  else if (data[1] = "imageSearch") {
    ErrorLevel := !ImageSearch(&x, &y, data[2], data[3], data[4], data[5], data[6])
    write(x " " y)
  }




  ;;/////////////////////////////////////////////////////////
  ;;// OS INTERACTIONS
  ;;/////////////////////////////////////////////////////////
  ;; runProgram, msgBox, clipboard

  else if (data[1] = "runProgram") {
    try Run data[2]
    catch Any
    write("done")
  }

  else if (data[1] = "msgBox"){
    write(MsgBox(data[2], data[3], data[4]))
  }

  else if (data[1] = "getClipboard") {
    write(A_Clipboard)
  } 
  
  else if (data[1] = "setClipboard") {
    A_Clipboard := data[2]
    write("done")
  }
}