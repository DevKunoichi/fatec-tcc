package com.cinema.services;

import com.cinema.dtos.*;
import com.cinema.entities.Assento;
import com.cinema.entities.Ingresso;
import com.cinema.entities.Sessao;
import com.cinema.entities.Usuario;
import com.cinema.enums.StatusAssento;
import com.cinema.enums.StatusIngresso;
import com.cinema.enums.StatusSessao;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.AssentoRepository;
import com.cinema.repositories.IngressoRepository;
import com.cinema.repositories.SessaoRepository;
import com.cinema.repositories.UsuarioRepository;
import com.cinema.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class IngressoService {

    private static final BigDecimal VALOR_PADRAO = new BigDecimal("25.00");

    private final IngressoRepository repository;
    private final SessaoRepository sessaoRepository;
    private final AssentoRepository assentoRepository;
    private final UsuarioRepository usuarioRepository;

    public IngressoService(IngressoRepository repository,
                           SessaoRepository sessaoRepository,
                           AssentoRepository assentoRepository,
                           UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.sessaoRepository = sessaoRepository;
        this.assentoRepository = assentoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<IngressoResponseDTO> listar() {
        return repository.findAll().stream().map(IngressoResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public IngressoResponseDTO buscarPorId(Long id) {
        return IngressoResponseDTO.fromEntity(requireIngresso(id));
    }

    @Transactional(readOnly = true)
    public List<IngressoResponseDTO> listarPorSessao(Long sessaoId) {
        requireSessao(sessaoId);
        return repository.findBySessaoId(sessaoId).stream().map(IngressoResponseDTO::fromEntity).toList();
    }

    @Transactional
    public IngressoResponseDTO criar(IngressoRequestDTO dto) {
        Sessao sessao = requireSessao(dto.sessaoId());
        Assento assento = requireAssento(dto.assentoId());
        validarAssentoPertenceASala(assento, sessao);
        validarDisponibilidade(sessao.getId(), List.of(assento));

        Ingresso i = new Ingresso(
            null,
            sessao,
            assento,
            dto.nomeCliente().trim(),
            dto.valor() != null ? dto.valor() : VALOR_PADRAO,
            dto.status() != null ? dto.status() : StatusIngresso.VENDIDO
        );
        usuarioAutenticado().ifPresent(i::setUsuario);
        Ingresso salvo = repository.save(i);
        marcarSessaoLotadaSeNecessario(sessao);
        return IngressoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public IngressoResponseDTO atualizar(Long id, IngressoRequestDTO dto) {
        Ingresso i = requireIngresso(id);

        Long sessaoId = dto.sessaoId() != null ? dto.sessaoId() : i.getSessao().getId();
        Long assentoId = dto.assentoId() != null ? dto.assentoId() : i.getAssento().getId();
        Sessao sessao = requireSessao(sessaoId);
        Assento assento = requireAssento(assentoId);
        validarAssentoPertenceASala(assento, sessao);

        if (!(i.getSessao().getId().equals(sessaoId) && i.getAssento().getId().equals(assentoId))) {
            validarDisponibilidade(sessaoId, List.of(assento));
        }

        i.setSessao(sessao);
        i.setAssento(assento);
        if (dto.nomeCliente() != null) i.setNomeCliente(dto.nomeCliente().trim());
        if (dto.valor() != null) i.setValor(dto.valor());
        if (dto.status() != null) i.setStatus(dto.status());
        return IngressoResponseDTO.fromEntity(repository.save(i));
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Ingresso com ID " + id + " nao encontrado para exclusao.");
        }
        repository.deleteById(id);
    }

    /**
     * Compra de ingressos: valida sessao, assentos, disponibilidade e capacidade da sala.
     */
    @Transactional
    public List<IngressoResponseDTO> comprar(IngressoCompraDTO dto) {
        if (dto.sessaoId() == null) {
            throw new RegraNegocioException("Informe o id da sessao.");
        }
        if (dto.assentoIds() == null || dto.assentoIds().isEmpty()) {
            throw new RegraNegocioException("Selecione ao menos um assento.");
        }
        if (dto.nomeCliente() == null || dto.nomeCliente().trim().isEmpty()) {
            throw new RegraNegocioException("Informe o nome do cliente.");
        }

        Set<Long> semDuplicados = new HashSet<>(dto.assentoIds());
        if (semDuplicados.size() != dto.assentoIds().size()) {
            throw new RegraNegocioException("Ha assentos repetidos na compra.");
        }

        Sessao sessao = requireSessao(dto.sessaoId());
        if (sessao.getStatus() == StatusSessao.CANCELADA || sessao.getStatus() == StatusSessao.ENCERRADA) {
            throw new RegraNegocioException("Nao e possivel comprar ingressos para uma sessao " + sessao.getStatus().name().toLowerCase() + ".");
        }

        Map<Long, Assento> assentosPorId = assentoRepository.findAllById(semDuplicados).stream()
                .collect(Collectors.toMap(Assento::getId, Function.identity()));
        if (assentosPorId.size() != semDuplicados.size()) {
            throw new RegraNegocioException("Um ou mais assentos informados nao existem.");
        }

        List<Assento> assentos = dto.assentoIds().stream().map(assentosPorId::get).toList();
        for (Assento a : assentos) {
            validarAssentoPertenceASala(a, sessao);
            if (a.getStatus() == StatusAssento.INDISPONIVEL) {
                throw new RegraNegocioException("O assento " + a.getFileira() + a.getNumero() + " esta INDISPONIVEL.");
            }
        }

        validarDisponibilidade(sessao.getId(), assentos);

        long vendidos = repository.countBySessaoIdAndStatusIn(sessao.getId(),
                List.of(StatusIngresso.RESERVADO, StatusIngresso.VENDIDO, StatusIngresso.UTILIZADO));
        if (vendidos + assentos.size() > sessao.getSala().getCapacidadeTotal()) {
            throw new RegraNegocioException("Sessao sem capacidade para " + assentos.size() + " ingressos (ocupacao " + vendidos + "/" + sessao.getSala().getCapacidadeTotal() + ").");
        }

        BigDecimal valor = dto.valor() != null ? dto.valor() : VALOR_PADRAO;
        if (valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("O valor do ingresso deve ser maior que zero.");
        }
        String cliente = dto.nomeCliente().trim();
        LocalDateTime agora = LocalDateTime.now();

        List<Ingresso> novos = assentos.stream()
                .map(a -> {
                    Ingresso i = new Ingresso(null, sessao, a, cliente, valor, StatusIngresso.VENDIDO);
                    i.setDataCompra(agora);
                    usuarioAutenticado().ifPresent(i::setUsuario);
                    return i;
                })
                .toList();
        List<Ingresso> salvos = repository.saveAll(novos);

        marcarSessaoLotadaSeNecessario(sessao);
        return salvos.stream().map(IngressoResponseDTO::fromEntity).toList();
    }

    /**
     * Mapa de assentos da sessao: por assento, o estado real (disponivel/reservado/vendido/indisponivel).
     */
    @Transactional(readOnly = true)
    public AssentosDaSessaoDTO mapaDaSessao(Long sessaoId) {
        Sessao sessao = requireSessao(sessaoId);

        List<Assento> assentos = assentoRepository.findBySalaIdOrderByFileiraAscNumeroAsc(sessao.getSala().getId());
        Map<Long, StatusIngresso> statusPorAssento = repository.findBySessaoId(sessaoId).stream()
                .collect(Collectors.toMap(i -> i.getAssento().getId(), Ingresso::getStatus));

        List<AssentoMapaDTO> assentosMapa = assentos.stream().map(a -> {
            StatusIngresso status;
            if (statusPorAssento.containsKey(a.getId())) {
                status = statusPorAssento.get(a.getId());
            } else if (a.getStatus() == StatusAssento.INDISPONIVEL) {
                status = StatusIngresso.INDISPONIVEL;
            } else {
                status = StatusIngresso.DISPONIVEL;
            }
            return new AssentoMapaDTO(a.getId(), a.getFileira(), a.getNumero(), status);
        }).toList();

        long vendidos = repository.countBySessaoIdAndStatusIn(sessaoId,
                List.of(StatusIngresso.RESERVADO, StatusIngresso.VENDIDO, StatusIngresso.UTILIZADO));

        return new AssentosDaSessaoDTO(
            sessao.getId(),
            FilmeResponseDTO.fromEntity(sessao.getFilme()),
            SalaResponseDTO.fromEntity(sessao.getSala()),
            sessao.getDataHoraInicio(),
            (int) vendidos,
            sessao.getSala().getCapacidadeTotal() - (int) vendidos,
            assentosMapa
        );
    }

    private void validarAssentoPertenceASala(Assento assento, Sessao sessao) {
        if (!assento.getSala().getId().equals(sessao.getSala().getId())) {
            throw new RegraNegocioException("O assento " + assento.getFileira() + assento.getNumero()
                    + " nao pertence a sala da sessao.");
        }
    }

    private void validarDisponibilidade(Long sessaoId, List<Assento> assentos) {
        List<Long> ids = assentos.stream().map(Assento::getId).toList();
        List<Ingresso> jaVendidos = repository.findBySessaoIdAndAssentoIdIn(sessaoId, ids);
        if (!jaVendidos.isEmpty()) {
            Ingresso i = jaVendidos.get(0);
            throw new RegraNegocioException("O assento " + i.getAssento().getFileira() + i.getAssento().getNumero()
                    + " ja foi vendido/reservado para esta sessao.");
        }
    }

    /**
     * Usuario autenticado (via JWT) para vincular o ingresso a um cadastro (Fase 4).
     * Compras avulsas/anonimas seguem apenas com nomeCliente.
     */
    private Optional<Usuario> usuarioAutenticado() {
        return SecurityUtils.autenticado()
                .flatMap(ud -> usuarioRepository.findById(ud.getUsuarioId()));
    }

    private void marcarSessaoLotadaSeNecessario(Sessao sessao) {
        long vendidos = repository.countBySessaoIdAndStatusIn(sessao.getId(),
                List.of(StatusIngresso.RESERVADO, StatusIngresso.VENDIDO, StatusIngresso.UTILIZADO));
        if (vendidos >= sessao.getSala().getCapacidadeTotal() && sessao.getStatus() != StatusSessao.LOTADA) {
            sessao.setStatus(StatusSessao.LOTADA);
            sessaoRepository.save(sessao);
        }
    }

    private Ingresso requireIngresso(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingresso com ID " + id + " nao encontrado."));
    }

    private Sessao requireSessao(Long id) {
        return sessaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessao com ID " + id + " nao encontrada."));
    }

    private Assento requireAssento(Long id) {
        return assentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assento com ID " + id + " nao encontrado."));
    }
}