const mysql = require('mysql2');

try {
    var pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 3, // Reduzido para deixar margem de segurança
        queueLimit: 0
    });
    
    console.log("Pool de conexões estabelecido!");
    
    // Teste simples de conexão
    pool.getConnection((err, conn) => {
        if (err) {
            console.log("Erro ao conectar:", err);
        } else {
            console.log("Conectado ao SGBD!");
            conn.release(); // Libera a conexão de volta para o pool
        }
    });
    
} catch (e) {
    console.log("Falha ao estabelecer o pool de conexões!");
    console.log(e);
}

module.exports = pool.promise();