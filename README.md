# 🎲 Dados Rebolados

Aplicativo web de rolagem de dados para RPG de mesa — simples, rápido e sem dependências.

## ✨ Funcionalidades

- **6 tipos de dados**: D4, D6, D8, D10, D12, D20
- **Animação realista** de arremesso com física simulada (amassamento, quique, assentamento)
- **Zoom ajustável** na mesa: botões `+` / `−` para controlar o tamanho dos dados
- **5 temas visuais**: Dark RPG, Medieval, Moderno, Cyber-punk e Preto & Branco
- **Histórico** das últimas 10 rolagens com marcação de máximo/mínimo
- **Atalho de teclado**: `Espaço` ou `Enter` para rolar os dados
- Preferências de tema e zoom **salvas no localStorage**

## 🎨 Temas

| Tema | Descrição |
|---|---|
| 🌑 **Dark RPG** | Escuro com roxo/violeta — o padrão original |
| 🏰 **Medieval** | Tons terrosos, dourado e fonte serifada |
| 💡 **Moderno** | Fundo claro, azul limpo e tipografia clean |
| ⚡ **Cyber-punk** | Fundo preto, neon verde/magenta, fonte mono |
| ◑ **P&B** | Preto e branco, monocromático |

## 📁 Estrutura do projeto

```
dados-rebolados/
├── index.html        # Estrutura HTML da aplicação
├── css/
│   └── style.css     # Estilos: layout, componentes e todos os temas
├── js/
│   └── app.js        # Lógica: estado, animações, temas e zoom
└── README.md
```

## 🚀 Como usar

1. Clone ou baixe o repositório
2. Abra `index.html` em qualquer navegador moderno
3. Nenhuma instalação, build ou dependência necessária

```bash
git clone https://github.com/raguiohead/dados-rebolados.git
cd dados-rebolados
# Abra index.html no navegador
```

## 🎮 Controles

| Ação | Como fazer |
|---|---|
| Adicionar dado | Clique em `+` no card do tipo desejado |
| Remover dado | Clique em `−` |
| Rolar | Botão **Rolar Dados** ou tecle `Espaço` / `Enter` |
| Limpar mesa | Botão **Limpar Mesa** |
| Mudar zoom | Botões `+` / `−` no canto da mesa |
| Mudar tema | Botões na barra do cabeçalho |

## 🖥️ Compatibilidade

Funciona em qualquer navegador moderno com suporte a CSS Custom Properties e ES2015+.
