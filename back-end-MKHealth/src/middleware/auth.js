const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: "Token não informado."
        });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2) {
        return res.status(401).json({
            erro: "Formato do token inválido."
        });
    }

    const [bearer, token] = partes;

    if (bearer !== "Bearer") {
        return res.status(401).json({
            erro: "Formato do token inválido."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            erro: "Token expirado ou inválido."
        });

    }

};