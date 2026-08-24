#!/bin/bash

clear

BLACK="\033[30m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"
WHITE="\033[37m"
RESET="\033[0m"

BOLD="\033[1m"

echo -e "
${MAGENTA}${BOLD}
███████╗██╗   ██╗██████╗  ██████╗ ███╗   ██╗
╚══███╔╝╚██╗ ██╔╝██╔══██╗██╔═══██╗████╗  ██║
  ███╔╝  ╚████╔╝ ██████╔╝██║   ██║██╔██╗ ██║
 ███╔╝    ╚██╔╝  ██╔══██╗██║   ██║██║╚██╗██║
███████╗   ██║   ██║  ██║╚██████╔╝██║ ╚████║
╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
${RESET}
"

echo -e "${CYAN}╔══════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║        🤖 ZYRON-MD & ZYRON-AI        ║${RESET}"
echo -e "${CYAN}║      Sistema sendo inicializado      ║${RESET}"
echo -e "${CYAN}║      ❤️‍🔥 GzeeScriptsDev </> ❤️‍🔥      ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════╝${RESET}"
echo ""

sleep 0.5

printf "${MAGENTA}"
i=1
while [ $i -le 30 ]
do
    bar=""
    j=1
    while [ $j -le $i ]
    do
        bar="${bar}#"
        j=$((j + 1))
    done

    printf "\r⚡ CARREGANDO: [%-30s] %d%%" "$bar" $((i * 100 / 30))
    sleep 0.04
    i=$((i + 1))
done
printf "${RESET}"

echo -e "\n\n${GREEN}✓ INICIALIZAÇÃO CONCLUÍDA COM SUCESSO${RESET}\n"
sleep 1

while true
do
    echo -e "${WHITE}[${CYAN}ZYRON-MD${WHITE}] ${GREEN}Aplicação iniciada...${RESET}"
    node connect.js

    echo ""
    echo -e "${WHITE}[${CYAN}ZYRON-MD${WHITE}] ${RED}Conexão encerrada!${RESET}"
    echo -e "${WHITE}[${CYAN}ZYRON-MD${WHITE}] ${YELLOW}Reconectando em 3 segundos...${RESET}"
    echo ""

    sleep 3
done