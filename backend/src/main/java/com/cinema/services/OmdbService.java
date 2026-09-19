package com.cinema.services;

import com.cinema.dtos.OmdbMovieResponse;
import com.cinema.exceptions.RegraNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class OmdbService {

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

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("t", titulo.trim())
                .toUriString();

        try {
            OmdbMovieResponse resp = restTemplate.getForObject(url, OmdbMovieResponse.class);
            if (resp == null || !resp.ok()) {
                String msg = (resp != null && resp.error() != null) ? resp.error() : "Filme nao encontrado na OMDb.";
                throw new RegraNegocioException("OMDb: " + msg);
            }
            return resp;
        } catch (RestClientException e) {
            throw new RegraNegocioException("Erro ao consultar a API OMDb: " + e.getMessage());
        }
    }
}