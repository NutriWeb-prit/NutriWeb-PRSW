const mysql = require('mysql2/promise');

try {
    var pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        maxIdle: 10 
    });
   
    console.log("Pool de conexões estabelecido!");
   
    (async () => {
        try {
            const conn = await pool.getConnection();
            console.log("Conectado ao SGBD!");
            conn.release();
        } catch (err) {
            console.log("Erro ao conectar:", err.message);
        }
    })();

    const resetPoolPeriodically = () => {
        setInterval(async () => {
            try {
                console.log('🔄 [' + new Date().toLocaleTimeString() + '] Limpando conexões inativas...');
                
                await pool.query('SELECT 1');
                
                console.log('✅ Pool verificado e limpo com sucesso');
            } catch (err) {
                console.error('⚠️ Erro ao limpar pool:', err.message);
            }
        }, 2 * 60 * 1000);
    };

    resetPoolPeriodically();

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

    module.exports = pool;
   
} catch (e) {
    console.log("Falha ao estabelecer o pool de conexões!");
    console.log(e);
}