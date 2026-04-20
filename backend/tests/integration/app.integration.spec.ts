import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Testes de Integração - API Base', () => {

  it('deve retornar o status 404 quando tentamos aceder a uma rota que não existe', async () => {
    // Act: Simular um pedido GET do Frontend para uma rota inventada
    const response = await request(app).get('/api/rota-que-nao-existe');
    
    // Assert: Verificar se o Express devolveu corretamente o erro 404 Not Found
    expect(response.status).toBe(404);
  });

});
