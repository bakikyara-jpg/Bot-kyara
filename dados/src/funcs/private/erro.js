export async function executar({ sock, from, msg, q, reply }) {
  if (!q?.trim()) {
    return reply(
      `🐞 *Exemplo:*\n\n` +
      `!erro SyntaxError: Unexpected token }\n` +
      `!erro Cannot find module axios`
    );
  }

  const key = msg?.key;

  if (key) {
    await sock.sendMessage(from, {
      react: {
        text: '🔎',
        key
      }
    }).catch(() => {});
  }

  const erroUser = q.trim();
  const analise = analisarErroLocal(erroUser);

  const texto =
    `🐞 *ANÁLISE DE ERRO* 🔎\n\n` +
    `*Erro:*\n` +
    `\`\`\`text\n${erroUser}\n\`\`\`\n\n` +
    `*Tipo:* ${analise.tipo}\n\n` +
    `*Causa:* ${analise.causa}\n\n` +
    `*Solução:* ${analise.solucao}\n\n` +
    `*Código corrigido:*\n` +
    `\`\`\`js\n${analise.codigo}\n\`\`\`\n\n` +
    `💡 *Dica:* ${analise.dica}`;

  await reply(texto);

  if (key) {
    await sock.sendMessage(from, {
      react: {
        text: '✅',
        key
      }
    }).catch(() => {});
  }
}

function analisarErroLocal(erro) {
  if (/Cannot find module/i.test(erro)) {
    const match =
      erro.match(/Cannot find module ['"]([^'"]+)['"]/i);

    const pacote = match?.[1] || 'pacote';

    return {
      tipo: 'Module Not Found',
      causa: 'O pacote não está instalado ou o nome do módulo está incorreto.',
      solucao: `Instale o pacote com: npm install ${pacote}`,
      codigo: `npm install ${pacote}`,
      dica: 'Confira também se o nome usado no require/import está escrito corretamente.'
    };
  }

  if (/Unexpected token/i.test(erro)) {
    return {
      tipo: 'SyntaxError',
      causa: 'Existe algum erro de sintaxe, como chave, parêntese, colchete ou vírgula incorreta.',
      solucao: 'Confira a linha indicada pelo Node.js e as linhas imediatamente anteriores.',
      codigo: `// Confira principalmente:
// {}
// ()
// []
// vírgulas e aspas`,
      dica: 'O erro geralmente está na linha indicada ou pouco antes dela.'
    };
  }

  if (/ENOENT/i.test(erro)) {
    return {
      tipo: 'File Not Found',
      causa: 'O arquivo ou diretório informado não foi encontrado.',
      solucao: 'Confira o caminho e se o arquivo realmente existe.',
      codigo: `if (!fs.existsSync(caminho)) {
  console.log('Arquivo não existe');
}`,
      dica: 'Prefira path.join(__dirname, "pasta", "arquivo") para montar caminhos.'
    };
  }

  if (/is not defined/i.test(erro)) {
    return {
      tipo: 'ReferenceError',
      causa: 'Uma variável ou função foi usada sem ter sido definida.',
      solucao: 'Confira o nome da variável e se ela foi declarada ou importada.',
      codigo: `const exemplo = 'valor';
console.log(exemplo);`,
      dica: 'Verifique também diferenças de maiúsculas e minúsculas.'
    };
  }

  if (/is not a function/i.test(erro)) {
    return {
      tipo: 'TypeError',
      causa: 'O código tentou executar algo que não é uma função.',
      solucao: 'Confira o tipo da variável e se o método realmente existe.',
      codigo: `console.log(typeof variavel);`,
      dica: 'Veja o valor da variável antes de chamar ela com ().'
    };
  }

  return {
    tipo: 'Erro Genérico',
    causa: 'Não foi possível identificar o erro apenas pelo padrão recebido.',
    solucao: 'Envie o erro completo, incluindo o stack trace e a linha indicada pelo Node.js.',
    codigo: `console.error(erro);`,
    dica: 'Quanto mais completo for o erro enviado, mais precisa será a análise.'
  };
}
