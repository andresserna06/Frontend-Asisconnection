import {
  addRemovedContent,
  countPostsRemovedByAuthor,
  getAvatarPhotoUrl,
  isRemovedByAuthor,
  replaceAvatarPhoto,
} from './authorRemovalMarks';

const PHOTO = 'https://res.cloudinary.com/demo/avatar.jpg';
const POST_ID = '11111111-2222-4333-8444-555555555555';
const COMMENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

describe('authorRemovalMarks', () => {
  it('keeps the photo clean and recognizes what was removed', () => {
    const marked = addRemovedContent(PHOTO, 'post', POST_ID);

    expect(getAvatarPhotoUrl(marked)).toBe(PHOTO);
    expect(isRemovedByAuthor(marked, 'post', POST_ID)).toBe(true);
    expect(isRemovedByAuthor(marked, 'comment', POST_ID)).toBe(false);
    expect(isRemovedByAuthor(PHOTO, 'post', POST_ID)).toBe(false);
  });

  it('works for people without a photo', () => {
    const marked = addRemovedContent(null, 'comment', COMMENT_ID);

    expect(getAvatarPhotoUrl(marked)).toBeNull();
    expect(isRemovedByAuthor(marked, 'comment', COMMENT_ID)).toBe(true);
    expect(getAvatarPhotoUrl(null)).toBeNull();
  });

  it('counts only removed posts and does not repeat marks', () => {
    let marked = addRemovedContent(PHOTO, 'post', POST_ID);
    marked = addRemovedContent(marked, 'post', POST_ID);
    marked = addRemovedContent(marked, 'comment', COMMENT_ID);

    expect(countPostsRemovedByAuthor(marked)).toBe(1);
  });

  it('keeps the marks when the photo changes', () => {
    const marked = addRemovedContent(PHOTO, 'post', POST_ID);
    const changed = replaceAvatarPhoto(marked, 'https://res.cloudinary.com/demo/new.jpg');

    expect(getAvatarPhotoUrl(changed)).toBe('https://res.cloudinary.com/demo/new.jpg');
    expect(isRemovedByAuthor(changed, 'post', POST_ID)).toBe(true);
  });

  it('refuses a new mark when the field is full', () => {
    let marked: string | null = PHOTO;
    for (let index = 0; index < 60 && marked !== null; index += 1) {
      const next: string | null = addRemovedContent(marked, 'post', `${10000000 + index}`);
      if (next === null) {
        expect(marked.length).toBeLessThanOrEqual(500);
        return;
      }
      marked = next;
    }
    throw new Error('The field never filled up.');
  });
});
