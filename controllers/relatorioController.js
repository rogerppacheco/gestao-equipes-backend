// controllers/relatorioController.js
const pool = require('../config/db');

// Função para calcular os dias úteis REAIS em um intervalo
const calcularDiasUteis = async (dataInicio, dataFim) => {
    try {
        const [diasNaoUteisRows] = await pool.query(
            'SELECT data FROM dias_nao_uteis WHERE data BETWEEN ? AND ?',
            [dataInicio, dataFim]
        );
        const diasNaoUteisSet = new Set(diasNaoUteisRows.map(d => new Date(d.data).toISOString().split('T')[0]));

        let count = 0;
        let dataAtual = new Date(dataInicio + 'T03:00:00Z');
        const fim = new Date(dataFim + 'T03:00:00Z');

        while (dataAtual <= fim) {
            const diaDaSemana = dataAtual.getDay();
            const dataFormatada = dataAtual.toISOString().split('T')[0];

            if (diaDaSemana >= 1 && diaDaSemana <= 5 && !diasNaoUteisSet.has(dataFormatada)) {
                count++;
            }
            dataAtual.setDate(dataAtual.getDate() + 1);
        }
        return count;
    } catch (error) {
        console.error("Erro ao calcular dias úteis:", error);
        return 0; // Retorna 0 em caso de erro para não quebrar o relatório
    }
};

// Relatório Final Consolidado
exports.getRelatorioSemanal = async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
        return res.status(400).json({ msg: 'As datas de início e fim são obrigatórias.' });
    }
    try {
        const sql = `
            SELECT 
                u.id, u.nome_completo,
                COALESCE(af.valor_almoco, 0) as valor_almoco,
                COALESCE(af.valor_passagem, 0) as valor_passagem,
                rp.data, rp.status,
                ma.gera_desconto
            FROM usuarios u
            LEFT JOIN auxilios_financeiros af ON u.id = af.vendedor_id
            LEFT JOIN registros_presenca rp ON u.id = rp.vendedor_id AND rp.data BETWEEN ? AND ?
            LEFT JOIN motivos_ausencia ma ON rp.motivo_id = ma.id
            WHERE u.perfil_id IN (SELECT id FROM perfis WHERE nome = 'Vendedor') AND u.status = TRUE;
        `;
        const [rows] = await pool.query(sql, [dataInicio, dataFim]);
        const relatorio = {};
        rows.forEach(row => {
            if (!relatorio[row.id]) {
                relatorio[row.id] = {
                    nome_completo: row.nome_completo,
                    valor_auxilio_diario: parseFloat(row.valor_almoco) + parseFloat(row.valor_passagem),
                    dias_presente: 0,
                    dias_falta_com_desconto: 0,
                };
            }
            if (row.status === 'Presente') {
                relatorio[row.id].dias_presente++;
            } else if (row.status === 'Ausente' && row.gera_desconto) {
                relatorio[row.id].dias_falta_com_desconto++;
            }
        });
        const dadosFinais = Object.values(relatorio).map(item => {
            const total_a_receber = item.dias_presente * item.valor_auxilio_diario;
            const total_a_descontar = item.dias_falta_com_desconto * item.valor_auxilio_diario;
            return { ...item, total_a_receber, total_a_descontar, valor_final: total_a_receber - total_a_descontar };
        });
        res.json({ periodo: { inicio: dataInicio, fim: dataFim }, dados: dadosFinais });
    } catch (err) {
        console.error("ERRO NO getRelatorioSemanal:", err);
        res.status(500).send('Erro no servidor ao gerar relatório final.');
    }
};

// Relatório de Previsão de Pagamento
exports.getPrevisaoPagamento = async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) return res.status(400).json({ msg: 'As datas são obrigatórias.' });
    
    try {
        const diasUteis = await calcularDiasUteis(dataInicio, dataFim);
        const sql = `SELECT u.nome_completo, (COALESCE(af.valor_almoco, 0) + COALESCE(af.valor_passagem, 0)) as auxilio_diario FROM usuarios u LEFT JOIN auxilios_financeiros af ON u.id = af.vendedor_id WHERE u.perfil_id IN (SELECT id FROM perfis WHERE nome = 'Vendedor') AND u.status = TRUE;`;
        const [usuarios] = await pool.query(sql);
        const dadosFinais = usuarios.map(user => {
            const auxilioDiarioNumerico = parseFloat(user.auxilio_diario);
            return {
                nome_completo: user.nome_completo,
                auxilio_diario: auxilioDiarioNumerico,
                previsao_periodo: auxilioDiarioNumerico * diasUteis
            };
        });
        res.json({ periodo: { inicio: dataInicio, fim: dataFim, dias_uteis: diasUteis }, dados: dadosFinais });
    } catch (err) {
        console.error("ERRO NO getPrevisaoPagamento:", err);
        res.status(500).send('Erro no servidor ao gerar previsão.');
    }
};

// Relatório de Descontos
exports.getRelatorioDescontos = async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) return res.status(400).json({ msg: 'As datas são obrigatórias.' });
    try {
        const sql = `SELECT u.nome_completo, rp.data, m.motivo, (COALESCE(af.valor_almoco, 0) + COALESCE(af.valor_passagem, 0)) as valor_desconto FROM registros_presenca rp JOIN usuarios u ON rp.vendedor_id = u.id JOIN motivos_ausencia m ON rp.motivo_id = m.id LEFT JOIN auxilios_financeiros af ON u.id = af.vendedor_id WHERE rp.data BETWEEN ? AND ? AND rp.status = 'Ausente' AND m.gera_desconto = TRUE ORDER BY u.nome_completo, rp.data;`;
        const [descontos] = await pool.query(sql, [dataInicio, dataFim]);
        const dadosFinais = descontos.map(item => ({
            ...item,
            valor_desconto: parseFloat(item.valor_desconto)
        }));
        res.json({ periodo: { inicio: dataInicio, fim: dataFim }, dados: dadosFinais });
    } catch (err) {
        console.error("ERRO NO getRelatorioDescontos:", err);
        res.status(500).send('Erro no servidor ao gerar descontos.');
    }
};