package com.cinema.services;

import com.cinema.dtos.UsuarioRequestDTO;
import com.cinema.dtos.UsuarioResponseDTO;
import com.cinema.dtos.UsuarioUpdateDTO;
import com.cinema.entities.Usuario;
import com.cinema.enums.PerfilUsuario;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar(String busca) {
        List<Usuario> list = (busca != null && !busca.isBlank())
                ? repository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(busca.trim(), busca.trim())
                : repository.findAllByOrderByNomeAsc();
        return list.stream().map(UsuarioResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return UsuarioResponseDTO.fromEntity(requireUsuario(id));
    }

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        String email = normalizarEmail(dto.email());
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new RegraNegocioException("Ja existe um usuario com o email " + email + ".");
        }
        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new RegraNegocioException("A senha e obrigatoria.");
        }

        Usuario u = new Usuario(
            null,
            dto.nome().trim(),
            email,
            passwordEncoder.encode(dto.senha()),
            dto.perfil() != null ? dto.perfil() : PerfilUsuario.ATENDENTE,
            dto.ativo() != null ? dto.ativo() : true
        );
        return UsuarioResponseDTO.fromEntity(repository.save(u));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario u = requireUsuario(id);

        if (dto.nome() != null) u.setNome(dto.nome().trim());
        if (dto.email() != null) {
            String email = normalizarEmail(dto.email());
            boolean outroComMesmoEmail = repository.findByEmailIgnoreCase(email)
                    .filter(outro -> !outro.getId().equals(id))
                    .isPresent();
            if (outroComMesmoEmail) {
                throw new RegraNegocioException("Ja existe um usuario com o email " + email + ".");
            }
            u.setEmail(email);
        }
        if (dto.senha() != null && !dto.senha().isBlank()) {
            u.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }
        if (dto.perfil() != null) u.setPerfil(dto.perfil());
        if (dto.ativo() != null) u.setAtivo(dto.ativo());

        return UsuarioResponseDTO.fromEntity(repository.save(u));
    }

    @Transactional
    public void excluir(Long id, Long idSolicitante) {
        if (id.equals(idSolicitante)) {
            throw new RegraNegocioException("Voce nao pode excluir o proprio usuario.");
        }
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario com ID " + id + " nao encontrado para exclusao.");
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Usuario buscarEntidadePorEmail(String email) {
        return repository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario com email " + email + " nao encontrado."));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private Usuario requireUsuario(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario com ID " + id + " nao encontrado."));
    }
}