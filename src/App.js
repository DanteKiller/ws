import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const { response } = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var CryptoJS = require("crypto-js");

const db = mysql.createPool({
  host: "mysql.mysystem.net.br",
  user: "mysystem07",
  password: "my2005",
  database: "mysystem07",
});

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "ws",
// });

app.use(express.json());
app.use(cors());

function EncryptPass(password) {
  return CryptoJS.AES.encrypt(JSON.stringify(password), '#MySystem@2022').toString();
}

function DencryptPass(password) {
  var bytes = CryptoJS.AES.decrypt(password, '#MySystem@2022');
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

app.post('/register', (req, res) => {
  const email = req.body.email;
  const pass = req.body.pass;

  db.query("SELECT * FROM usuarios WHERE email= ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      //CryptoJS.AES.encrypt(JSON.stringify(pass), '#MySystem@2022').toString();

      bcrypt.hash(pass, saltRounds, (err, hash) => {
        db.query("INSERT INTO usuarios (email, pass, status) VALUES (?, ?, ?)", [email, hash, true],
          (err, response) => {
            if (err) {
              console.log(err);
            }
            res.send({ msg: "Cadastrado com sucesso!" });
          });
      });
    } else {
      res.send({ msg: "Usuário já cadastrado!" });
    }
  });
});

app.post('/login', (req, res) => {

  const email = req.body.email;
  const pass = req.body.pass;

  db.query("SELECT * FROM usuarios WHERE email= ? and pass= ?",
    [email, pass], (err, result) => {
      if (err) {
        res.send(err);
      }
      if (result.length > 0) {
        if (!result[0].status) {
          res.send({ msg: "Usuário bloqueado!" });
        }
        bcrypt.compare(pass, result[0].pass, (err, result) => {
          if (result) {
            res.send({ msg: "Usuário logado com sucesso!", enter: true });
          } else {
            res.send({ msg: "Usuário ou senha incorreta!", enter: false });
          }
        });
      } else {
        res.send({ msg: "Usuário ou senha incorreta!", enter: false });
      }
    });
});

app.post('/logar', (req, res) => {

  const email = req.body.email;
  const pass = req.body.pass;

  db.query("SELECT * FROM usuarios WHERE email= ?",
    [email], (err, result) => {
      if (err) {
        res.send({ err, enter: false });
      }
      if (result.length > 0) {
        if (!result[0].status) {
          res.send({ msg: "Usuário bloqueado!" });
        } else if (DencryptPass(result[0].pass) !== pass) {
          res.send({ msg: "Usuário ou senha incorreta!", enter: false });
        } else {
          res.send({ msg: "Usuário logado com sucesso!", enter: true });
        }
      } else {
        res.send({ msg: "Usuário ou senha incorreta!", enter: false });
      }
    });
});

app.post('/testelogar', (req, res) => {

  const email = req.body.email;
  const pass = DencryptPass(req.body.pass);

  db.query("SELECT * FROM usuarios WHERE email= ?",
    [email], (err, result) => {
      if (err) {
        res.send({ err, enter: false });
      }
      if (result.length > 0) {
        if (!result[0].status) {
          res.send({ msg: "Usuário bloqueado!" });
        } else if (DencryptPass(result[0].pass) !== pass) {
          res.send({ msg: "Usuário ou senha incorreta!", enter: false });
        } else {
          res.send({ msg: "Usuário logado com sucesso!", enter: true });
        }
      } else {
        res.send({ msg: "Usuário ou senha incorreta! " + pass, enter: false });
      }
    });
});

app.listen(3001, () => {
  console.log('Rodando na porta 3001');
})

const App = () => {
  const [message, setMessage] = useState('...loading')

  useEffect(() => {
    async function fetchData () {
      try {
        let data = await (await fetch('/api')).json()
        setMessage(data.message)
      } catch (err) {
        setMessage(err.message)
      }
    }
    fetchData()
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{message}</p>
        <p>Change me!</p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
