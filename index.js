const express = require('express');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const cors = require('cors');


const app = express();
app.use(cors());

// variable que indica la ruta temporal donde se almacenara los archivo que se recibe en la peticion
// en la Linea (20) se asigna el nombre al archivo temporal, basado en la fecha actual
let storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, './File-Email-Temp')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage });

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*
Metodo para enviar Email, recibe 
attachFiles == lista de archivos adjuntos que se desea enviar
ListFiles == lista de archivos que se debe borrar luego de enviar el email
EmailDoctor == Destinatario
Paciente == Nombre del Paciente
 */
function SendEmailattachments(attachFiles, ListFiles, Destinatario, UserName){

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
            
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
<<<<<<< HEAD
            // recuerde dar permisos en https://myaccount.google.com/u/5/lesssecureapps
            user: "TuEmail@gmail.com", // Usuario de la cuenta para enviar email 
            pass: "TuPassword", // password de la cuenta para enviar email  
=======
            user: "tueEmail4@gmail.com", // generated ethereal user
            pass: "Tupass", // generated ethereal password
>>>>>>> e2eb9569a21095503b93c19bd02a6ea3112d6443
        },
        });
    
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"Wo-Intelligence" <foo@example.com>', // sender address
        to:  Destinatario, // list of receivers
        subject: "Email-APP Node.js", // Subject line
        text: "Email con Documentos adjuntos", // plain text body
        html: "El Usuario <b>" + UserName + "</b> le ha enviado uno o varios Documentos. <p> Verifique los datos adjuntos </p>", // html body
        attachments: attachFiles
        });
    
        // Id del mensaje enviado
        console.log("Message sent: %s", info.messageId);

        // funcion para Eliminar los archivos Temporales asociados al Email
        await removeFiles(ListFiles)
    }
   
    // manejo de errores
    main().catch(console.error); 

  }

// Metodo para eliminar archivos Temporales 
function removeFiles(ListFiles){
    for (const file in ListFiles) {
        try {
            fs.unlinkSync('./File-Email-Temp/' + ListFiles[file])
            console.log('Temporary email file was deleted: ' + ListFiles[file])
        } catch(err) {
            console.error('Something wrong happened removing the file', err)
        }
    }
}

// Index
app.get('/', (req, res) => {
    res.send('Web Service For Sending Email With Attached Documents <br/> Port:3850 <br/> 1. Path: Simple (Para un solo archivo) <br/> <ul> <li>EmailUser</li> <li>Username</li> <li>file</li> </ul>  <br/> 2.  Path: SendEmail (Para Varios archivos, Maximo 5 Archivos) </br> <ul> <li>EmailUser</li> <li>Username</li> <li>file</li> <li>file</li></ul> </br> Ver Coleccion de Postman en el Proyecto <ul> <li> recuerde selecionar un archivo existente antes de realziar la peticion en postman</li> </ul>'  );
});

// Endpoint para enviar email con un solo archivo
app.post('/Simple', cors(), upload.single('file'),  (req, res) => {

    // Email Destinatario
    let EmailUser = req.body.EmailUser
    // Nombre del Usuario 
    let Username = req.body.Username

    let filename = [req.file.filename]        

    let attachments = [
        {filename:  req.file.filename, path: './File-Email-Temp/' + req.file.filename}
    ] 

    // Funcion para enviar email con todos los archivos adjuntos
    SendEmailattachments (attachments, filename, EmailUser, Username)

    // Respuesta Consola
    console.log('********************************************')
	console.log(Date.now())
    console.log(`save file in: .${req.file.path}`);
    console.log('originalname', req.file.originalname)
    console.log('destination', req.file.destination)
    console.log('filename', filename)
    console.log('Username', Username)
    console.log('EmailUser', EmailUser)
    
    return res.send(req.file);
  })

// Endpoint para enviar email con multiples archivos 
app.post('/SendEmail', cors(), upload.array('file', 5), (req, res) => {
    //console.log(req.files) // Devuelve un array con la información de los archivos.

    console.log(' - New request to the "SendEmail" service received')
	
    // Email Doctor Destinatario
    let EmailUser = req.body.EmailUser
    // Nombre del paciente 
    let Username = req.body.Username

    // inicializar arrays para attachments a enviar y ListFiles a revorer luego del Envio de Email
    let attachments = []
    let ListFiles = [] // indica los archivos que deben ser eliminado de la carpeta temporal

    console.log(' - Verifying the total of files received in the request')

    // Por cada archivo recibido se adjunta ak arrat de attachments
    for (const file in req.files) {
        attachments.push({filename: req.files[file].filename, path: './File-Email-Temp/' + req.files[file].filename});
        ListFiles.push(req.files[file].filename);
      }

    console.log(' - Sending the Email with the attachments (SendEmail attachments)')

    // Funcion para enviar email con todos los archivos adjuntos
    SendEmailattachments (attachments, ListFiles, EmailUser, Username)

    // Respuesta Consola
    res.send('Los Archivos Fueron Adjuntado y Enviados...')
    console.log('     - ', Date.now())
    console.log('     - Data for Email')
    console.log('        - Username:   ', Username)
    console.log('        - EmailUser:  ',EmailUser)
    console.log('        - ListFiles:  ',ListFiles)
    console.log('        - Attachments ',attachments)
})

app.listen(3850, () => {
    console.log('Servidor is Running... Port" 3850')
<<<<<<< HEAD
    console.log('   - 1. Path: /Simple')
    console.log('   - 2. Path: /SendEmail')
})
=======
})
>>>>>>> e2eb9569a21095503b93c19bd02a6ea3112d6443
