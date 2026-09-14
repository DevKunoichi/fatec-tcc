package com.cinema.dtos;

import com.cinema.entities.Produto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
    Long id,
    String nome,
    String categoria,
    String unidade,
    BigDecimal preco,
    Integer quantidadeEstoque,
    Integer estoqueMinimo,
    String statusEstoque, // "NORMAL", "BAIXO", "ESGOTADO"
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static ProdutoResponseDTO fromEntity(Produto p) {
        String status = "NORMAL";
        if (p.getQuantidadeEstoque() <= 0) {
            status = "ESGOTADO";
        } else if (p.getQuantidadeEstoque() <= p.getEstoqueMinimo()) {
            status = "BAIXO";
        }
        return new ProdutoResponseDTO(
            p.getId(),
            p.getNome(),
            p.getCategoria(),
            p.getUnidade(),
            p.getPreco(),
            p.getQuantidadeEstoque(),
            p.getEstoqueMinimo(),
            status,
            p.getDataCadastro(),
            p.getDataAtualizacao()
        );
    }
}
