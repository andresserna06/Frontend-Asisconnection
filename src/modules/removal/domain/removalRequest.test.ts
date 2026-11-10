import { buildRemovalRequest, parseRemovalRequest } from './removalRequest';

const AUTHOR = { authorName: 'persona', authorProfileId: 'actor-1' };

describe('removal requests', () => {
  it('round-trips a post request', () => {
    const text = buildRemovalRequest({ kind: 'post', id: 'post-1', ...AUTHOR });

    expect(parseRemovalRequest(text)).toEqual({ kind: 'post' });
  });

  it('round-trips a comment request with its id', () => {
    const text = buildRemovalRequest({ kind: 'comment', id: 'c-1', postId: 'post-1', ...AUTHOR });

    expect(parseRemovalRequest(text)).toEqual({ kind: 'comment', commentId: 'c-1' });
  });

  it.each(['Un comentario normal', '#SOLICITUD-ELIMINAR comentario ', '#SOLICITUD-ELIMINAR otra'])(
    'does not treat "%s" as a request',
    (content) => {
      expect(parseRemovalRequest(content)).toBeNull();
    },
  );
});
