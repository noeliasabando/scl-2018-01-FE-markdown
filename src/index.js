#!/usr/bin/env node

//index.js: Desde este archivo debes exportar una función (mdLinks).
const Path = require("path")
const Marked = require("marked");
const fs = require("fs");
const fetch = require('node-fetch');

exports.mdLinks = function (path, options) {
  const promise = new Promise(function (resolve, reject) {

    fs.readFile(path, "utf8", function read(err, data) {
      if (err) {
        reject("Hubo un error al leer archivo");
        throw err
      }

      var links = markdownLinkExtractor(data);
      var linksOk = [];
      
      links.forEach((link) => {
        fetch(link.href).then((response) => {        
          linksOk.push({
            href: link.href,
            text: link.text,
            file: Path.resolve(path),
            status: response.status,
            ok: response.ok,
          })
          if(linksOk.length=== links.length){
            resolve(linksOk);
          }
        }).catch((error)=>{  
          console.log(error)    
          linksOk.push({
            href: link.href,
            text: link.text,
            file: Path.resolve(path),
            status: "Url no existe",
            ok: "Url no existe",
          })
          if(linksOk.length=== links.length){
            resolve(linksOk);
          }
        }); 
      })
    });
  });
  return promise;
};



// Función necesaria para extraer los links usando marked
// Recibe texto en markdown y retorna sus links en un arreglo
function markdownLinkExtractor(markdown) {
  const links = [];

  const renderer = new Marked.Renderer();

  const linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;

  Marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;

  renderer.link = function (href, title, text) {
    links.push({
      href: href,
      text: text,
    });
  };
  
  Marked(markdown, { renderer: renderer });

  return links;
}