const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt')

const crearUsuario = async(req, res = response) => {

    const { name, email, password } = req.body;
     try {
        //Verificar si existe correo
        const usuario = await Usuario.findOne({ email });

        if( usuario ){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe con ese email'
            });
        }

        //Crear usuario con el modelo
        const dbUser = new Usuario( req.body );

        //Encriptar o Hashear la contrasenia
        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync( password, salt );
        
        //Generar el JWT
        const token = await generarJWT(dbUser.id, name);

        //Crear usuario de BD
        await dbUser.save();

        //Generar respues exitosa
        return res.status(201).json({
            ok: true,
            uid: dbUser.id,
            name,
            token
        });
        
     } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hablar con el administrador'
        })
     }

   
    
    
};

const loginUsuario = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const dbUser = await Usuario.findOne({email});

        if(!dbUser){
            return res.status(400).json({
                ok: false,
                msg: 'El correo no existe'
            });
        }
        
        //Confirmar si el password hace match

        const validPassword = bcrypt.compareSync(password, dbUser.password);
        if(!validPassword){
            return res.status(400).json({
                ok: false,
                msg: 'El password no existe'
            });
        }

        //Generar el JWT
        const token = await generarJWT(dbUser.id, dbUser.name);

        //Respuesta del servicio
        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            token            
        })


        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hablar con el administrador'
        })
    }

    
};

const revalidarToken = async(req, res = response) => {

    const {uid, name} = req;

    //Generar nuevo JWT
    const token = await generarJWT(uid, name);

    return res.json({
        ok: true,
        uid,
        name,
        token
    });
};

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}