# sbucalabuca
web-site: https://sbuca-6248d.firebaseapp.com/

Firebase database rules:
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "images":{
      ".indexOn": "user"
    }
  }
}
