const express = require('express');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express();
const path = require('path');
const multer = require('multer');

// variable que indica la ruta tempral y el nombre del archivo que se recibe en la peticion
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
function SendEmailattachments(attachFiles, ListFiles, EmailDoctor, Paciente){

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();
    
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "tueEmail4@gmail.com", // generated ethereal user
            pass: "Tupass", // generated ethereal password
        },
        });
    
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"Telmedify" <foo@example.com>', // sender address
        to:  EmailDoctor, // list of receivers
        subject: "Información adicional del Paciente", // Subject line
        text: "Telmedify Documentos adjuntos", // plain text body
        html: "El Paciente <b>" + Paciente + "</b> le ha enviado uno o varios Documentos ", // html body
        attachments: attachFiles
        });
    
        console.log("Message sent: %s", info.messageId);

        // Eliminar los archivos Temporales asociados al Email
        await removeFiles(ListFiles)
    }
   
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
    res.send('web service for Sending Email With Attached Documents \n Port:3850 \n Path: multiple \n Path: Simple');
});

// Endpoint para enviar email con un solo archivo
app.post('/Simple', upload.single('file'), (req, res) => {
    console.log(`save file in: .\${req.file.path}`);
    console.log('originalname', req.file.originalname)
    console.log('destination', req.file.destination)
    console.log('filename', req.file.filename)

    let attachments = [
        {filename: 'Archivo1.jpg', path: './imagen.jpg'},
        {filename: 'Archivo2.jpg', path: './imagen.jpg'}
    ]

    SendEmailattachments (attachments)
    
    return res.send(req.file);
  })

// Endpoint para enviar email con multiples archivos 
app.post('/multiple', upload.array('archivo', 5), (req, res) => {
    //console.log(req.files) // Devuelve un array con la información de los archivos.

    // Email Doctor Destinatario
    let EmailUser = req.body.EmailDoctor
    // Nombre del paciente 
    let Paciente = req.body.Paciente

    // inicializar arrays para attachments a enviar y ListFiles a revorer luego del Envio de Email
    let attachments = []
    let ListFiles = [] // indica los archivos que deben ser eliminado de la carpeta temporal

    // Por cada archivo recibido se adjunta ak arrat de attachments
    for (const file in req.files) {
        attachments.push({filename: req.files[file].originalname, path: './File-Email-Temp/' + req.files[file].filename});
        ListFiles.push(req.files[file].filename);
      }

    // Funcion para enviar email con todos los archivos adjuntos
    SendEmailattachments (attachments, ListFiles, EmailUser, Paciente)
    // Response
    res.send('Archivos Fueron adjuntado exitosamente')
})

app.listen(3850, () => {
    console.log('Servidor is Running... Port" 3850')
})
