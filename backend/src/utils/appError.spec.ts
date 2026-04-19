import { describe, it, expect } from 'vitest';
import { AppError } from './appError';

describe('AppError Utility', () => {

  it('deve instanciar um AppError com a mensagem e o status code corretos', () => {
    // Arrange (Preparação)
    const mensagem = 'Recurso não encontrado';
    const statusCode = 404;

    // Act (Execução)
    const erro = new AppError(mensagem, statusCode);

    // Assert (Verificação)
    expect(erro).toBeInstanceOf(Error);
    expect(erro.message).toBe(mensagem);
    expect(erro.statusCode).toBe(statusCode);
  });

  it('deve usar o status code 500 por defeito se nenhum for fornecido', () => {
    // Act
    const erro = new AppError('Erro interno do servidor');

    // Assert
    expect(erro.message).toBe('Erro interno do servidor');
    expect(erro.statusCode).toBe(500); 
  });

});
