import { resolveAuthorDisplayName } from './formatAuthorName';

describe('resolveAuthorDisplayName', () => {
  it('replaces the legacy Swagger placeholder "María Gómez" with the username when username is not maria', () => {
    expect(resolveAuthorDisplayName('María Gómez', 'molton')).toBe('molton');
    expect(resolveAuthorDisplayName('Maria Gomez', 'carlos.voluntario')).toBe('carlos.voluntario');
  });

  it('keeps "María Gómez" when the account username actually starts with maria', () => {
    expect(resolveAuthorDisplayName('María Gómez', 'maria.gomez')).toBe('María Gómez');
  });

  it('preserves real full names and falls back to username when display name is empty', () => {
    expect(resolveAuthorDisplayName('Alejandro Ramirez', 'admin.asisco')).toBe('Alejandro Ramirez');
    expect(resolveAuthorDisplayName('   ', 'milmol')).toBe('milmol');
    expect(resolveAuthorDisplayName(null, null)).toBe('Participante');
  });
});
