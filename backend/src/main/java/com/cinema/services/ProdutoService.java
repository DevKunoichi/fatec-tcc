package com.cinema.services;

import com.cinema.dtos.MovimentacaoEstoqueDTO;
import com.cinema.dtos.ProdutoRequestDTO;
import com.cinema.dtos.ProdutoResponseDTO;
import com.cinema.entities.Produto;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listar(String termo, String categoria) {
        List<Produto> list;
        if (termo != null && !termo.isBlank() && categoria != null && !categoria.isBlank()) {
            list = repository.findByCategoriaIgnoreCaseAndNomeContainingIgnoreCase(categoria, termo);
        } else if (termo != null && !termo.isBlank()) {
            list = repository.findByNomeContainingIgnoreCase(termo);
        } else if (categoria != null && !categoria.isBlank()) {
            list = repository.findByCategoriaIgnoreCase(categoria);
        } else {
            list = repository.findAll();
        }
        return list.stream().map(ProdutoResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(Long id) {
        Produto p = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto com ID " + id + " nao foi encontrado."));
        return ProdutoResponseDTO.fromEntity(p);
    }

    @Transactional
    public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
        Produto p = new Produto();
        p.setNome(dto.nome().trim());
        p.setCategoria(dto.categoria().trim());
        p.setUnidade(dto.unidade() != null ? dto.unidade().trim() : "Unidade");
        p.setPreco(dto.preco());
        p.setQuantidadeEstoque(dto.quantidadeEstoque() != null ? dto.quantidadeEstoque() : 0);
        p.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 5);

        Produto salvo = repository.save(p);
        return ProdutoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto) {
        Produto p = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto com ID " + id + " nao encontrado para atualizacao."));

        p.setNome(dto.nome().trim());
        p.setCategoria(dto.categoria().trim());
        if (dto.unidade() != null) p.setUnidade(dto.unidade().trim());
        p.setPreco(dto.preco());
        p.setQuantidadeEstoque(dto.quantidadeEstoque());
        if (dto.estoqueMinimo() != null) p.setEstoqueMinimo(dto.estoqueMinimo());

        Produto atualizado = repository.save(p);
        return ProdutoResponseDTO.fromEntity(atualizado);
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Produto com ID " + id + " nao encontrado para exclusao.");
        }
        repository.deleteById(id);
    }

    /**
     * Regras RN003 e RF004:
     * - O estoque nunca pode ficar negativo.
     * - Quantidade vendida nao pode exceder o estoque.
     */
    @Transactional
    public ProdutoResponseDTO movimentarEstoque(Long id, MovimentacaoEstoqueDTO dto) {
        Produto p = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto com ID " + id + " nao encontrado."));

        String tipo = dto.tipo().trim().toUpperCase();
        int qtd = dto.quantidade();

        if ("ENTRADA".equals(tipo)) {
            p.setQuantidadeEstoque(p.getQuantidadeEstoque() + qtd);
        } else if ("SAIDA".equals(tipo)) {
            if (p.getQuantidadeEstoque() < qtd) {
                throw new RegraNegocioException("Estoque insuficiente! Saldo atual: " + p.getQuantidadeEstoque() + " unidades. Solicitado: " + qtd);
            }
            p.setQuantidadeEstoque(p.getQuantidadeEstoque() - qtd);
        } else {
            throw new RegraNegocioException("Tipo de movimentacao invalido. Utilize 'ENTRADA' ou 'SAIDA'.");
        }

        Produto salvo = repository.save(p);
        return ProdutoResponseDTO.fromEntity(salvo);
    }
}
