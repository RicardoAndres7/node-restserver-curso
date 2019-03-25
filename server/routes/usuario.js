const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function(req, res) {

    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 5;
    let filter = {
        estado: true
    }

    Usuario.find(filter, 'nombre email role estado google img')
        .skip(skip)
        .limit(limit)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            }

            Usuario.count(filter, (err, count) => {

                res.json({
                    ok: true,
                    usuarios: usuarios,
                    total: count
                })
            });


        })
});

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = {
        estado: false
    };

    //Usuario.findByIdAndRemove(id, (err, usuarioDelete) => {
    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDelete) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        if (!usuarioDelete) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDelete
        });

    });
});

module.exports = app;