package com.cinema.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Gerenciador de carregamento de variáveis de ambiente a partir de arquivos .env.
 * Injeta as chaves lidas diretamente no System.getProperties() antes da inicialização
 * do Spring Boot, permitindo que o application.properties resolva variáveis como ${OMDB_API_KEY}
 * de forma limpa, desacoplada e sem expor dados sensíveis no repositório.
 */
public final class DotenvLoader {

    private static final Logger log = LoggerFactory.getLogger(DotenvLoader.class);

    private DotenvLoader() {
    }

    public static void carregar() {
        List<File> locaisCandidatos = List.of(
                new File(".env"),
                new File("backend/.env"),
                new File("../.env"),
                new File(System.getProperty("user.dir"), ".env"),
                new File(System.getProperty("user.dir"), "backend/.env")
        );

        File arquivoEnv = null;
        for (File candidato : locaisCandidatos) {
            if (candidato.exists() && candidato.isFile()) {
                arquivoEnv = candidato;
                break;
            }
        }

        if (arquivoEnv == null) {
            log.info("[DotenvLoader] Nenhum arquivo .env encontrado nos locais padrão. Usando variáveis de ambiente do SO.");
            return;
        }

        log.info("[DotenvLoader] Carregando configurações a partir de: {}", arquivoEnv.getAbsolutePath());

        try (BufferedReader reader = new BufferedReader(new FileReader(arquivoEnv, StandardCharsets.UTF_8))) {
            String linha;
            int carregadas = 0;
            while ((linha = reader.readLine()) != null) {
                linha = linha.trim();
                if (linha.isEmpty() || linha.startsWith("#")) {
                    continue;
                }

                int idxSeparador = linha.indexOf('=');
                if (idxSeparador > 0) {
                    String chave = linha.substring(0, idxSeparador).trim();
                    String valor = linha.substring(idxSeparador + 1).trim();

                    // Remove aspas simples ou duplas ao redor do valor, se existirem
                    if ((valor.startsWith("\"") && valor.endsWith("\"")) ||
                        (valor.startsWith("'") && valor.endsWith("'"))) {
                        valor = valor.substring(1, valor.length() - 1).trim();
                    }

                    // Define no System.getProperties para que o Spring Boot resolva automaticamente no application.properties
                    if (!chave.isEmpty() && System.getProperty(chave) == null) {
                        System.setProperty(chave, valor);
                        carregadas++;
                    }
                }
            }
            log.info("[DotenvLoader] {} variáveis carregadas com sucesso a partir do .env.", carregadas);
        } catch (IOException e) {
            log.warn("[DotenvLoader] Não foi possível ler o arquivo .env: {}", e.getMessage());
        }
    }
}
