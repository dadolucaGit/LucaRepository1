"use strict";
let dispatcher = require("./dispatcher.js");
let http = require("http");
let fs = require("fs");
let mongoClient = require("mongodb").MongoClient;
//variabili login
let _username="";
let _password="";

//CONTROLLO LOGIN 
dispatcher.addListener("POST", "/api/ctrLogin", function (req, res) {
    //connessione a mongo
        mongoClient.connect("mongodb://127.0.0.1:27017", { "useNewUrlParser": true }, function (err, client) {
            if (err) {
                error(res, { "code": 500, "message": "Errore connessione al DB" });
            } else {
                //inserire il proprio DB e la Collection 
                let db = client.db("stud");
                let collection = db.collection("user");
    
                //query ctrl login 
                collection.find({ user: req["post"]["user"] }).toArray(function (err, results) {
                    if (err) {
                        error(res, { "code": 500, "message": "Errore esecuzione query" });
                    } else {
                        for(var obj of results){
                            if (obj != null && obj["pwd"] == req["post"]["pwd"]) {
                                _username = req["post"]["user"];
                                _password = req["post"]["pwd"];
                                console.log("-----------------------------------------------------------------------------collection tramite 'ctrLogin' eseguita");
                                //refresh pagina
                                res.writeHead(200, { "Content-Type": "application/json" });
                                res.end(JSON.stringify("login ok"));
                            } else {
                                error(res, { "code": 401, "message": "Credenziali non valide" });
                            }
                        }
                    }
                });
                client.close();
            }
        });
    });
    

    dispatcher.addListener("POST","/api/readAll", function (req, res) {
        mongoClient.connect("mongodb://127.0.0.1:27017", { "useNewUrlParser": true }, function (err, client) {
                if (err) {
                    error(res, { "code": 500, "message": "Errore connessione al DB" });
                } else {
                    let db = client.db("stud");
                    let collection = db.collection("alunni");
                     
                    collection.find({}).toArray(function (err, results) {
                        if (err) {
                            error(res, { "code": 500, "message": "Errore esecuzione query" });
                        } else {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(results));
                        }
                    });
                    
    
                    client.close();
                }
            });
    });



    dispatcher.addListener("POST","/api/insertRecord", function (req, res) {
        mongoClient.connect("mongodb://127.0.0.1:27017", { "useNewUrlParser": true }, function (err, client) {
                if (err) {
                    error(res, { "code": 500, "message": "Errore connessione al DB" });
                } else {
                    let db = client.db("stud");
                    let collection = db.collection("alunni");
                     
                    //INSERT
                    let vetAlunni = req["post"]["pSports"].split('-');

                    collection.find({}).sort({ _id: 1 }).toArray(function (err, results) {
                    if (err) {
                        error(res, { "code": 500, "message": "Errore esecuzione query" });
                    } else {
                        let vet = JSON.parse(JSON.stringify(results));
                        console.log(vet);
                        let idAlunno = parseInt(vet[vet.length - 1]["_id"]) + 1;
                        collection.insertOne({ _id: idAlunno,
                            nome: req["post"]["pNome"],
                            eta: parseInt(req["post"]["pEta"]),
                            residenza: req["post"]["pResidenza"],
                            sports:vetAlunni,
                            classe: req["post"]["pClasse"],
                            punteggio: parseInt(req["post"]["pPunteggio"])}, function (err, results) {
                            console.log(err);
                            if (err) {
                                error(res, { "code": 500, "message": "Errore esecuzione query" });
                            } else {
                                console.log("-----------------------------------------------------------------------------collection tramite INSERT eseguita");
                                console.log(JSON.parse(results).n);
                                res.end(JSON.stringify("insOk"));
                            }
                        });
                        client.close();
                    }
                });
    
                }
            });
    });


    dispatcher.addListener("POST","/api/updateRecord", function (req, res) {
        mongoClient.connect("mongodb://127.0.0.1:27017", { "useNewUrlParser": true }, function (err, client) {
                if (err) {
                    error(res, { "code": 500, "message": "Errore connessione al DB" });
                } else {
                    let db = client.db("stud");
                    let collection = db.collection("alunni");
                     

                    update({nome:"Rodman"},{$set:{capitano:"no"}})

                    //UPDATE--->
                    let vetAlunni = req["post"]["pSports"].split('-');
                    console.log("-------------------------------------------------------------------------AA");
                    collection.updateOne({ _id: req["post"]["pId"] },
                         { $set: {
                            nome: req["post"]["pNome"],
                            eta: parseInt(req["post"]["pEta"]),
                            residenza: req["post"]["pResidenza"],
                            sports:vetAlunni,
                            classe: req["post"]["pClasse"],
                            punteggio: parseInt(req["post"]["pPunteggio"])}, function (err, results) {
                                console.log("-------------------------------------------------------------------------AA");
                        if (err) {
                            console.log("-------------------------------------------------------------------------error");
                            error(res, { "code": 500, "message": "Errore esecuzione query" });
                        } else {
                            console.log("-----------------------------------------------------------------------------collection tramite UPDATE eseguita");
                            res.writeHead(200, { "Content-Type": "application/json" });
                            console.log(JSON.parse(results).n);
                            res.end(JSON.stringify("modOk"));
                        }
                    }});

                    client.close();
                }
            });
    });
    


//funzione errore
function error(res, err) {
    res.writeHead(err.code, {"Content-Type": 'text/html;charset=utf-8'});
    res.write("Codice errore: " + err.code + " - " + err.message);
}

//create server
http.createServer(function (request, response) {
    dispatcher.dispatch(request, response);
}).listen(8888);
dispatcher.showList();
console.log("Server running on port 8888");