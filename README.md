
# Finanças – Controle Financeiro Pessoal

Aplicação web para organizar as finanças pessoais: registrar entradas e saídas, separar por categoria e acompanhar para onde o dinheiro está indo mês a mês.

🔗[LINK DO GITHUB PAGES]


# Por que eu criei

Eu era desorganizado com dinheiro e não sabia dizer quanto entrava, quanto saía e com o que eu mais gastava. Construí o projeto finanças para resolver esse problema e, ao mesmo tempo, praticar desenvolvimento web do zero.

# Funcionalidades

- Cadastro de entradas e saídas com descrição, valor, categoria e data.
- Saldo do mês com animação e gráfico de evolução ao longo dos dias.
- Gráfico de pizza dos gastos por categoria.
- Gráfico de barras comparando entradas e saídas dos últimos 6 meses.
- Navegação entre meses.
- Filtro da lista (todas, entradas ou saídas) e exclusão de transações.
- Comparação automática com o mês anterior.
- Dados salvos no navegador (localStorage), sem precisar de cadastro.
- Layout responsivo (celular e computador)
- Fundo animado com partículas e cartões com inclinação 3D.

# Tecnologias

- HTML5: estrutura semântica.
- CSS3: variáveis, Grid, Flexbox, "backdrop-filter", animações.
- JavaScript puro (sem frameworks): lógica, manipulação do DOM e "localStorage".
- SVG para os gráficos, desenhados por código.
- Canvas para o fundo animado.

# Estrutura

```
├── index.html   # estrutura da página
├── style.css    # visual e animações
├── script.js    # lógica, gráficos e efeitos
└── README.md
```

# Como rodar

1. Clone o repositório:
   ```
   git clone [LINK DO SEU REPOSITÓRIO]
   ```
2. Abra o arquivo "index.html" no navegador.

Não precisa instalar nada.

# O que aprendi

- Manipular o DOM e redesenhar a tela a partir dos dados (função "render")
- Guardar dados no navegador com "localStorage" e "JSON".
- Desenhar gráficos com SVG, sem bibliotecas.
- Animações com "requestAnimationFrame" e "canvas".
- Layout responsivo com CSS Grid e Flexbox.
- Proteger a página contra injeção de HTML ao exibir texto digitado pelo usuário.

# Autor

João Gadelha: estudante de Ciência da Computação, em busca de oportunidade como desenvolvedor.