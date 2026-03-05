#!/bin/bash

# ===========================================
# VIVE PLUS PRO - Deployment Script
# Script unificado para múltiples plataformas
# ===========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║        VIVE PLUS PRO - Deployer           ║"
echo "║   Sistema de Evaluación Funcional         ║"
echo "║        ECOSAFE PIVE 2020                  ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Función para mostrar ayuda
show_help() {
    echo -e "${YELLOW}Uso: ./deploy.sh [plataforma]${NC}"
    echo ""
    echo "Plataformas disponibles:"
    echo "  ${GREEN}docker${NC}     - Docker local"
    echo "  ${GREEN}vercel${NC}     - Vercel"
    echo "  ${GREEN}netlify${NC}    - Netlify"
    echo "  ${GREEN}railway${NC}    - Railway"
    echo "  ${GREEN}heroku${NC}     - Heroku"
    echo "  ${GREEN}all${NC}        - Mostrar todas las opciones"
    echo ""
    echo "Opciones adicionales:"
    echo "  --build      - Solo construir"
    echo "  --start      - Solo iniciar"
    echo "  --logs       - Ver logs"
    echo "  --stop       - Detener servicios"
}

# Verificar dependencias
check_dependencies() {
    echo -e "${BLUE}Verificando dependencias...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v bun &> /dev/null; then
        echo -e "${YELLOW}Bun no está instalado, usando npm${NC}"
    fi
    
    echo -e "${GREEN}✓ Dependencias verificadas${NC}"
}

# Deploy con Docker
deploy_docker() {
    echo -e "${BLUE}Desplegando con Docker...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker no está instalado${NC}"
        exit 1
    fi
    
    # Construir imagen
    if [[ "$*" == *"--build"* ]] || [[ "$*" == "" ]]; then
        echo -e "${YELLOW}Construyendo imagen Docker...${NC}"
        docker build -t vive-plus-pro:latest .
        echo -e "${GREEN}✓ Imagen construida${NC}"
    fi
    
    # Iniciar contenedor
    if [[ "$*" == *"--start"* ]] || [[ "$*" == "" ]]; then
        echo -e "${YELLOW}Iniciando contenedor...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Contenedor iniciado${NC}"
        echo -e "${GREEN}App disponible en: http://localhost:3000${NC}"
    fi
}

# Deploy en Vercel
deploy_vercel() {
    echo -e "${BLUE}Desplegando en Vercel...${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
        npm i -g vercel
    fi
    
    vercel --prod
    echo -e "${GREEN}✓ Desplegado en Vercel${NC}"
}

# Deploy en Netlify
deploy_netlify() {
    echo -e "${BLUE}Desplegando en Netlify...${NC}"
    
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}Instalando Netlify CLI...${NC}"
        npm i -g netlify-cli
    fi
    
    # Construir primero
    bun run build
    
    netlify deploy --prod
    echo -e "${GREEN}✓ Desplegado en Netlify${NC}"
}

# Deploy en Railway
deploy_railway() {
    echo -e "${BLUE}Desplegando en Railway...${NC}"
    
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}Instalando Railway CLI...${NC}"
        npm i -g @railway/cli
    fi
    
    railway up
    echo -e "${GREEN}✓ Desplegado en Railway${NC}"
}

# Deploy en Heroku
deploy_heroku() {
    echo -e "${BLUE}Desplegando en Heroku...${NC}"
    
    if ! command -v heroku &> /dev/null; then
        echo -e "${RED}Heroku CLI no está instalado${NC}"
        echo -e "${YELLOW}Instala con: brew tap heroku/brew && brew install heroku${NC}"
        exit 1
    fi
    
    # Crear app si no existe
    heroku create vive-plus-pro --region us || true
    
    # Configurar buildpack
    heroku buildpacks:set heroku/nodejs
    
    # Desplegar
    git push heroku main || git push heroku master
    
    echo -e "${GREEN}✓ Desplegado en Heroku${NC}"
}

# Ver logs
show_logs() {
    echo -e "${BLUE}Mostrando logs...${NC}"
    docker-compose logs -f
}

# Detener servicios
stop_services() {
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Servicios detenidos${NC}"
}

# Main
case "$1" in
    docker)
        check_dependencies
        deploy_docker "$2"
        ;;
    vercel)
        check_dependencies
        deploy_vercel
        ;;
    netlify)
        check_dependencies
        deploy_netlify
        ;;
    railway)
        check_dependencies
        deploy_railway
        ;;
    heroku)
        check_dependencies
        deploy_heroku
        ;;
    --logs)
        show_logs
        ;;
    --stop)
        stop_services
        ;;
    all)
        show_help
        ;;
    *)
        show_help
        ;;
esac
