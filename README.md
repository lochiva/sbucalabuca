# sbucalabuca
web-site: https://iotaapp-da647.firebaseapp.com/

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
