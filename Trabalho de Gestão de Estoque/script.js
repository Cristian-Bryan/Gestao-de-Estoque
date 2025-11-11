// Armazenamento local
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let entradas = JSON.parse(localStorage.getItem('entradas')) || [];
let saidas = JSON.parse(localStorage.getItem('saidas')) || [];

// Funções de utilidade
function salvarDados() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('entradas', JSON.stringify(entradas));
    localStorage.setItem('saidas', JSON.stringify(saidas));
}

function showSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Gestão de Produtos
document.getElementById('produto-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('produto-nome').value;
    const codigo = parseInt(document.getElementById('produto-codigo').value);
    const quantidade = parseInt(document.getElementById('produto-quantidade').value);
    const preco = parseFloat(document.getElementById('produto-preco').value);

    if (produtos.some(p => p.codigo === codigo)) {
        alert('Já existe um produto com este código!');
        return;
    }

    produtos.push({ codigo, nome, quantidade, preco });
    salvarDados();
    atualizarListaProdutos();
    atualizarSelectProdutos();
    this.reset();
});

function atualizarListaProdutos() {
    const tbody = document.getElementById('produtos-list');
    tbody.innerHTML = '';
    
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button onclick="excluirProduto(${produto.codigo})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function excluirProduto(codigo) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        produtos = produtos.filter(p => p.codigo !== codigo);
        salvarDados();
        atualizarListaProdutos();
        atualizarSelectProdutos();
    }
}

// Gestão de Entradas
document.getElementById('entrada-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const produtoCodigo = parseInt(document.getElementById('entrada-produto').value);
    const quantidade = parseInt(document.getElementById('entrada-quantidade').value);
    const data = document.getElementById('entrada-data').value;

    const produto = produtos.find(p => p.codigo === produtoCodigo);
    if (produto) {
        produto.quantidade += quantidade;
        entradas.push({
            data,
            produtoCodigo,
            produtoNome: produto.nome,
            quantidade
        });
        
        salvarDados();
        atualizarListaProdutos();
        atualizarListaEntradas();
        this.reset();
    }
});

function atualizarListaEntradas() {
    const tbody = document.getElementById('entradas-list');
    tbody.innerHTML = '';
    
    entradas.forEach(entrada => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(entrada.data).toLocaleDateString()}</td>
            <td>${entrada.produtoNome}</td>
            <td>${entrada.quantidade}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Gestão de Saídas
document.getElementById('saida-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const produtoCodigo = parseInt(document.getElementById('saida-produto').value);
    const quantidade = parseInt(document.getElementById('saida-quantidade').value);
    const data = document.getElementById('saida-data').value;

    const produto = produtos.find(p => p.codigo === produtoCodigo);
    if (produto) {
        if (produto.quantidade < quantidade) {
            alert('Quantidade insuficiente em estoque!');
            return;
        }

        produto.quantidade -= quantidade;
        saidas.push({
            data,
            produtoCodigo,
            produtoNome: produto.nome,
            quantidade
        });
        
        salvarDados();
        atualizarListaProdutos();
        atualizarListaSaidas();
        this.reset();
    }
});

function atualizarListaSaidas() {
    const tbody = document.getElementById('saidas-list');
    tbody.innerHTML = '';
    
    saidas.forEach(saida => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(saida.data).toLocaleDateString()}</td>
            <td>${saida.produtoNome}</td>
            <td>${saida.quantidade}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualização dos selects de produtos
function atualizarSelectProdutos() {
    const selectsIds = ['entrada-produto', 'saida-produto'];
    
    selectsIds.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione o Produto</option>';
        
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.codigo;
            option.textContent = `${produto.nome} (Estoque: ${produto.quantidade})`;
            select.appendChild(option);
        });
    });
}

// Relatórios
function gerarRelatorioEstoque() {
    const container = document.getElementById('relatorio-container');
    let html = `
        <h3>Relatório de Estoque Atual</h3>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    let valorTotalEstoque = 0;
    produtos.forEach(produto => {
        const valorTotal = produto.quantidade * produto.preco;
        valorTotalEstoque += valorTotal;
        html += `
            <tr>
                <td>${produto.codigo}</td>
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>R$ ${valorTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4"><strong>Valor Total do Estoque:</strong></td>
                    <td><strong>R$ ${valorTotalEstoque.toFixed(2)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;

    container.innerHTML = html;
}

function gerarRelatorioMovimentacao() {
    const container = document.getElementById('relatorio-container');
    let html = `
        <h3>Relatório de Movimentação</h3>
        <div style="margin-bottom: 20px;">
            <h4>Entradas</h4>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
    `;

    entradas.forEach(entrada => {
        html += `
            <tr>
                <td>${new Date(entrada.data).toLocaleDateString()}</td>
                <td>${entrada.produtoNome}</td>
                <td>${entrada.quantidade}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <div>
            <h4>Saídas</h4>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
    `;

    saidas.forEach(saida => {
        html += `
            <tr>
                <td>${new Date(saida.data).toLocaleDateString()}</td>
                <td>${saida.produtoNome}</td>
                <td>${saida.quantidade}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// Inicialização
window.addEventListener('load', () => {
    atualizarListaProdutos();
    atualizarListaEntradas();
    atualizarListaSaidas();
    atualizarSelectProdutos();
});