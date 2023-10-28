#NoTrayIcon
stdout := FileOpen("*", "w `n")

write(x) {
  global stdout
  stdout.Write(x)
  stdout.Read(0)
}
~Esc:: write("Esc")
