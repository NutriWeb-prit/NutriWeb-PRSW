const mysql = require('mysql2');

try {
    var pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0
    });
    
    console.log("Pool de conexões estabelecido!");
    
    pool.getConnection((err, conn) => {
        if (err) {
            console.log("Erro ao conectar:", err);
        } else {
            console.log("Conectado ao SGBD!");
            conn.release();
        }
    });

    const gracefulShutdown = async () => {
        console.log('\n🔴 Encerrando aplicação...');
        try {
            await pool.end();
            console.log('✅ Pool de conexões fechado com sucesso');
            process.exit(0);
        } catch (err) {
            console.error('❌ Erro ao fechar pool:', err);
            process.exit(1);
        }
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown);
    
} catch (e) {
    console.log("Falha ao estabelecer o pool de conexões!");
    console.log(e);
}

module.exports = pool.promise();