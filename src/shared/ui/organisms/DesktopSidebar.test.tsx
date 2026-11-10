import { fireEvent, render, screen } from '@testing-library/react-native';

import { DesktopSidebar, toDesktopNavRoute } from './DesktopSidebar';

describe('toDesktopNavRoute', () => {
  it.each([
    ['/', 'index'],
    ['/comments/post-1', 'index'],
    ['/posts/new', 'index'],
    ['/ecosystem', 'ecosystem'],
    ['/assistant', 'assistant'],
    ['/notifications', 'index'],
    ['/profile', 'profile'],
    ['/profile/settings', 'profile'],
    ['/admin', 'profile'],
  ])('maps %s to %s', (pathname, route) => {
    expect(toDesktopNavRoute(pathname)).toBe(route);
  });

  it('selects nothing on another person profile', () => {
    expect(toDesktopNavRoute('/users/actor-1')).toBeNull();
  });
});

describe('DesktopSidebar', () => {
  it('navigates, marks the active section and opens the post composer', async () => {
    const onNavigate = jest.fn();
    const onCreatePost = jest.fn();

    await render(
      <DesktopSidebar
        activeRoute="ecosystem"
        profileInitials="AS"
        onNavigate={onNavigate}
        onCreatePost={onCreatePost}
      />,
    );

    expect(screen.getByRole('link', { name: 'Ecosistema' })).toHaveProp('accessibilityState', {
      selected: true,
    });

    await fireEvent.press(screen.getByRole('link', { name: 'Asistente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Nueva publicación' }));

    expect(onNavigate).toHaveBeenCalledWith('assistant');
    expect(onCreatePost).toHaveBeenCalledTimes(1);
  });
});
