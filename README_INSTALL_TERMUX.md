Instalação mínima Kyara (Termux)

1) Pré-requisitos (Termux):

   pkg update && pkg upgrade -y
   pkg install nodejs ffmpeg git -y
   node -v   # recomendamos >= 16

2) Clonar e iniciar:

   git clone https://github.com/bakikyara-jpg/Bot-kyara
   cd Bot-kyara
   git checkout bootstrap-kyara-run

   # remover node_modules comitado localmente (se existir)
   rm -rf node_modules

   npm ci    # ou npm install
   npm start

3) Pareamento:

   - No terminal aparecerá o QR da sessão (Baileys). Escaneie com WhatsApp para parear.
   - Verifique nos logs mensagens de "connected/ready".

Se algum erro ocorrer, cole o log completo aqui para que eu possa corrigir.
