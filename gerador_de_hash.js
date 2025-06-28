// gerador_de_hash.js
const bcrypt = require('bcryptjs');

const senhaPura = 'diretor123'; // Vamos usar uma senha NOVA para não confundir
const saltRounds = 10;

console.log(`Gerando hash para a senha: "${senhaPura}"`);

bcrypt.hash(senhaPura, saltRounds, function(err, hash) {
    if (err) {
        console.error("Erro ao gerar o hash:", err);
        return;
    }

    console.log("\nCÓDIGO SQL PRONTO PARA USAR:");
    console.log("------------------------------------------");
    console.log(`INSERT INTO usuarios (nome_completo, cpf, email, senha, perfil_id, status) VALUES ('Diretor Principal', '111.111.111-11', 'diretor.chefe@recordpap.com.br', '${hash}', 1, TRUE);`);
    console.log("------------------------------------------");
});