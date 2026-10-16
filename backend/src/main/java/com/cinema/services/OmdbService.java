package com.cinema.services;

import com.cinema.dtos.OmdbMovieResponse;
import com.cinema.exceptions.RegraNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class OmdbService {

    private static final Logger log = LoggerFactory.getLogger(OmdbService.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;

    public OmdbService(RestTemplate restTemplate,
                       @Value("${omdb.base-url}") String baseUrl,
                       @Value("${omdb.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Busca um filme pelo titulo na OMDb API.
     * Lanca RegraNegocioException quando o filme nao existe ou a chave nao esta configurada.
     */
    public OmdbMovieResponse buscarPorTitulo(String titulo) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RegraNegocioException("Chave da API OMDb (OMDB_API_KEY) nao configurada no backend.");
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("apikey", apiKey.trim())
                .queryParam("t", titulo.trim())
                .build()
                .toUri();

        try {
            OmdbMovieResponse resp = restTemplate.getForObject(uri, OmdbMovieResponse.class);
            if (resp == null || !resp.ok()) {
                String msg = (resp != null && resp.error() != null) ? resp.error() : "Filme nao encontrado na OMDb.";
                throw new RegraNegocioException("OMDb: " + msg);
            }
            return resp;
        } catch (HttpClientErrorException.Unauthorized e) {
            log.error("Chave OMDb nao autorizada (401 Unauthorized) ao buscar titulo='{}'.", titulo);
            throw new RegraNegocioException("A chave da OMDb ainda não foi ativada. Por favor, verifique seu e-mail e clique no link de ativação enviado pela OMDb.");
        } catch (RestClientException e) {
            log.error("Falha de comunicacao com a API OMDb (tipo={}, titulo='{}'). Detalhe: {}", e.getClass().getSimpleName(), titulo, e.getMessage());
            throw new RegraNegocioException("Nao foi possivel consultar a API OMDb no momento. Tente novamente em instantes.");
        }
    }
}