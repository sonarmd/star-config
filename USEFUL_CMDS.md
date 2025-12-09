# Pipe your GH CLI token straight to the cli without dealing with shitty hand entered bs
gh auth login --with-token < <(op read "op://Developer/GH\ CLI/credential")
